-- Add active status column to categories table
ALTER TABLE public.categories 
ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Add active status column to subcategories table
ALTER TABLE public.subcategories 
ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- Create index for better performance on active status queries
CREATE INDEX idx_categories_active ON public.categories(active);
CREATE INDEX idx_subcategories_active ON public.subcategories(active);

-- Create function to automatically deactivate subcategories when parent category is deactivated
CREATE OR REPLACE FUNCTION deactivate_subcategories_on_category_deactivation()
RETURNS TRIGGER AS $$
BEGIN
  -- If category is being deactivated, deactivate all its subcategories
  IF OLD.active = true AND NEW.active = false THEN
    UPDATE public.subcategories 
    SET active = false 
    WHERE category_id = NEW.id;
  END IF;
  
  -- If category is being activated, we don't automatically activate subcategories
  -- This allows for granular control over subcategory activation
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically handle subcategory deactivation
CREATE TRIGGER trigger_deactivate_subcategories
  AFTER UPDATE OF active ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION deactivate_subcategories_on_category_deactivation();

-- Update existing categories to be active by default (they should all be active initially)
UPDATE public.categories SET active = true WHERE active IS NULL;

-- Update existing subcategories to be active by default
UPDATE public.subcategories SET active = true WHERE active IS NULL;