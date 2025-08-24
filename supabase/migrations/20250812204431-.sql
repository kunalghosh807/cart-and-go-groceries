-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);

-- Create policies for subcategories  
CREATE POLICY "Anyone can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage subcategories" ON public.subcategories FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default categories
INSERT INTO public.categories (name) VALUES 
  ('Grocerry & Kitchen'),
  ('Featured Products'),
  ('Snacks & Drinks'), 
  ('Beauty & Personal Care'),
  ('Today''s Deals');

-- Insert default subcategories
INSERT INTO public.subcategories (name, category_id) 
SELECT subcategory_name, c.id
FROM (
  VALUES 
    ('Vegetables & Fruits', 'Grocerry & Kitchen'),
    ('Atta, Rice & Dal', 'Grocerry & Kitchen'),
    ('Oil, Ghee & Masala', 'Grocerry & Kitchen'),
    ('Dairy, Bread & Eggs', 'Grocerry & Kitchen'),
    ('Bakery & Biscuits', 'Grocerry & Kitchen'),
    ('Dry Fruits & Cereals', 'Grocerry & Kitchen'),
    ('Chicken, Meat & Fish', 'Grocerry & Kitchen'),
    ('Kitchenware & Appliances', 'Grocerry & Kitchen'),
    ('Chips & Namkeen', 'Snacks & Drinks'),
    ('Sweets & Chocolates', 'Snacks & Drinks'),
    ('Drinks & Juices', 'Snacks & Drinks'),
    ('Tea, Coffee & Milk Drinks', 'Snacks & Drinks'),
    ('Instant Food', 'Snacks & Drinks'),
    ('Sauces & Spreads', 'Snacks & Drinks'),
    ('Paan Corner', 'Snacks & Drinks'),
    ('Cakes', 'Snacks & Drinks'),
    ('Bath & Body', 'Beauty & Personal Care'),
    ('Hair', 'Beauty & Personal Care'),
    ('Skin & Face', 'Beauty & Personal Care'),
    ('Beauty & Cosmetics', 'Beauty & Personal Care'),
    ('Feminine Hygiene', 'Beauty & Personal Care'),
    ('Baby Care', 'Beauty & Personal Care'),
    ('Health & Pharma', 'Beauty & Personal Care'),
    ('Sexual Wellness', 'Beauty & Personal Care')
) AS subcats(subcategory_name, category_name)
JOIN public.categories c ON c.name = subcats.category_name;

-- Create trigger for updating updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories  
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();