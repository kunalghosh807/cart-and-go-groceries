-- Add video_url field to banners table
ALTER TABLE banners ADD COLUMN video_url TEXT;

-- Add constraint to ensure either image_url or video_url is provided, but not both
ALTER TABLE banners ADD CONSTRAINT check_image_or_video 
  CHECK (
    (image_url IS NOT NULL AND video_url IS NULL) OR 
    (image_url IS NULL AND video_url IS NOT NULL)
  );

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT check_image_or_video ON banners IS 'Ensures that either image_url or video_url is provided, but not both';