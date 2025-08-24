-- Create RLS policies for password_reset_otps table
-- Since this table is managed by edge functions and contains sensitive OTP data,
-- we'll restrict direct user access completely

-- Policy to prevent any direct user access to OTP table
CREATE POLICY "No direct user access to OTPs" 
ON public.password_reset_otps 
FOR ALL 
USING (false);