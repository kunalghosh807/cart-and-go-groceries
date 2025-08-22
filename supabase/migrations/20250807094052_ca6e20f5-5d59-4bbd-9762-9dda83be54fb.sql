-- Create products table for dynamic product management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_deal BOOLEAN DEFAULT FALSE,
  deal_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Orders policies (users can see their orders, create orders)
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view order items for their orders" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products to replace mock data
INSERT INTO public.products (name, price, image, category, subcategory, description, stock_quantity, is_featured, is_deal, deal_price) VALUES
-- Fruits
('Red Apples', 2.99, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', 'Fruits', 'Fresh Fruits', 'Fresh red apples', 50, true, false, null),
('Green Apples', 3.49, 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300', 'Fruits', 'Fresh Fruits', 'Crisp green apples', 30, false, true, 2.99),
('Bananas', 1.99, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300', 'Fruits', 'Fresh Fruits', 'Sweet yellow bananas', 100, true, false, null),
('Oranges', 3.99, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300', 'Fruits', 'Fresh Fruits', 'Juicy oranges', 40, false, false, null),

-- Vegetables  
('Fresh Carrots', 2.49, 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300', 'Vegetables', 'Fresh Vegetables', 'Organic carrots', 60, false, true, 1.99),
('Green Broccoli', 3.29, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300', 'Vegetables', 'Fresh Vegetables', 'Fresh broccoli heads', 25, false, false, null),
('Red Tomatoes', 4.99, 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300', 'Vegetables', 'Fresh Vegetables', 'Ripe red tomatoes', 35, true, false, null),

-- Dairy
('Whole Milk', 3.99, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', 'Dairy', 'Milk & Cream', 'Fresh whole milk 1L', 20, false, false, null),
('Greek Yogurt', 5.49, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300', 'Dairy', 'Yogurt', 'Creamy Greek yogurt', 15, false, true, 4.99),
('Cheddar Cheese', 6.99, 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=300', 'Dairy', 'Cheese', 'Aged cheddar cheese', 12, false, false, null);