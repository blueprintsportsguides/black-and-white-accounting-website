# Blog Storage Guide

## Overview

The blog system uses a **hybrid storage approach** that combines:
- **JSON file** (`data/blog-posts.json`) - Source of truth, stored in repository
- **localStorage** - Cache and temporary storage for admin edits

This approach avoids the need for a database (like Supabase) while maintaining flexibility.

## How It Works

### 1. **Loading Blogs**
- On page load, `blog-data.js` first tries to load from `/data/blog-posts.json`
- If successful, it caches the data in `localStorage` for faster access
- If the JSON file fails to load, it falls back to `localStorage` (useful for development)

### 2. **Creating/Editing Blogs**
When you create or edit a blog post in the admin interface:
- The post is saved to `localStorage` immediately
- **It is NOT automatically saved to the JSON file**
- This allows you to make multiple edits before committing

### 3. **Persisting Changes to Repository**

To save your changes permanently:

1. **Go to Admin Interface** (`/admin/blog.html`)
2. **Click "Export JSON"** button
3. This downloads a `blog-posts.json` file containing all current posts (from localStorage)
4. **Replace** `data/blog-posts.json` in your repository with the downloaded file
5. **Commit and push** to git
6. After deployment, the changes will be live

## Image Storage

### Where Images Are Stored
- Blog images are stored in `/Images/blog/` directory
- Images are referenced in posts as `/Images/blog/filename.webp` (or .jpg, .png)
- During build, the entire `Images/` directory is copied to `dist/Images/`

### Adding New Images
1. Upload images to `/Images/blog/` directory in your repository
2. Reference them in blog posts as `/Images/blog/your-image.webp`
3. Commit images to git along with the blog post data
4. Images will be automatically copied during build

## Workflow Summary

### Creating a New Blog Post
1. Go to `/admin/blog/new.html`
2. Fill in the post details
3. Click "Save" → Post saved to localStorage
4. Click "Export JSON" → Download the JSON file
5. Replace `data/blog-posts.json` with downloaded file
6. Commit and push to git

### Editing an Existing Blog Post
1. Go to `/admin/blog.html`
2. Click "Edit" on the post
3. Make your changes
4. Click "Save" → Changes saved to localStorage
5. Click "Export JSON" → Download the JSON file
6. Replace `data/blog-posts.json` with downloaded file
7. Commit and push to git

## Why Not Use Supabase?

**Current System (JSON + localStorage):**
- ✅ **Free** - No additional costs
- ✅ **Simple** - No external dependencies
- ✅ **Version controlled** - Blog data is in git
- ✅ **Fast** - localStorage caching for instant access
- ⚠️ **Manual export** - Need to export and commit changes

**Supabase Alternative:**
- ❌ **Cost** - Additional monthly expense
- ❌ **Complexity** - Requires database setup and API calls
- ❌ **Not version controlled** - Data lives in external service
- ✅ **Automatic persistence** - Changes saved immediately
- ✅ **Real-time** - Could enable real-time updates

**Recommendation:** The current system is sufficient for most use cases. Only consider Supabase if you need:
- Multiple admins editing simultaneously
- Real-time collaboration
- Very high traffic requiring database-level optimization

## Troubleshooting

### Images Not Loading
- Check that images exist in `/Images/blog/` directory
- Verify images are committed to git
- Ensure build process copied images to `dist/Images/blog/`
- Check browser console for 404 errors

### Blogs Not Appearing
- Verify `data/blog-posts.json` exists and has posts
- Check that posts have `status: "published"`
- Clear browser cache and localStorage if needed
- Check browser console for errors

### Changes Not Persisting
- Remember: Changes are saved to localStorage, not the JSON file
- You must click "Export JSON" and commit the file
- After deployment, changes will be live
