
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart, Product } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  
  // Find if this product is already in cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col w-48 max-w-48">
      <div className="relative pt-[30%]">
        <img
          src={product.image}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-3 flex-grow">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-base font-bold text-grocery-primary">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        {quantityInCart === 0 ? (
          <Button 
            size="sm"
            className="w-full bg-grocery-primary hover:bg-grocery-dark text-white"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => updateQuantity(product.id, quantityInCart - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-medium text-sm px-2">{quantityInCart}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => updateQuantity(product.id, quantityInCart + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
