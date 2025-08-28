-- Migration to fix products table schema
-- Add category_id and subcategory_id foreign keys to products table

-- Step 1: Add new columns
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.categories(id),
ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id);

-- Step 2: Update existing products to use proper foreign keys
-- First, fix category name mismatches
UPDATE public.products SET category = 'Grocerry & Kitchen' WHERE category = 'Grocery';
UPDATE public.products SET category = 'Beauty & Personal Care' WHERE category = 'Beauty & Personal C';
UPDATE public.products SET category = 'Grocerry & Kitchen' WHERE category = 'Fruits';
UPDATE public.products SET category = 'Grocerry & Kitchen' WHERE category = 'Vegetables';
UPDATE public.products SET category = 'Grocerry & Kitchen' WHERE category = 'Dairy';

-- Update category_id based on existing category text
UPDATE public.products 
SET category_id = c.id 
FROM public.categories c 
WHERE products.category = c.name;

-- For any products that still don't have a category_id, assign them to 'Grocerry & Kitchen'
UPDATE public.products 
SET category_id = c.id 
FROM public.categories c 
WHERE products.category_id IS NULL AND c.name = 'Grocerry & Kitchen';

-- Update subcategory_id based on existing subcategory text
UPDATE public.products 
SET subcategory_id = s.id 
FROM public.subcategories s 
WHERE products.subcategory = s.name;

-- Step 3: Make category_id NOT NULL (required field)
ALTER TABLE public.products 
ALTER COLUMN category_id SET NOT NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_subcategory_id ON public.products(subcategory_id);

-- Step 5: Drop old text columns (commented out for safety - can be done later)
-- ALTER TABLE public.products DROP COLUMN category;
-- ALTER TABLE public.products DROP COLUMN subcategory;

-- Note: We keep the old columns for now to ensure backward compatibility
-- They can be dropped in a future migration after all code is updated