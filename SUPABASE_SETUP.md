# Supabase Setup Guide

## Overview

This guide will help you set up Supabase as the centralized storage for your blog system. This replaces localStorage and allows blog posts to work across all devices.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Note your project URL and anon key from Settings > API

## Step 2: Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    legacy_wp_id TEXT,
    legacy_wp_url TEXT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    author_name TEXT,
    category_id TEXT,
    featured_image_url TEXT,
    featured_image_alt TEXT,
    meta_title TEXT,
    meta_description TEXT,
    reading_time_minutes INTEGER DEFAULT 5
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_post_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
    post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id TEXT REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Public can read tags" ON blog_tags
    FOR SELECT USING (true);

CREATE POLICY "Public can read post tags" ON blog_post_tags
    FOR SELECT USING (true);

-- Create policies for admin access (you'll need to set up authentication)
-- For now, we'll use service role key in serverless functions
-- Or you can create a simple admin authentication system
```

## Step 3: Set Up Image Storage (Optional)

If you want to upload images through the admin:

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `blog-images`
3. Set it to public
4. Add policies (run in SQL Editor if needed; or use Storage → Policies in the dashboard):
   ```sql
   -- Public read
   CREATE POLICY "Public can read blog images" ON storage.objects
       FOR SELECT USING (bucket_id = 'blog-images');
   -- Allow uploads (anon or authenticated; restrict to auth-only in production)
   CREATE POLICY "Allow uploads to blog-images" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id = 'blog-images');
   ```
   The admin uses the `blog/` folder inside `blog-images` for uploads.

## Step 4: Configure Environment Variables

Add these to your Vercel project settings (or create `.env.local` for local development):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**For Admin Access:**
You'll also need a service role key for admin operations. Store this securely and use it in serverless functions:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 5: Deploy

1. Push your code to git
2. Vercel will automatically deploy
3. Add the environment variables in Vercel dashboard
4. Your blog will now use Supabase!

## Migration from JSON

To migrate existing blog posts from `data/blog-posts.json`:

1. Use the admin interface "Import from JSON" feature
2. Or run a migration script (we can create this if needed)

## Security Notes

- The anon key is safe to expose in client-side code
- Use service role key only in serverless functions
- RLS policies ensure only published posts are public
- Admin operations should be authenticated

## Troubleshooting

- **Posts not loading**: Check Supabase URL and keys are correct
- **Can't save posts**: Verify RLS policies allow admin operations
- **Images not uploading**: Check storage bucket permissions
