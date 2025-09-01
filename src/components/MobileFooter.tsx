import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const MobileFooter = () => {
  const location = useLocation();
  const { cartItems, getItemsCount } = useCart();
  const cartItemCount = getItemsCount();

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/',
    },
    {
      name: 'Buy Again',
      icon: ShoppingBag,
      path: '/orders',
    },
    {
      name: 'You',
      icon: User,
      path: '/profile',
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1.5 py-1 md:hidden z-50">
      <div className="flex justify-evenly items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-0.5 px-0.5 relative min-w-0 flex-1 ${
                isActive ? 'text-grocery-primary' : 'text-gray-500'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="h-3.5 w-3.5" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-normal mt-0.5 text-center leading-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooter;