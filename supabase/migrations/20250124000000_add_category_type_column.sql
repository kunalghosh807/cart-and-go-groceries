-- Add category_type column to categories table
ALTER TABLE categories 
ADD COLUMN category_type VARCHAR(50) DEFAULT 'empty_category';

-- Add comment to explain the column
COMMENT ON COLUMN categories.category_type IS 'Type of category: empty_category, productcard_category, or subcategory_category';

-- Create index for better query performance
CREATE INDEX idx_categories_category_type ON categories(category_type);