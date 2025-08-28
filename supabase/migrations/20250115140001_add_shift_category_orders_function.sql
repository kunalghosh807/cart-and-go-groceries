-- Create function to shift category orders
CREATE OR REPLACE FUNCTION shift_category_orders(start_order INTEGER)
RETURNS void AS $$
BEGIN
  -- Shift all categories with order_number >= start_order by +1
  UPDATE public.categories 
  SET order_number = order_number + 1 
  WHERE order_number >= start_order;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION shift_category_orders(INTEGER) TO authenticated;