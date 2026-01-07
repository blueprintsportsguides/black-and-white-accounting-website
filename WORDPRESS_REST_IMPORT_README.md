# WordPress REST API Import Guide

This guide explains how to import published blog posts from a live WordPress site using the REST API.

## Overview

The REST API importer fetches published posts directly from your WordPress site and imports them into the Insights blog system. Unlike the XML import, this works with a live WordPress site.

## Prerequisites

1. Node.js installed (v16 or higher)
2. WordPress site must have REST API enabled (default in WordPress 4.7+)
3. Posts must be published (public)
4. Admin access to the blog system

## WordPress Site Configuration

**Base URL:** `https://blackandwhiteaccounting.co.uk`

The importer uses the public WordPress REST API endpoint:
```
GET /wp-json/wp/v2/posts?per_page=100&page=N&_embed=1&status=publish&orderby=date&order=asc
```

No authentication is required as we're only fetching published posts.

## Step 1: Install Dependencies

Dependencies are already installed. The script uses:
- `node-fetch` - For HTTP requests
- Built-in `fs` and `crypto` modules

## Step 2: Run Import Script

### Dry Run (Recommended First)

Test the import without downloading images or creating files:

```bash
npm run import:rest:dry-run
```

This will:
- Fetch all published posts from WordPress
- Process them and show what would be imported
- Show a summary of what would be imported
- **Not** download images or create import files

### Test Import (5 Posts)

Import a small batch to test:

```bash
npm run import:rest:test
```

This imports only 5 posts for testing.

### Full Import

Generate the import JSON file:

```bash
npm run import:rest
```

This will:
- Fetch all published posts from WordPress REST API
- Download all featured images and inline images
- Store images in `Images/blog/` directory
- Cache downloads in `data/wp-media-cache/` to avoid duplicates
- Create a JSON import file in `data/wp-rest-import-YYYY-MM-DD-HHMM.json`
- Create a detailed log in `logs/wp-rest-import-YYYY-MM-DD-HHMM.json`

### Manual Script Usage

You can also run the script directly with custom options:

```bash
# Dry run
node scripts/import-wp-rest.js --dry-run

# Import with limit
node scripts/import-wp-rest.js --import --limit=10

# Full import
node scripts/import-wp-rest.js --import

# Wipe existing + import
node scripts/import-wp-rest.js --import --wipe
```

## Command Line Options

