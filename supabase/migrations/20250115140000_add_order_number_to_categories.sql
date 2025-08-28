-- Add order_number field to categories table
ALTER TABLE public.categories 
ADD COLUMN order_number INTEGER;

-- Create unique constraint on order_number to prevent duplicates
ALTER TABLE public.categories 
ADD CONSTRAINT categories_order_number_unique UNIQUE (order_number);

-- Update existing categories with order numbers based on their current order
WITH ordered_categories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.categories
)
UPDATE public.categories 
SET order_number = ordered_categories.rn
FROM ordered_categories 
WHERE public.categories.id = ordered_categories.id;

-- Make order_number NOT NULL after setting values
ALTER TABLE public.categories 
ALTER COLUMN order_number SET NOT NULL;

-- Create index for better performance on order_number queries
CREATE INDEX idx_categories_order_number ON public.categories(order_number);