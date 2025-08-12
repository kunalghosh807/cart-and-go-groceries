import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const loadSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('name');
      
      if (error) throw error;
      setSubcategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadCategories();
      await loadSubcategories();
    };
    loadData();
  }, []);

  const getSubcategoriesForCategory = (categoryName: string) => {
    return subcategories.filter(sub => sub.categories?.name === categoryName);
  };

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name === name);
  };

  return {
    categories,
    subcategories,
    loading,
    error,
    getSubcategoriesForCategory,
    getCategoryByName,
    refetch: async () => {
      await loadCategories();
      await loadSubcategories();
    }
  };
};