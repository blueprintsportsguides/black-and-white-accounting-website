# WordPress Import Guide

This guide explains how to import blog posts from a WordPress WXR XML export into the Insights blog system.

## Overview

The import process consists of two steps:
1. **Parse XML and prepare data** - Run a Node.js script to parse the WordPress XML, download images, and create a JSON import file
2. **Import into blog system** - Use the admin import page to upload the JSON file and import posts into localStorage

## Prerequisites

1. Node.js installed (v16 or higher)
2. WordPress WXR XML export file (already in `data/blackandwhiteaccounting.WordPress.2026-01-07.xml`)
3. Admin access to the blog system

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `fast-xml-parser` - For parsing WordPress XML
- `node-fetch` - For downloading images

## Step 2: Run Import Script

### Dry Run (Recommended First)

Test the import without actually downloading images or creating files:

```bash
npm run import:dry-run
```

This will:
- Parse the XML file
- Identify all posts, categories, tags, and attachments
- Show a summary of what would be imported
- **Not** download images or create import files

### Actual Import

Generate the import JSON file:

```bash
npm run import
```

This will:
- Parse the XML file
- Download all featured images and inline images
- Store images in `Images/blog/` directory
- Cache downloads in `data/wp-media-cache/` to avoid duplicates
- Create a JSON import file in `data/wp-import-YYYY-MM-DD-HHMM.json`
- Create a detailed log in `logs/wp-import-YYYY-MM-DD-HHMM.json`

### Manual Script Usage

You can also run the script directly:

```bash
# Dry run
node scripts/import-wordpress-xml.js --file data/blackandwhiteaccounting.WordPress.2026-01-07.xml --dry-run

# Import
node scripts/import-wordpress-xml.js --file data/blackandwhiteaccounting.WordPress.2026-01-07.xml --import
```

## Step 3: Import into Blog System

1. Log into the admin area at `/admin-login.html`
2. Navigate to `/admin/import.html`
3. Click "Choose File" and select the JSON file from `data/wp-import-*.json`
4. Click "Import Posts"
5. Monitor the progress and log output
6. Review the summary statistics

## What Gets Imported

### Posts
- **Title** - From WordPress post title
- **Slug** - From WordPress post_name (URL slug)
- **Content** - Full HTML content (preserved exactly as exported)
- **Excerpt** - From WordPress excerpt, or auto-generated from content
- **Status** - Mapped from WordPress:
  - `publish` → `published`
  - `draft` → `draft`
  - `future` → `scheduled`
  - `private` → `draft`
- **Published Date** - From WordPress post_date_gmt (preferred) or post_date
- **Author** - From WordPress dc:creator
- **Categories** - All WordPress categories
- **Tags** - All WordPress post tags
- **Featured Image** - Downloaded and stored locally
- **Inline Images** - All images in content are downloaded and URLs rewritten
- **SEO Metadata** - Meta title and description from Yoast/Rank Math
- **Legacy Fields** - WordPress post ID and URL stored for traceability

### Categories & Tags
- All categories and tags are imported
- Duplicates are avoided (existing categories/tags are not recreated)

## Image Handling

### Featured Images
- Identified via `_thumbnail_id` postmeta
- Downloaded from WordPress attachment URLs
- Stored in `Images/blog/` directory
- Alt text preserved if available

### Inline Images
- All `<img>` tags in content are processed
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

Each import creates a detailed log file in `logs/wp-import-*.json` containing:

```json
{
  "timestamp": "2026-01-07T12:00:00.000Z",
  "mode": "import",
  "stats": {
    "totalItems": 150,
    "postsFound": 45,
    "postsImported": 40,
    "postsUpdated": 5,
    "attachmentsFound": 120,
    "imagesDownloaded": 85,
    "imagesReplaced": 200,
    "failures": []
  },
  "summary": {
    "posts": 45,
    "categories": 12,
    "tags": 35
  }
}
```

## Troubleshooting

### Images Not Downloading

- Check network connection
- Verify image URLs are accessible
- Check `logs/wp-import-*.json` for specific failures
- Images that fail to download will keep their original URLs

### Duplicate Posts

- Ensure you're using `legacy_wp_id` matching (already implemented)
- Check that posts have `legacy_wp_id` set in the JSON
- Re-importing will update existing posts, not create duplicates

### Content Formatting Issues

- HTML content is preserved exactly as exported
- If content looks wrong, check the original WordPress export
- Markdown posts are converted to HTML on display

### Large XML Files

- The script uses streaming XML parsing for efficiency
- Very large files (>100MB) may take several minutes
- Monitor progress in the console output

## Rollback

To remove imported posts:

1. Open browser console on any admin page
2. Run:
```javascript
// Get all imported posts
const posts = JSON.parse(localStorage.getItem('baw_blog_posts') || '[]');
const imported = posts.filter(p => p.legacy_wp_id);

// Remove them
const remaining = posts.filter(p => !p.legacy_wp_id);
localStorage.setItem('baw_blog_posts', JSON.stringify(remaining));

console.log(`Removed ${imported.length} imported posts`);
```

Or delete all posts with legacy_wp_id:
```javascript
import { getAllPosts, deletePost } from './blog-data.js';
const posts = getAllPosts();
posts.filter(p => p.legacy_wp_id).forEach(p => deletePost(p.id));
```

## File Structure

After import, your directory structure will look like:

```
Black and White Website/
├── data/
│   ├── blackandwhiteaccounting.WordPress.2026-01-07.xml
│   ├── wp-import-2026-01-07-120000.json
│   └── wp-media-cache/
│       └── [cached images]
├── Images/
│   └── blog/
│       └── [downloaded images]
├── logs/
│   └── wp-import-2026-01-07-120000.json
└── scripts/
    └── import-wordpress-xml.js
```

## Next Steps After Import

1. **Review imported posts** in `/admin/blog.html`
2. **Check featured images** appear correctly
3. **Verify inline images** render in post content
4. **Test public blog pages** at `/blog.html`
5. **Update any broken links** if needed
6. **Set up redirects** from old WordPress URLs if required

## Support

If you encounter issues:
1. Check the import log file for detailed error messages
2. Verify the XML file is valid WordPress WXR format
3. Ensure Node.js dependencies are installed
4. Check browser console for import page errors

