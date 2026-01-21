# Simple Supabase Setup Guide

Follow these steps to connect your blog to Supabase. This will make your blog work on all devices.

## Step 1: Create Supabase Account (5 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with:
   - Your email address, OR
   - Your GitHub account (recommended - easier)
4. Verify your email if needed

## Step 2: Create a New Project (2 minutes)

1. Once logged in, click **"New Project"**
2. Fill in:
   - **Name**: `black-white-accounting-blog` (or any name you like)
   - **Database Password**: Create a strong password (save this somewhere safe - you'll need it)
   - **Region**: Choose closest to you (e.g., "West Europe" if you're in UK)
3. Click **"Create new project"**
4. Wait 2-3 minutes for it to set up

## Step 3: Get Your Keys (1 minute)

Here's exactly where to find them:

1. **In your Supabase project dashboard**, look at the **left sidebar**
2. Click on **Settings** (it's the gear/cog icon ⚙️ at the bottom of the sidebar)
3. In the settings menu, click **"API"** (it's usually the first option)
4. You'll see a page with several sections. Look for:
   
   **Project URL:**
   - It's in a section called **"Project URL"** or **"Configuration"**
   - It looks like: `https://abcdefghijklmnop.supabase.co`
   - There's a **copy button** (📋) next to it - click it to copy
   
   **anon public key:**
   - Scroll down a bit to find **"Project API keys"** section
   - You'll see several keys listed
   - Find the one labeled **"anon"** or **"anon public"**
   - It's a very long string that starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click the **eye icon** 👁️ to reveal it (if hidden)
   - Click the **copy button** (📋) next to it to copy

**Visual Guide:**
```
Left Sidebar → Settings (⚙️) → API
                    ↓
            [Project URL section]
            https://xxxxx.supabase.co  [📋 Copy]
                    ↓
            [Project API keys section]
            anon public: eyJhbGc...  [👁️] [📋 Copy]
```

**Important:** 
- Copy the **"anon"** key, NOT the "service_role" key (that one is secret!)
- The anon key is safe to use in your website code

## Step 4: Create Database Tables (3 minutes)

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste this entire code block:

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
```

4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned" - that's good!

## Step 5: Add Keys to Your Website (2 minutes)

### If using Vercel (recommended):

1. Go to your Vercel dashboard: **https://vercel.com**
2. Find your project and click on it
3. Click **Settings** tab
4. Click **Environment Variables** in the left menu
5. Click **"Add New"** and add these two:

   **First variable:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Paste your Project URL from Step 3
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

   **Second variable:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Paste your anon public key from Step 3
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

6. Go to **Deployments** tab
7. Click the **"..."** menu on your latest deployment
8. Click **"Redeploy"** (this makes the new variables active)

### If testing locally:

1. Create a file called `.env.local` in your project root (same folder as `package.json`)
2. Add these two lines (replace with your actual values):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Restart your dev server (`npm run dev`)

## Step 6: Test It Works (1 minute)

1. Go to your website's admin area: `/admin-login.html`
2. Log in
3. Try creating a new blog post
4. Save it
5. Check if it appears on your blog page

If it works, you're done! 🎉

## Troubleshooting

**"Can't save posts"**
- Check your environment variables are set correctly
- Make sure you redeployed after adding variables
- Check browser console for errors (F12)

**"Posts not showing"**
- Make sure you set the post status to "Published"
- Check Supabase dashboard > Table Editor > blog_posts to see if data is there

**"Error connecting to Supabase"**
- Double-check your Project URL and anon key are correct
- Make sure there are no extra spaces when copying

## What Happens Next?

Once connected:
- ✅ Blog posts save to Supabase (not just your browser)
- ✅ You can access your blog from any device
- ✅ Changes appear immediately
- ✅ No more localStorage dependency

## Need Help?

If you get stuck, check:
- Supabase dashboard to see if tables were created
- Browser console (F12) for error messages
- Vercel logs if deployed
