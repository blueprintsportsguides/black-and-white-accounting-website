-- Fix "new row violates row-level security policy" for blog_posts
-- Run this in Supabase Dashboard → SQL Editor
--
-- Your frontend uses the anon key, so we must explicitly allow TO anon for INSERT/UPDATE/DELETE.

-- 1) Drop existing policies (avoid "already exists" errors)
DROP POLICY IF EXISTS "Allow all operations on posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations on post tags" ON blog_post_tags;

-- 2) blog_posts: allow anon + authenticated to SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Allow all operations on posts"
ON blog_posts FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3) blog_post_tags: required when saving a post with tags
CREATE POLICY "Allow all operations on post tags"
ON blog_post_tags FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
