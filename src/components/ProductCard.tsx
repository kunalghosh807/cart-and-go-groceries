
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, useCart } from '@/hooks/useCart';
import { Plus, Star, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem = cartItems.find(item => item.id === product.id);
    if (cartItem) {
      updateQuantity(product.id.toString(), cartItem.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem = cartItems.find(item => item.id === product.id);
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(product.id.toString(), cartItem.quantity - 1);
    } else if (cartItem && cartItem.quantity === 1) {
      updateQuantity(product.id.toString(), 0);
    }
  };

  // Get quantity in cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Calculate discount percentage
  const discountPercentage = product.deal_price && product.deal_price < product.price 
    ? Math.round(((product.price - product.deal_price) / product.price) * 100)
    : 0;

  // Generate dynamic rating based on product characteristics
  const generateRating = (product: Product) => {
    const hash = product.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const rating = 3.5 + (Math.abs(hash) % 15) / 10; // Range: 3.5 - 4.9
    return rating.toFixed(1);
  };

  // Generate dynamic weight/size based on product characteristics (fallback)
  const generateWeightSize = (product: Product) => {
    const weights = ['250 g', '500 g', '1 kg', '2 kg', '5 kg', '1 L', '2 L', '500 ml', '1 piece', '6 pieces'];
    const hash = (product.name + product.category).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return weights[Math.abs(hash) % weights.length];
  };

  // Get actual weight and unit from database, fallback to generated values
  const getProductWeightDisplay = (product: Product) => {
    if (product.weight && product.unit) {
      return `${product.weight} ${product.unit}`;
    }
    return generateWeightSize(product);
  };

  const dynamicRating = generateRating(product);
  const weightDisplay = getProductWeightDisplay(product);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 w-full max-w-[160px] relative cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="mb-2">
        <div className="aspect-square w-full rounded-lg overflow-hidden relative" style={{backgroundColor: '#F5F5F5'}}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
          {/* Add/Quantity Controls */}
          {quantityInCart === 0 ? (
            <button
              onClick={handleAddClick}
              className="absolute bottom-1 right-1 w-6 h-6 bg-grocery-primary rounded border border-grocery-primary flex items-center justify-center shadow-sm hover:bg-grocery-primary/90 transition-colors"
            >
              <Plus className="w-3 h-3 text-white" />
            </button>
          ) : (
            <div className="absolute bottom-1 right-1 flex items-center bg-white rounded border border-grocery-primary shadow-sm">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l"
              >
                <Minus className="w-3 h-3 text-grocery-primary" />
              </button>
              <span className="px-2 text-xs font-medium text-grocery-primary min-w-[20px] text-center">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r"
              >
                <Plus className="w-3 h-3 text-grocery-primary" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm font-medium text-gray-800">{dynamicRating}</span>
        <Star className="w-3 h-3 fill-green-500 text-green-500" />
      </div>

      {/* Product Size/Weight */}
      <div className="text-xs text-gray-500 mb-2">
        {weightDisplay}
      </div>

      {/* Product Name */}
      <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
        {product.name}
      </h3>

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="text-xs font-semibold text-green-600 mb-2">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Price Section */}
      <div className="flex items-center gap-2">
        {product.deal_price && product.deal_price < product.price ? (
          <>
            <div className="bg-yellow-400 px-2 py-1 rounded text-sm font-bold text-black">
              ₹{product.deal_price.toFixed(0)}
            </div>
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price.toFixed(0)}
            </span>
          </>
        ) : (
          <div className="bg-yellow-400 px-2 py-1 rounded text-sm font-bold text-black">
            ₹{product.price.toFixed(0)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
