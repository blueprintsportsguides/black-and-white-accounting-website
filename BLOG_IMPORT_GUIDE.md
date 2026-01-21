# How to Import Existing Blogs to Supabase

## Quick Steps

1. **Make sure Supabase is set up:**
   - ✅ SQL tables created (you've done this)
   - ✅ Environment variables set (you've done this)

2. **Go to the import page:**
   - Navigate to: `/admin/import-json-to-supabase.html`
   - Or click "Import JSON to Supabase" button in the blog admin

3. **Click "Start Import"**
   - The tool will automatically load `data/blog-posts.json`
   - It will import all posts, categories, and tags to Supabase
   - You'll see a progress bar and logs

4. **Wait for completion**
   - The import will show progress for each item
   - Green checkmarks = success
   - Red X = errors (check the log)

5. **Done!**
   - All your existing blogs are now in Supabase
   - They'll be accessible from any device
   - You can now create/edit posts and they'll save to Supabase

## What Gets Imported

- ✅ All blog posts (published, draft, scheduled)
- ✅ All categories
- ✅ All tags
- ✅ All post metadata (images, SEO, etc.)

## Troubleshooting

**"Supabase not configured" error:**
- Check your `.env.local` file has the correct values
- Restart your dev server after creating `.env.local`
- For production, check Vercel environment variables

**"Could not load blog-posts.json" error:**
- Make sure `data/blog-posts.json` exists
- Check the file path is correct

**Some posts fail to import:**
- Check the error log for specific issues
- Common issues: missing required fields, invalid dates
- You can re-run the import (it will update existing posts)

## After Import

Once imported:
- Your blog will load from Supabase (not localStorage)
- New posts will save directly to Supabase
- Changes will be visible across all devices immediately
