import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useCart';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allProducts = (data || []).map(p => ({
        ...p,
        quantity: 0,
        deal_price: p.deal_price || undefined,
        subcategory: p.subcategory || undefined,
        description: p.description || undefined
      }));
      setProducts(allProducts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getProductsByCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  };

  const getProductsBySubcategory = async (subcategoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('subcategory_id', subcategoryId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products by subcategory:', error);
      return [];
    }
  };

  const searchProducts = (query: string) => {
    const searchTerm = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm) ||
      p.subcategory?.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm)
    );
  };

  return {
    products,
    loading,
    error,
    getProductsByCategory,
    getProductsBySubcategory,
    searchProducts,
    refetch: loadProducts
  };
};