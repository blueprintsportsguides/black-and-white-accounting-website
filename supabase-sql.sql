-- Copy and paste this entire SQL code into Supabase SQL Editor
-- Then click "Run" or press Ctrl/Cmd + Enter

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

-- Create blog_post_tags table (links posts to tags)
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

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Allow public to read published posts
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Public can read tags" ON blog_tags
    FOR SELECT USING (true);

CREATE POLICY "Public can read post tags" ON blog_post_tags
    FOR SELECT USING (true);

-- Allow all operations for now (using anon key)
-- In production, you should restrict this to authenticated users only
CREATE POLICY "Allow all operations on posts" ON blog_posts
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on categories" ON blog_categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on tags" ON blog_tags
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on post tags" ON blog_post_tags
    FOR ALL USING (true) WITH CHECK (true);

-- Note: The above policies allow full access via the anon key.
-- For better security, you should:
-- 1. Set up Supabase Auth
-- 2. Create policies that check for authenticated admin users
-- 3. Or use serverless functions with service_role key
