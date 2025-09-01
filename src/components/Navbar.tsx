
import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, Package, MapPin, Heart, CreditCard, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { cartItems, getItemsCount } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on profile page for mobile layout
  const isProfilePage = location.pathname === '/profile';
  
  // Check if we're on home page to show Busskit name and search bar
  const isHomePage = location.pathname === '/';

  const { products } = useProducts();
  
  // Get all products for suggestions
  const allProducts = products;
  
  // Memoize cart items count to prevent infinite re-renders
  const cartItemsCount = useMemo(() => getItemsCount(), [cartItems]);
  
  // Memoize filtered suggestions to prevent infinite re-renders
  const filteredSuggestions = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  }, [allProducts, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (product: any) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(product.name)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  if (!isHomePage) {
    return null;
  }

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and name */}
          <div className={`flex-shrink-0 flex items-center ${isProfilePage ? 'hidden md:flex' : ''}`}>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-grocery-primary">Busskit</span>
            </Link>
          </div>
          
          {/* Search bar - visible on larger screens */}
          <div className="hidden md:block flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for items..."
                className="pl-10 py-2 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                <ul className="py-2">
                  {filteredSuggestions.map((product) => (
                    <li key={product.id}>
                      <button
                        onClick={() => selectSuggestion(product)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category}</div>
                        </div>
                        <div className="ml-auto text-sm font-bold text-grocery-primary">
                          ₹{product.price.toFixed(2)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* User Account Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saved-addresses')}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Addresses
                  </DropdownMenuItem>
                  {user?.email === 'kunalghosh807@yahoo.com' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
            
            {/* Styled Cart Button */}
            <Link to="/cart" className="relative">
              <Button className="bg-grocery-primary hover:bg-grocery-primary/90 text-white px-4 py-2">
                <ShoppingCart className="h-4 w-4 mr-2" />
                My Cart
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-grocery-accent text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
          

        </div>
        
        {/* Search bar - visible only on mobile */}
        <div className={`md:hidden py-2 pb-4 relative ${isProfilePage ? 'hidden' : ''}`}>
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for items..."
              className="pl-10 py-2 w-full"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </form>
          
          {/* Mobile Search Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
              <ul className="py-2">
                {filteredSuggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      onClick={() => selectSuggestion(product)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </div>
                      <div className="ml-auto text-sm font-bold text-grocery-primary">
                        ₹{product.price.toFixed(2)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
