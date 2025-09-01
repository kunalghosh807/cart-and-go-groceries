import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success(`${productName} removed from wishlist`);
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length > 0 
                ? `${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} saved`
                : 'Save items you love'
              }
            </p>
          </div>
        </div>

        {/* Wishlist Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grocery-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Save items you love by clicking the heart icon on products</p>
              <Button onClick={() => navigate('/')} className="bg-grocery-primary hover:bg-grocery-primary/90">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="p-0 relative">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={item.product.image || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                    onClick={() => handleRemoveFromWishlist(item.product.id, item.product.name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm md:text-base">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.product.category || 'Grocery'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-grocery-primary">
                          ₹{item.product.price.toFixed(2)}
                        </span>
                        {item.product.original_price && item.product.original_price > item.product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{item.product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.product.stock > 0 ? (
                        <span className="text-xs text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(item.product)}
                        disabled={item.product.stock === 0}
                        className="flex-1 bg-grocery-primary hover:bg-grocery-primary/90 text-white"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>

                    {/* Additional Info */}
                    {item.product.unit && (
                      <p className="text-xs text-gray-500">
                        Unit: {item.product.unit}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                wishlistItems.forEach(item => {
                  if (item.product.stock > 0) {
                    handleAddToCart(item.product);
                  }
                });
                toast.success('Available items added to cart!');
              }}
              className="flex-1 sm:flex-none"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add All to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist;