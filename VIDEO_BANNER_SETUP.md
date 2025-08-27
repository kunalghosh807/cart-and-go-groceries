# Video Banner Setup Instructions

This guide explains how to enable video banner functionality in your Busskit application.

## Current Status

✅ **Frontend Implementation**: Complete - Video banner UI and display logic are fully implemented
❌ **Database Migration**: Pending - The `video_url` column needs to be added to the `banners` table

## Error You're Seeing

```
Video feature not available
Video banners require database migration. Please use image banners for now.
```

This error occurs because the `video_url` column doesn't exist in your `banners` table yet.

## How to Fix

### Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to the "SQL Editor" section

2. **Run the Migration SQL**
   - Copy the contents of `apply_video_migration.sql` (created in your project root)
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Migration**
   - Go to "Table Editor" → "banners" table
   - You should see a new `video_url` column

### Option 2: Apply Migration via Supabase CLI (If Docker is Available)

1. **Install Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Start Docker Desktop

2. **Link Your Project**
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Apply Migration**
   ```bash
   npx supabase db push
   ```

## What the Migration Does

1. **Adds `video_url` column** to the `banners` table
2. **Adds constraint** to ensure either `image_url` OR `video_url` is provided (not both)
3. **Maintains data integrity** for existing image banners

## After Migration

Once the migration is applied:

1. **Video banners will work immediately** - No code changes needed
2. **Users can add video URLs** in the Banner Management interface
3. **Videos will display** with autoplay, loop, and Ken Burns effect
4. **Form validation** prevents users from adding both image and video URLs

## Video Requirements

- **Format**: MP4 recommended
- **Hosting**: Use a reliable CDN or hosting service
- **Size**: Optimize for web (recommended < 10MB)
- **Dimensions**: 16:9 aspect ratio works best

## Testing Video Banners

1. Go to `/admin` → "Banner Management"
2. Click "Add Banner"
3. Enter a video URL (e.g., `https://example.com/video.mp4`)
4. Save the banner
5. Check the homepage to see the video banner

## Troubleshooting

- **Still seeing errors?** Verify the migration was applied successfully
- **Video not playing?** Check the video URL is accessible and in MP4 format
- **CORS errors?** Ensure your video hosting service allows cross-origin requests

## Support

If you need help applying the migration, please:
1. Check your Supabase project settings
2. Verify you have admin access to the database
3. Contact your database administrator if needed