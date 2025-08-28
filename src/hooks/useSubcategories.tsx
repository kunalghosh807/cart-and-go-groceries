import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  image?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

export const useSubcategories = (includeInactive: boolean = false) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('subcategories')
        .select(`
          *,
          categories (
            id,
            name
          )
        `);
      
      // Filter by active status unless includeInactive is true
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error loading subcategories:', error);
        setError('Failed to load subcategories');
      } else {
        setSubcategories(data || []);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setError('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubcategories();
    
    // Set up real-time subscription for subcategories
    const subcategoriesChannel = supabase
      .channel('subcategories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subcategories' },
        () => {
          loadSubcategories();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          // Refresh when categories change (for updated category names)
          loadSubcategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subcategoriesChannel);
    };
  }, [includeInactive]);

  const refreshSubcategories = () => {
    loadSubcategories();
  };

  return {
    subcategories,
    loading,
    error,
    refreshSubcategories
  };
};