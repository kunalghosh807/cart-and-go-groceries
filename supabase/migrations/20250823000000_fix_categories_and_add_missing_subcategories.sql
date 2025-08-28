-- Fix category name mismatch and add missing subcategories

-- First, fix the Beauty & Personal Care category name
UPDATE public.categories 
SET name = 'Beauty & Personal Care'
WHERE name = 'Beauty & Personal C';

-- Insert missing subcategories for Grocerry & Kitchen
INSERT INTO public.subcategories (name, category_id)
SELECT subcategory_name, c.id
FROM (
  VALUES 
    ('Dry Fruits & Cereals', 'Grocerry & Kitchen'),
    ('Chicken, Meat & Fish', 'Grocerry & Kitchen'),
    ('Kitchenware & Appliances', 'Grocerry & Kitchen')
) AS new_subcats(subcategory_name, category_name)
JOIN public.categories c ON c.name = new_subcats.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.subcategories s 
  WHERE s.name = new_subcats.subcategory_name AND s.category_id = c.id
);

-- Insert missing subcategories for Snacks & Drinks
INSERT INTO public.subcategories (name, category_id)
SELECT subcategory_name, c.id
FROM (
  VALUES 
    ('Sweets & Chocolates', 'Snacks & Drinks'),
    ('Drinks & Juices', 'Snacks & Drinks'),
    ('Tea, Coffee & Milk Drinks', 'Snacks & Drinks'),
    ('Instant Food', 'Snacks & Drinks'),
    ('Sauces & Spreads', 'Snacks & Drinks'),
    ('Paan Corner', 'Snacks & Drinks'),
    ('Cakes', 'Snacks & Drinks')
) AS new_subcats(subcategory_name, category_name)
JOIN public.categories c ON c.name = new_subcats.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.subcategories s 
  WHERE s.name = new_subcats.subcategory_name AND s.category_id = c.id
);

-- Insert missing subcategories for Beauty & Personal Care
INSERT INTO public.subcategories (name, category_id)
SELECT subcategory_name, c.id
FROM (
  VALUES 
    ('Hair', 'Beauty & Personal Care'),
    ('Skin & Face', 'Beauty & Personal Care'),
    ('Beauty & Cosmetics', 'Beauty & Personal Care'),
    ('Feminine Hygiene', 'Beauty & Personal Care'),
    ('Baby Care', 'Beauty & Personal Care'),
    ('Health & Pharma', 'Beauty & Personal Care'),
    ('Sexual Wellness', 'Beauty & Personal Care')
) AS new_subcats(subcategory_name, category_name)
JOIN public.categories c ON c.name = new_subcats.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.subcategories s 
  WHERE s.name = new_subcats.subcategory_name AND s.category_id = c.id
);

-- Update existing subcategory names to match mock data
UPDATE public.subcategories 
SET name = 'Tea, Coffee & Milk Drinks'
WHERE name = 'Tea, Coffee & Health Drinks';

UPDATE public.subcategories 
SET name = 'Sweets & Chocolates'
WHERE name = 'Chocolates & Candies';

UPDATE public.subcategories 
SET name = 'Drinks & Juices'
WHERE name = 'Cold Drinks & Juices';

-- Remove test categories that shouldn't be there
DELETE FROM public.categories WHERE name IN ('Dipa', 'Kunal', 'Ritun');

-- Add comment
COMMENT ON TABLE public.subcategories IS 'Subcategories table synced with homepage mock data for consistent display';