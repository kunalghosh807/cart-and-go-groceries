import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/hooks/useCart';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: Product;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load wishlist items
  const loadWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Loading wishlist for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Wishlist table error:', error);
        // If table doesn't exist, try localStorage fallback
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('Could not find the table')) {
          console.log('Wishlist table not found, using localStorage fallback');
          const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
          console.log('Local wishlist items:', localWishlist);
          const wishlistWithProducts = [];
          
          for (const productId of localWishlist) {
            try {
              const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
              
              if (product) {
                wishlistWithProducts.push({
                  id: Date.now().toString() + Math.random(),
                  user_id: user.id,
                  product_id: productId,
                  created_at: new Date().toISOString(),
                  product: product
                });
              }
            } catch (productError) {
              console.error('Error loading product:', productError);
            }
          }
          
          console.log('Loaded wishlist items from localStorage:', wishlistWithProducts);
          setWishlistItems(wishlistWithProducts);
          setLoading(false);
          return;
        }
        setWishlistItems([]);
        return;
      }

      console.log('Loaded wishlist items from database:', data);
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      // First, try to create the wishlist table if it doesn't exist
      await supabase.rpc('create_wishlist_table_if_not_exists');
    } catch (createError) {
      // If RPC fails, try direct table creation
      try {
        await supabase
          .from('wishlist')
          .select('id')
          .limit(1);
      } catch (tableError: any) {
        if (tableError.code === 'PGRST116' || tableError.code === 'PGRST205' || tableError.message?.includes('Could not find the table') || tableError.message?.includes('does not exist')) {
          // Table doesn't exist, use localStorage as fallback
          const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
          if (localWishlist.includes(productId)) {
            throw new Error('Item already in wishlist');
          }
          localWishlist.push(productId);
          localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(localWishlist));
          
          // Fetch product data to add to state
          try {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', productId)
              .single();
            
            if (product) {
              setWishlistItems(prev => [...prev, { 
                id: Date.now().toString() + Math.random(), 
                user_id: user.id, 
                product_id: productId, 
                created_at: new Date().toISOString(),
                product: product
              }]);
            }
          } catch (productError) {
            console.error('Error fetching product for wishlist:', productError);
          }
          return;
        }
      }
    }

    try {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        throw new Error('Item already in wishlist');
      }

      // Add to wishlist
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        // If table still doesn't exist, use localStorage fallback
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('Could not find the table') || error.message?.includes('does not exist')) {
          const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
          if (localWishlist.includes(productId)) {
            throw new Error('Item already in wishlist');
          }
          localWishlist.push(productId);
          localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(localWishlist));
          
          // Fetch product data to add to state
          try {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', productId)
              .single();
            
            if (product) {
              setWishlistItems(prev => [...prev, { 
                id: Date.now().toString() + Math.random(), 
                user_id: user.id, 
                product_id: productId, 
                created_at: new Date().toISOString(),
                product: product
              }]);
            }
          } catch (productError) {
            console.error('Error fetching product for wishlist:', productError);
          }
          return;
        }
        throw error;
      }

      // Reload wishlist
      await loadWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        // If table doesn't exist, use localStorage fallback
        if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('Could not find the table') || error.message?.includes('does not exist')) {
          const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
          const updatedWishlist = localWishlist.filter((id: string) => id !== productId);
          localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));
          setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
          return;
        }
        throw error;
      }

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string) => {
    // Check both database items and localStorage fallback
    const inDatabase = wishlistItems.some(item => item.product_id === productId);
    if (inDatabase) return true;
    
    // Check localStorage as fallback
    if (user) {
      const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
      return localWishlist.includes(productId);
    }
    
    return false;
  };

  // Toggle wishlist item
  const toggleWishlist = async (productId: string) => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        return false;
      } else {
        await addToWishlist(productId);
        return true;
      }
    } catch (error) {
      throw error;
    }
  };

  // Load wishlist on user change
  useEffect(() => {
    loadWishlist();
  }, [user]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    loadWishlist
  };
};