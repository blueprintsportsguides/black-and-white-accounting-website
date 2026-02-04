-- Supabase Storage RLS policies for blog image uploads
-- Run this in Supabase Dashboard → SQL Editor
--
-- Prerequisites: In Storage, create a bucket named "blog-images" and set it to Public.
--
-- If you already have policies with these names, run the DROP lines below first, then run the CREATE POLICY blocks.

-- Optional: drop existing policies if you get "already exists" errors:
-- DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow uploads to blog-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow update blog images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow delete blog images" ON storage.objects;

-- 1. Allow anyone to read (view) images from blog-images bucket
CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- 2. Allow anon and authenticated to upload to blog-images (fixes "new row violates row-level security policy")
CREATE POLICY "Allow uploads to blog-images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'blog-images');

-- 3. Optional: allow update/delete so uploads can be overwritten or removed
CREATE POLICY "Allow update blog images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow delete blog images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'blog-images');
