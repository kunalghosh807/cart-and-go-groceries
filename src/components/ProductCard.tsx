
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/hooks/useCart';
import { Plus, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to cart functionality can be implemented here
  };

  // Calculate discount percentage
  const discountPercentage = product.deal_price && product.deal_price < product.price 
    ? Math.round(((product.price - product.deal_price) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 w-full max-w-[160px] relative">
      {/* Product Image */}
      <div 
        className="cursor-pointer mb-2"
        onClick={handleClick}
      >
        <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {/* Add Button */}
          <button
            onClick={handleAddClick}
            className="absolute top-2 right-2 w-6 h-6 bg-white rounded border border-orange-400 flex items-center justify-center shadow-sm hover:bg-orange-50 transition-colors"
          >
            <Plus className="w-3 h-3 text-orange-500" />
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm font-medium text-gray-800">4.4</span>
        <Star className="w-3 h-3 fill-green-500 text-green-500" />
      </div>

      {/* Product Size/Weight */}
      <div className="text-xs text-gray-500 mb-2">
        5 kg
      </div>

      {/* Product Name */}
      <h3 
        className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 cursor-pointer"
        onClick={handleClick}
      >
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
