import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  order_number?: number;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategories = (includeInactive: boolean = false) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to order by order_number to check if column exists
      let query = supabase
        .from('categories')
        .select('*');
      
      // Filter by active status unless includeInactive is true
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query
        .order('order_number', { ascending: true });
      
      if (error && error.code === '42703') {
        // Column doesn't exist, fallback to ordering by name
        let fallbackQuery = supabase
          .from('categories')
          .select('*');
        
        // Filter by active status unless includeInactive is true
        if (!includeInactive) {
          fallbackQuery = fallbackQuery.eq('active', true);
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
          .order('name', { ascending: true });
        
        if (fallbackError) {
          console.error('Error loading categories:', fallbackError);
          setError('Failed to load categories');
        } else {
          setCategories(fallbackData || []);
        }
      } else if (error) {
        console.error('Error loading categories:', error);
        setError('Failed to load categories');
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    
    // Set up real-time subscription for categories
    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          loadCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
    };
  }, [includeInactive]);

  const refreshCategories = () => {
    loadCategories();
  };

  return {
    categories,
    loading,
    error,
    refreshCategories
  };
};