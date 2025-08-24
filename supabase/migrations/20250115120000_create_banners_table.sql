-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on order_index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_banners_order_index ON public.banners(order_index);

-- Create index on is_active for filtering active banners
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all operations for authenticated users" ON public.banners
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy to allow read access for anonymous users (public viewing)
CREATE POLICY "Allow read access for anonymous users" ON public.banners
    FOR SELECT USING (true);

-- Insert default banners
INSERT INTO public.banners (title, subtitle, image, order_index, is_active) VALUES
('Fresh Fruits & Vegetables', 'Farm-fresh produce delivered to your door', '/src/assets/banner-1.jpg', 1, true),
('Artisan Bakery', 'Freshly baked breads and pastries daily', '/src/assets/banner-2.jpg', 2, true),
('Premium Dairy & Meat', 'Quality proteins and dairy products', '/src/assets/banner-3.jpg', 3, true),
('Organic & Healthy', 'Natural products for a healthier lifestyle', '/src/assets/banner-4.jpg', 4, true)
ON CONFLICT DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();