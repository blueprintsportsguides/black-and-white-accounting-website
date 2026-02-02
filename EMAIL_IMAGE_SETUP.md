# Email Template Image Setup Guide

## Overview

Email templates require **absolute URLs** for all images. Images cannot be loaded from local files - they must be hosted on a publicly accessible server.

## Image Hosting Options

### Option 1: Your Website Server (Recommended if site is live)

If your website is live at `https://www.blackandwhiteaccounting.co.uk`, you can host images there.

**Steps:**
1. Upload images to your website's `/Images/` directory
2. Use URLs like: `https://www.blackandwhiteaccounting.co.uk/Images/long%20logo.png`
3. Ensure images are publicly accessible (no authentication required)

**Pros:**
- No additional hosting needed
- Images load from your domain
- Easy to manage

**Cons:**
- Requires website to be live
- May need to handle URL encoding for spaces (`%20`)

---

### Option 2: Supabase Storage (Recommended for development)

Supabase provides free image hosting with a CDN, perfect for email templates.

#### Setup Steps:

1. **Create Supabase Storage Bucket:**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('email-assets', 'email-assets', true);
   ```

2. **Set Storage Policies (make public):**
   ```sql
   -- Allow public read access
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'email-assets');
   ```

3. **Upload Images via Supabase Dashboard:**
   - Go to Storage → email-assets
   - Click "Upload file"
   - Upload your images:
     - `long logo.png`
     - `circle logo.png`
     - `Tax.png`
     - `Accounts.png`
     - `Advisory.png`
     - Blog images
     - Feature images

4. **Get Image URLs:**
   - After uploading, click on each image
   - Copy the "Public URL"
   - Format: `https://[project-ref].supabase.co/storage/v1/object/public/email-assets/filename.png`

5. **Update Email Template:**
   - Replace `YOUR_LOGO_LONG_URL` with your Supabase URL
   - Replace `YOUR_TAX_ICON_URL` with your Supabase URL
   - Replace all other `YOUR_*_URL` placeholders

**Pros:**
- Free tier available
- Fast CDN delivery
- Works even if website isn't live
- Easy to manage via dashboard

**Cons:**
- Requires Supabase account setup
- URLs are long (but work perfectly)

---

### Option 3: Other Image Hosting Services

**Cloudinary:**
- Free tier: 25GB storage, 25GB bandwidth
- URL: `https://res.cloudinary.com/[cloud-name]/image/upload/[image-name].png`

**Imgur:**
- Free, but not recommended for business use
- URLs can change

**AWS S3 + CloudFront:**
- Professional solution
- Requires AWS account setup

---

## Required Images for Email Template

### Essential Images (Configured):

1. **Logo - Horizontal (Long)**
   - **URL:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/long%20logo.png`
   - Size: ~280px width
   - Used in: Header section
   - ✅ **Configured in template**

2. **Logo - Circle**
   - **Status:** ⚠️ **Still needs URL** - Please provide circle logo URL
   - Size: 80px × 80px
   - Used in: Footer section
   - Placeholder: `YOUR_LOGO_CIRCLE_URL` (needs to be replaced)

3. **Service Icons:**
   - **Tax Icon:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/Tax.png` ✅
   - **Accounts Icon:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/Accounts.png` ✅
   - **Advisory Icon:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/Advisory.png` ✅
   - Size: 80px × 80px each
   - ✅ **All configured in template**

### Images Used in Template:

4. **Feature Image**
   - **URL:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_9104.jpg`
   - Used in: "Why Black and White" section
   - Description: Black and white team photo
   - ✅ **Configured in template**

5. **Blog Images**
   - **Blog Image 1:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_7698.jpg` ✅
   - **Blog Image 2:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8530.jpg` ✅
   - Used in: Blog section (2 images)
   - ⚠️ **IMPORTANT:** Blog images should be pre-cropped to **280px × 180px** (1.56:1 aspect ratio) to ensure consistent sizing and prevent squashing
   - ✅ **Both configured in template**

6. **Service Spotlight Image**
   - **URL:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8624.jpg`
   - Used in: Service spotlight section
   - Description: Black and white mouse and mouse mat
   - ✅ **Configured in template**

---

## Available Images (Not Currently Used)

The following images are available in your Supabase storage but not currently used in the template. You can use them for future emails or swap them in:

