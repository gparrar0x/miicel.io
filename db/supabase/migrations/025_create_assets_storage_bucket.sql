-- Migration 025: Create assets storage bucket for tenant logos and banners
-- Date: 2025-01-17
-- Author: Mentat
-- Purpose: Create public storage bucket for SuperHotDog and other tenant assets

-- Create the assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,  -- Public bucket for serving assets via CDN
  10485760,  -- 10MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON storage.objects;

-- Create RLS policy for public read access
CREATE POLICY "Public read access for assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Create RLS policy for authenticated upload
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Create RLS policy for authenticated update
CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Create RLS policy for authenticated delete
CREATE POLICY "Authenticated users can delete assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assets' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Verify
SELECT * FROM storage.buckets WHERE id = 'assets';
