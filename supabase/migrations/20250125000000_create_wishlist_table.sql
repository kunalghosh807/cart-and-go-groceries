-- Migration to create wishlist table
-- This table stores user wishlist items

-- Create wishlist table
CREATE TABLE public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate wishlist items
ALTER TABLE public.wishlist 
ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);

-- Create indexes for better performance
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX idx_wishlist_created_at ON public.wishlist(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view own wishlist items" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items" ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own wishlist items
CREATE POLICY "Users can update own wishlist items" ON public.wishlist
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items" ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wishlist_updated_at 
    BEFORE UPDATE ON public.wishlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();