### People at Desk:
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_7528.jpg` - Person at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_7592.jpg` - Person at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_7813.jpg` - 2 people at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8061.jpg` - Person at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8030.jpg` - Person at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8296.jpg` - 2 people at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8441.jpg` - Person at desk
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8552.jpg` - Person at desk

### Office/Work Images:
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_9137.jpg` - Black and white office poster
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_9146.jpg` - Person working
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_9158.jpg` - Person working
- `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_9193.jpg` - Poster close up

---

## Quick Setup Checklist

- [x] Images hosted on Supabase ✅
- [x] All essential images uploaded ✅
- [x] Public URLs obtained ✅
- [x] Template updated with image URLs ✅
- [ ] **Circle logo URL still needed** - Replace `YOUR_LOGO_CIRCLE_URL` in template
- [ ] Test images load correctly (open HTML in browser)
- [x] URLs are absolute (start with `https://`) ✅

---

## Image URLs Currently in Template

All images have been configured with Supabase URLs:

- ✅ **Header Logo:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/long%20logo.png`
- ⚠️ **Footer Logo:** Still needs URL (search for `YOUR_LOGO_CIRCLE_URL` in template)
- ✅ **Tax Icon:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/Tax.png`
- ✅ **Accounts Icon:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/Accounts.png`
- ✅ **Advisory Icon:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/Advisory.png`
- ✅ **Feature Image:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_9104.jpg`
- ✅ **Blog Image 1:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_7698.jpg`
- ✅ **Blog Image 2:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8530.jpg`
- ✅ **Service Spotlight:** `https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/DSC_8624.jpg`

**Note:** Only the circle logo placeholder (`YOUR_LOGO_CIRCLE_URL`) still needs to be replaced. All other images are configured.

---

## Image Optimization Tips

1. **File Size:**
   - Keep images under 100KB each
   - Use compression tools (TinyPNG, ImageOptim)

2. **Format:**
   - Logos: PNG (for transparency)
   - Photos: JPG (smaller file size)
   - Icons: PNG or SVG (but SVG not supported in all email clients)

3. **Dimensions:**
   - Resize images to exact dimensions needed
   - Don't rely on CSS to resize (slower loading)
   - **Blog images:** MUST be cropped to 280px × 180px (1.56:1 ratio) before uploading
   - Use image editing software (Photoshop, GIMP, or online tools) to crop images to exact dimensions

4. **Naming:**
   - Use lowercase, no spaces
   - Use hyphens: `long-logo.png` instead of `long logo.png`
   - This avoids URL encoding issues

---

## Testing Images

### Before Sending:

1. **Open HTML in Browser:**
   - Right-click `email-template-master.html`
   - Open with browser
   - Check all images load

2. **Test in Email Client:**
   - Send test email to yourself
   - Check images in:
     - Gmail (web)
     - Gmail (mobile app)
     - Outlook
     - Apple Mail

3. **Check Image URLs:**
   - Right-click image → "Copy image address"
   - Paste in browser to verify it loads

---

## Troubleshooting

### Images Not Loading:

**Problem:** Images show as broken/red X

**Solutions:**
- Verify URL is absolute (starts with `https://`)
- Check image is publicly accessible (try URL in browser)
- Ensure no authentication required
- Check for URL encoding issues (spaces = `%20`)

**Problem:** Images load slowly

**Solutions:**
- Optimize image file sizes
- Use CDN (Supabase, Cloudinary)
- Resize images to exact dimensions needed

**Problem:** Images blocked by email client

**Solutions:**
- Some email clients block images by default (Gmail)
- This is normal - users can click "Show images"
- Ensure alt text is descriptive for accessibility

---

## Supabase Quick Start

If you want to use Supabase for image hosting:

1. **Sign up:** https://supabase.com
2. **Create project**
3. **Go to Storage** in dashboard
4. **Create bucket:** `email-assets` (make it public)
5. **Upload images**
6. **Copy public URLs**
7. **Replace placeholders in template**

**Your Supabase URLs (Already Configured):**
```
https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/
```

All images are stored in the `Images` bucket and are publicly accessible.

---

## Need Help?

If you need assistance setting up image hosting:
- Check Supabase documentation: https://supabase.com/docs/guides/storage
- Or use your website hosting if it's already live
- Contact: info@blackandwhiteaccounting.co.uk

---

**Last Updated:** January 2025
