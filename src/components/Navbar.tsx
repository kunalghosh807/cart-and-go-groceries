
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';

const Navbar = () => {
  const { cartItems } = useCart();
  
  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-grocery-primary">Cart&Go</span>
            </Link>
          </div>
          
          {/* Search bar - visible on larger screens */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for items..."
                className="pl-10 py-2 w-full"
              />
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/categories" className="text-gray-600 hover:text-grocery-primary px-3 py-2 text-sm font-medium">
              Categories
            </Link>
            <Link to="/deals" className="text-gray-600 hover:text-grocery-primary px-3 py-2 text-sm font-medium">
              Deals
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-grocery-primary">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-grocery-primary" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-grocery-accent text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </Badge>
              )}
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-grocery-accent text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </Badge>
              )}
            </Link>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Search bar - visible only on mobile */}
        <div className="md:hidden py-2 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for items..."
              className="pl-10 py-2 w-full"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
