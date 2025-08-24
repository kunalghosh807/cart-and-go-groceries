-- Add missing columns to addresses table
ALTER TABLE public.addresses 
ADD COLUMN phone TEXT,
ADD COLUMN is_default BOOLEAN DEFAULT false;

-- Create index for faster queries on default addresses
CREATE INDEX idx_addresses_user_default ON public.addresses(user_id, is_default) WHERE is_default = true;

-- Add constraint to ensure only one default address per user
CREATE UNIQUE INDEX idx_addresses_one_default_per_user 
ON public.addresses(user_id) 
WHERE is_default = true;