- `--dry-run` - Test mode, no files created
- `--import` - Actually import (creates JSON file)
- `--limit=N` - Limit to N posts (useful for testing)
- `--wipe` - Flag to indicate wiping existing posts (you'll need to manually delete them first)

## Step 3: Wipe Existing Posts (Optional)

If you want to start fresh, you can delete all existing WordPress-imported posts:

1. Go to `/admin/blog.html`
2. Filter by status or search for posts with `legacy_wp_id`
3. Delete them manually, OR
4. Use browser console:
```javascript
import { getAllPosts, deletePost } from './blog-data.js';
const posts = getAllPosts();
posts.filter(p => p.legacy_wp_id).forEach(p => {
    console.log(`Deleting: ${p.title}`);
    deletePost(p.id);
});
console.log('Done!');
```

## Step 4: Import into Blog System

1. Log into the admin area at `/admin-login.html`
2. Navigate to `/admin/import.html` or `/admin/import-direct.html`
3. Upload the JSON file from `data/wp-rest-import-*.json`
4. Click "Import Posts"
5. Monitor the progress and log output
6. Review the summary statistics

## What Gets Imported

### Posts
- **Title** - From WordPress post title (HTML entities decoded)
- **Slug** - From WordPress post slug
- **Content** - Full HTML content (preserved exactly as WordPress renders it)
- **Excerpt** - From WordPress excerpt (plain text), or auto-generated from content
- **Status** - Always `published` (only published posts are fetched)
- **Published Date** - From WordPress `date_gmt` (preferred) or `date`
- **Author** - From WordPress author name
- **Categories** - First category from WordPress
- **Tags** - All WordPress tags
- **Featured Image** - Downloaded and stored locally
- **Inline Images** - All images in content are downloaded and URLs rewritten
- **Legacy Fields** - WordPress post ID and URL stored for traceability

### Images

**Featured Images:**
- Fetched from `_embedded["wp:featuredmedia"]` or `/wp-json/wp/v2/media/{id}`
- Downloaded and stored locally
- Alt text preserved if available

**Inline Images:**
- All `<img>` tags in content are processed
- `srcset` URLs are also processed
- Images are downloaded and stored locally
- URLs in content are rewritten to point to local storage
- Original URLs are preserved if download fails

### Image Caching
- Downloads are cached in `data/wp-media-cache/`
- Cache uses MD5 hash of URL as filename
- Re-running import skips already-downloaded images

## Idempotency

The import is **safe to re-run**:

- Posts are matched by `legacy_wp_id` (WordPress post ID)
- If a post with the same `legacy_wp_id` exists, it will be **updated** (not duplicated)
- Categories and tags are matched by slug (no duplicates)
- Images are cached to avoid re-downloading

## Import Logs

Each import creates a detailed log file in `logs/wp-rest-import-*.json` containing:

```json
{
  "timestamp": "2026-01-07T12:00:00.000Z",
  "mode": "import",
  "wp_base_url": "https://blackandwhiteaccounting.co.uk",
  "limit": null,
  "wipe": false,
  "stats": {
    "totalFetched": 45,
    "postsCreated": 0,
    "postsUpdated": 0,
    "featuredImagesDownloaded": 30,
    "inlineImagesDownloaded": 85,
    "inlineImagesReplaced": 200,
    "failures": []
  },
  "summary": {
    "posts": 45
  }
}
```

## Troubleshooting

### No Posts Found

- Verify WordPress REST API is accessible: Visit `https://blackandwhiteaccounting.co.uk/wp-json/wp/v2/posts?per_page=1`
- Check that posts are published (not draft)
- Verify the base URL is correct

### Images Not Downloading

- Check network connection
- Verify image URLs are accessible
- Check `logs/wp-rest-import-*.json` for specific failures
- Images that fail to download will keep their original URLs

### Duplicate Posts

- Ensure you're using `legacy_wp_id` matching (already implemented)
- Check that posts have `legacy_wp_id` set in the JSON
- Re-importing will update existing posts, not create duplicates

### Content Formatting Issues

- HTML content is preserved exactly as WordPress renders it
- If content looks wrong, check the original WordPress post
- Gutenberg blocks and shortcodes are preserved as HTML

### Rate Limiting

- WordPress may rate limit requests
- The script processes posts sequentially to avoid overwhelming the server
- If you encounter rate limits, wait a few minutes and retry

## Comparison: REST API vs XML Import

| Feature | REST API Import | XML Import |
|---------|----------------|------------|
| Source | Live WordPress site | WXR XML file |
| Authentication | Not needed (public) | Not needed |
| Posts | Published only | All statuses |
| Images | Downloads from live site | Downloads from URLs in XML |
| Speed | Slower (API calls) | Faster (local file) |
| Updates | Can re-run to sync | One-time import |
| Best for | Syncing with live site | One-time migration |

## Usage Examples

### 1. Dry Run
```bash
npm run import:rest:dry-run
```
Output: Summary of what would be imported, no files created.

**Example Output:**
```
============================================================
WordPress REST API Import Script
Mode: DRY RUN
Base URL: https://blackandwhiteaccounting.co.uk
============================================================

Fetching posts from WordPress REST API...
  Fetching page 1...
  Found 100 posts (total: 100)
  ...
Processing 336 posts...
  [1/336] Processed: Post Title
  ...

IMPORT SUMMARY
============================================================
Total posts fetched:     336
Posts processed:        336
Featured images:         250
Inline images downloaded: 450
Inline images replaced:  1200
Failures:               0
```

### 2. Test Import (5 posts)
```bash
npm run import:rest:test
```
Output: JSON file with 5 posts, ready to import via admin page.

This is perfect for testing the import process before importing all posts.

### 3. Wipe + Full Import

**Step 1: Wipe existing imported posts**
- Go to `/admin/wipe-imported.html`
- Review the list of posts that will be deleted
- Click "Delete All Imported Posts"
- Confirm the deletion

**Step 2: Run full import**
```bash
npm run import:rest
```
This will fetch all published posts and create the import JSON file.

**Step 3: Import via admin**
- Go to `/admin/import-direct.html`
- Click "Import Latest JSON File"
- It will automatically find and import the latest REST import file

## Next Steps After Import

1. **Review imported posts** in `/admin/blog.html`
2. **Check featured images** appear correctly
3. **Verify inline images** render in post content
4. **Test public blog pages** at `/blog.html`
5. **Update any broken links** if needed

## Support

If you encounter issues:
1. Check the import log file for detailed error messages
2. Verify WordPress REST API is accessible
3. Ensure Node.js dependencies are installed
4. Check browser console for import page errors

## Notes

- Only **published** posts are imported (drafts are ignored)
- Posts are fetched in chronological order (oldest first)
- The script respects WordPress pagination (100 posts per page)
- Image downloads are cached to avoid duplicates
- Failed image downloads don't stop the import process

