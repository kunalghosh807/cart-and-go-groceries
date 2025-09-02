-- Migration to add weight and unit columns to products table
-- Add weight and unit fields for product specifications

-- Add weight column (nullable decimal for weight value)
ALTER TABLE public.products 
ADD COLUMN weight DECIMAL(10,2);

-- Add unit column (nullable text for unit type like 'g', 'kg', 'ml', 'l', 'pcs', 'pack')
ALTER TABLE public.products 
ADD COLUMN unit TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.products.weight IS 'Product weight/quantity value';
COMMENT ON COLUMN public.products.unit IS 'Unit of measurement (g, kg, ml, l, pcs, pack)';

-- Create index for better performance when filtering by unit
CREATE INDEX idx_products_unit ON public.products(unit);