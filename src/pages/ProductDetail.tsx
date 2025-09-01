import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Heart, ArrowLeft } from 'lucide-react';
import { useCart, Product } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/')} className="bg-grocery-primary hover:bg-grocery-primary/90">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    try {
      const added = await toggleWishlist(product.id);
      toast.success(added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`);
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">Product Details</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover ${
                    product.stock_quantity === 0 ? 'filter grayscale' : ''
                  }`}
                />
                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-4 right-4 h-10 w-10 p-0 rounded-full shadow-lg transition-all duration-200 ${
                    inWishlist 
                      ? 'bg-red-50 hover:bg-red-100 text-red-500' 
                      : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500'
                  }`}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
                <p className="text-3xl md:text-4xl font-bold text-grocery-primary mb-6">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock_quantity === 0 ? (
                  <p className="text-red-500 font-medium">Out of Stock</p>
                ) : (
                  <p className="text-green-600 font-medium">
                    {product.stock_quantity} items in stock
                  </p>
                )}
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4">
                {product.stock_quantity === 0 ? (
                  <Button 
                    size="lg"
                    className="w-full bg-gray-400 text-white cursor-not-allowed"
                    disabled
                  >
                    Out of Stock
                  </Button>
                ) : quantityInCart === 0 ? (
                  <Button 
                    size="lg"
                    className="w-full bg-grocery-primary hover:bg-grocery-primary/90 text-white"
                    onClick={() => {
                      addToCart(product);
                      toast.success(`${product.name} added to cart`);
                    }}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-12 p-0"
                        onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <span className="text-xl font-semibold px-4">{quantityInCart}</span>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-12 p-0"
                        onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-center text-gray-600">
                      {quantityInCart} item{quantityInCart > 1 ? 's' : ''} in cart
                    </p>
                  </div>
                )}
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;