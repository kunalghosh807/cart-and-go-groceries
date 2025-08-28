import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  order_number?: number;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to order by order_number to check if column exists
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error && error.code === '42703') {
        // Column doesn't exist, fallback to ordering by name
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('categories')
          .select('*')
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
  }, []);

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