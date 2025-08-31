import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Grid3X3, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const MobileFooter = () => {
  const location = useLocation();
  const { items } = useCart();
  const cartItemCount = items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/',
    },
    {
      name: 'Order Again',
      icon: ShoppingBag,
      path: '/orders',
    },
    {
      name: 'Categories',
      icon: Grid3X3,
      path: '/categories',
    },
    {
      name: 'Cart',
      icon: ShoppingCart,
      path: '/cart',
      badge: cartItemCount > 0 ? cartItemCount : null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 relative ${
                isActive ? 'text-grocery-primary' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooter;