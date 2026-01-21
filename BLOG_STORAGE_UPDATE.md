# Blog Storage System Update

## What Changed

The blog system now supports **Supabase** as the primary storage method, with automatic fallbacks to JSON file and localStorage.

## Storage Priority

1. **Supabase** (if configured) - Centralized database, works across all devices
2. **JSON File** (`/data/blog-posts.json`) - Fallback if Supabase not configured
3. **localStorage** - Last resort fallback

## Setup Required

### Option 1: Use Supabase (Recommended)

1. Follow the setup guide in `SUPABASE_SETUP.md`
2. Add environment variables to Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Blog posts will be saved to Supabase and accessible from any device

### Option 2: Continue Using JSON File

- No changes needed
- System will continue working as before
- Admin saves to localStorage, then you export and commit JSON

## How It Works Now

### Reading Blog Posts
- Tries Supabase first (if configured)
- Falls back to JSON file
- Falls back to localStorage

### Saving Blog Posts
- If Supabase configured: Saves directly to Supabase
- If not: Saves to localStorage (existing behavior)

## Migration

To migrate existing posts to Supabase:

1. Set up Supabase (see `SUPABASE_SETUP.md`)
2. Use the admin interface "Import from JSON" feature
3. Or we can create a migration script

## Benefits of Supabase

✅ **Works across all devices** - No localStorage dependency
✅ **Real-time updates** - Changes appear immediately
✅ **Image uploads** - Can store images in Supabase Storage
✅ **Scalable** - Handles large amounts of data
✅ **Free tier** - Generous free tier for most use cases

## Backward Compatibility

- Existing JSON file system still works
- No breaking changes
- Can switch between systems easily
