# How to Add a Blog Post - Admin Guide

## Accessing the Admin Area

1. Navigate to `/admin-login.html` on your website
2. Enter your credentials:
   - **Username:** `admin`
   - **Password:** `BlackWhite2024!`
3. You'll be redirected to the blog admin dashboard

## Creating a New Post

1. Click the **"+ New Post"** button in the admin header
2. Fill in the required fields:
   - **Title** - The main title of your post (required)
   - **Slug** - URL-friendly version (auto-generated from title, but you can edit it)
   - **Excerpt** - Brief summary shown in listings (required)
   - **Content** - The main post content (required)
     - Use the toolbar buttons for formatting (Bold, Italic, Headings, Lists, Links)
     - Or write in Markdown format

3. Set the post status:
   - **Draft** - Not visible to public
   - **Scheduled** - Will publish at the specified date/time
   - **Published** - Immediately visible on the blog

4. Select a **Category** (optional but recommended)

5. Add **Tags** (optional):
   - Type in the tag input and press Enter
   - Or check existing tags from the list below

6. Add **Featured Image** (optional):
   - Enter the full URL to an image
   - Add descriptive alt text for accessibility

7. Set **SEO** fields (optional):
   - **Meta Title** - Leave empty to use post title
   - **Meta Description** - Leave empty to use excerpt

8. Click **"Save Post"** to save your work

## Editing an Existing Post

1. From the admin dashboard, find the post you want to edit
2. Click the **"Edit"** button next to the post
3. Make your changes
4. Click **"Save Post"** to update

## Managing Posts

### Search
- Use the search box to find posts by title, excerpt, or content

### Filter
- Filter by **Status** (Draft, Scheduled, Published)
- Filter by **Category**

### Actions
- **Edit** - Modify the post
- **Delete** - Permanently remove the post (cannot be undone)

## Post Statuses

- **Draft** - Work in progress, not visible to visitors
- **Scheduled** - Set to publish at a future date/time
- **Published** - Live on the blog and visible to all visitors

## Content Formatting

The editor supports Markdown formatting:

- **Bold:** `**text**` or use the B button
- **Italic:** `*text*` or use the I button
- **Heading 2:** `## Heading` or use the H2 button
- **Heading 3:** `### Subheading` or use the H3 button
- **Lists:** `- Item` or use the List button
- **Links:** `[Link Text](url)` or use the Link button

## Tips

1. **Always write an excerpt** - This appears in blog listings and search results
2. **Use categories** - Helps organize content and improve navigation
3. **Add tags** - Makes posts easier to find and group related content
4. **Set publish dates** - Schedule posts for optimal timing
5. **Use featured images** - Makes posts more engaging in listings
6. **Write SEO-friendly content** - Use clear headings, descriptive meta descriptions

## Public Blog Features

- Blog index at `/blog.html` shows all published posts
- Posts are automatically sorted by publish date (newest first)
- Visitors can search and filter by category
- Each post has its own page with table of contents
- Mobile-responsive design for easy reading

## Need Help?

If you encounter any issues:
1. Check that all required fields are filled
2. Ensure your slug is unique (the system will auto-append numbers if needed)
3. Make sure images are accessible via URL
4. Verify publish dates are set correctly for scheduled posts

