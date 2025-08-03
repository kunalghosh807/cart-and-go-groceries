
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface CartContextType {
  cartItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Product[]>(() => {
    // Load cart from localStorage on initialization
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      // Check if the product is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      let newItems;
      if (existingItemIndex !== -1) {
        // If item exists, update its quantity
        newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        toast({
          title: "Quantity updated",
          description: `${product.name} quantity increased to ${newItems[existingItemIndex].quantity}`
        });
      } else {
        // Add new item with quantity of 1
        newItems = [...prevItems, { ...product, quantity: 1 }];
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart`
        });
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.name} removed from your cart`
        });
      }
      const newItems = prevItems.filter(item => item.id !== productId);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) => {
      const newItems = prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart"
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getTotalPrice,
      getItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
