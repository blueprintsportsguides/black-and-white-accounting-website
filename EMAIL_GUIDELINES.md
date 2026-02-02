# Email Template Guidelines - Black and White Accounting

## Overview

This document provides comprehensive guidelines for creating and maintaining email templates for Black and White Accounting. The master template (`email-template-master.html`) is designed to be compatible with Brevo (formerly Sendinblue) and optimized for both mobile and desktop viewing across multiple email clients.

---

## Table of Contents

1. [Brand Guidelines](#brand-guidelines)
2. [Email Client Compatibility](#email-client-compatibility)
3. [Brevo Integration](#brevo-integration)
4. [Mobile & Desktop Optimization](#mobile--desktop-optimization)
5. [Template Structure](#template-structure)
6. [Design Rules](#design-rules)
7. [Content Guidelines](#content-guidelines)
8. [Testing Checklist](#testing-checklist)
9. [Best Practices](#best-practices)

---

## Brand Guidelines

### Color Palette

**Primary Colors:**
- **Black (Text Primary):** `#1a1a1a` - Use for headings, primary text, and primary buttons
- **White:** `#ffffff` - Use for backgrounds and button text on dark backgrounds
- **Text Secondary:** `#4a4a4a` - Use for body text and secondary information
- **Text Light:** `#6a6a6a` - Use for less important text and metadata

**Background Colors:**
- **White:** `#ffffff` - Primary background
- **Light Pastel 1:** `#fef9f7` - Alternate section background
- **Light Pastel 2:** `#f5f9fc` - Alternate section background
- **Light Pastel 3:** `#faf5f9` - Alternate section background
- **CTA Background:** `#fce9d9` - For call-to-action sections (solid color, NOT gradient)

**⚠️ IMPORTANT:** Do NOT use gradients in emails. Use solid colors only for maximum email client compatibility.

### Typography

**Font Stack:**
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

**Font Sizes:**
- **Headings (H1):** 32px (desktop), 28px (mobile)
- **Headings (H2):** 28px (desktop), 24px (mobile)
- **Headings (H3):** 22px (desktop), 20px (mobile)
- **Body Text:** 16px (desktop), 15px (mobile)
- **Small Text:** 14px (desktop), 13px (mobile)
- **Footer Text:** 12px

**Line Heights:**
- Headings: 1.2-1.3
- Body text: 1.6
- Small text: 1.4-1.5

### Logo Usage

**Horizontal Logo:**
- Use in header section
- Max width: 280px
- File: `/Images/long logo.png`
- Always link to homepage: `https://www.blackandwhiteaccounting.co.uk`

**Circle Logo:**
- Use in footer section
- Size: 80px × 80px
- File: `/Images/circle logo.png`

### Service Icons

- **Tax Icon:** `/Images/Tax.png` (80px × 80px)
- **Accounts Icon:** `/Images/Accounts.png` (80px × 80px)
- **Advisory Icon:** `/Images/Advisory.png` (80px × 80px)

### Brand Voice & Tone

- **Professional but human** - Avoid corporate jargon
- **Confident, not corporate** - Be authoritative without being cold
- **Helpful, not salesy** - Focus on value and clarity
- **Plain English** - Explain complex topics simply

---

## Email Client Compatibility

### Supported Clients

The template is designed to work across:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (2016, 2019, 365, Web)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Mobile clients (iOS Mail, Gmail App, etc.)

### Compatibility Rules

**❌ DO NOT USE:**
- CSS gradients (use solid colors instead)
- Flexbox or Grid (use tables)
- External stylesheets (use inline styles only)
- JavaScript
- CSS animations or transitions
- Position: fixed or absolute
- Max-width in CSS (use table width instead)
- Padding on `<body>` or `<html>` tags

**✅ DO USE:**
- Table-based layouts (`<table role="presentation">`)
- Inline CSS styles
- Web-safe fonts with fallbacks
- Absolute URLs for all images
- Width attributes on images
- Cellpadding and cellspacing on tables
- Solid background colors
- Border attributes on tables for borders

### Outlook-Specific Considerations

- Use VML (Vector Markup Language) for complex backgrounds (if needed)
- Test in Outlook 2016/2019/365 - they use Word rendering engine
- Avoid complex nested tables (keep structure simple)
- Use `mso-` prefixed styles for Outlook-specific fixes

---

## Brevo Integration

### Template Setup in Brevo

1. **Import Template:**
   - Go to Brevo → Email → Templates
   - Click "Create a template" → "Code your own"
   - Paste the HTML from `email-template-master.html`
   - Save as "Master Template"

2. **Dynamic Content Variables:**
   - Brevo uses `{{variable}}` syntax for personalization
   - Common variables:
     - `{{params.firstname}}` - First name
     - `{{params.lastname}}` - Last name
     - `{{params.company}}` - Company name
     - `{{unsubscribe}}` - Unsubscribe link (already in template)
     - `{{preferences}}` - Preferences link (already in template)

3. **Image Hosting:**
   - Upload images to your website server
   - Use absolute URLs: `https://www.blackandwhiteaccounting.co.uk/Images/...`
   - Ensure images are optimized (WebP or JPG, compressed)
   - Recommended max image width: 600px

4. **Campaign Settings:**
   - Set sender name: "Black and White Accounting"
   - Set sender email: `info@blackandwhiteaccounting.co.uk`
   - Set reply-to: `info@blackandwhiteaccounting.co.uk`
   - Subject line: Keep under 50 characters for mobile

### Brevo-Specific Features

- **A/B Testing:** Test subject lines and content variations
- **Scheduling:** Schedule sends for optimal times (Tuesday-Thursday, 10am-2pm)
- **Segmentation:** Use tags to segment by service interest, location, etc.
- **Automation:** Set up welcome emails, follow-ups, etc.

---

## Mobile & Desktop Optimization

### Container Width

- **Desktop:** 600px maximum width
- **Mobile:** 100% width (responsive)

### Responsive Design

**Media Queries:**
While media queries work in some email clients, the template uses a hybrid approach:

1. **Table-based layout** with fixed widths for desktop
2. **Percentage widths** for mobile compatibility
3. **Stacked columns** on mobile (tables naturally stack)

**Mobile-Specific Rules:**
- Use `width="100%"` on main container table
- Set `max-width: 600px` on desktop container
- Images should have `width="100%"` and `max-width` attribute
- Padding: Reduce on mobile (20px instead of 40px)
- Font sizes: Slightly smaller on mobile (use media queries where supported)

### Touch Targets

- Buttons: Minimum 44px × 44px (touch-friendly)
- Links: Adequate spacing between clickable elements
- Padding: Sufficient padding around buttons (14px minimum)

### Image Optimization

- **Format:** JPG or WebP (PNG for logos with transparency)
- **Max Width:** 600px for full-width images
- **Compression:** Optimize for web (aim for <100KB per image)
- **Alt Text:** Always include descriptive alt text
- **Dimensions:** Specify width and height attributes

---

## Template Structure

The master template includes **12 distinct sections:**

1. **Header with Logo** - Branding and navigation
2. **Hero Section** - Main message and primary CTAs
3. **Service Pillars** - Three-column service overview
4. **Statistics Section** - Key numbers and achievements
5. **Feature Highlight** - Image + text layout
6. **Testimonial Section** - Customer quote and attribution
7. **Blog Section** - Latest insights/articles (2-column)
8. **CTA Banner** - Call-to-action with buttons
9. **Trust Badges** - Accreditations and certifications
10. **Locations Section** - Office addresses
11. **Footer** - Contact info, links, legal
12. **Unsubscribe/Preferences** - Compliance links

### Section Usage Guidelines

**Not all sections need to be used in every email.** Select sections based on:
- Email purpose (newsletter, announcement, welcome, etc.)
- Content length
- Call-to-action goals
- Audience segment

**Recommended Section Combinations:**

- **Newsletter:** Header → Hero → Blog → CTA → Footer
- **Service Announcement:** Header → Hero → Service Pillars → Feature → CTA → Footer
- **Welcome Email:** Header → Hero → Why Section → Trust Badges → Locations → Footer
- **Promotional:** Header → Hero → Feature → Testimonial → CTA → Footer

---

## Design Rules

### Layout Rules

1. **Use Tables for Layout:**
   ```html
   <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
   ```

2. **Inline Styles Only:**
   ```html
   <td style="padding: 20px; background-color: #ffffff;">
   ```

3. **Width Constraints:**
   - Main container: `width="600"` with `max-width: 600px` in style
   - Nested tables: Use percentages or fixed pixels
   - Images: Always include `width` attribute

4. **Spacing:**
   - Use `padding` on `<td>` elements (not margins)
   - Standard padding: 20px-50px depending on section
   - Vertical spacing: 30px-50px between major sections

### Button Design

**Primary Button:**
```html
<a href="URL" style="display: inline-block; padding: 14px 28px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 600; border-radius: 8px;">
    Button Text
</a>
```

**Secondary Button:**
```html
<a href="URL" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #1a1a1a; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 600; border-radius: 8px; border: 2px solid #1a1a1a;">
    Button Text
</a>
```

### Link Styling

- **Text Links:** Use brand colors (#1a1a1a for primary, #4a4a4a for secondary)
- **Underline:** Only for footer/legal links
- **Hover States:** Not reliable in email, design for default state only

### Image Guidelines

1. **Always include:**
   - `width` attribute (pixels)
   - `height="auto"` or specific height
   - `alt` text
   - `style="display: block; border: 0;"`

2. **Example:**
   ```html
   <img src="URL" alt="Description" width="280" height="auto" style="display: block; max-width: 280px; height: auto; border: 0;">
   ```

3. **Image Sizes:**
   - Logo (header): 280px width
   - Logo (footer): 80px × 80px
   - Service icons: 80px × 80px
   - Blog images: 260px width
   - Hero images: 600px width (full width)

---

## Content Guidelines

### Preheader Text

The preheader is the preview text shown in email clients. It should:
- Be 40-100 characters
- Summarize the email content
- Encourage opens
- Be hidden in the email body (using display: none)

**Example:**
```html
<div style="display: none; ...">
    Clear, proactive accounting for individuals and growing businesses. Expert Tax, Accounts, and Advisory services.
</div>
```

### Subject Line Best Practices

- **Length:** 30-50 characters (mobile preview)
- **Tone:** Match brand voice (professional but human)
- **Value:** Clearly communicate what's inside
- **Avoid:** Spam triggers (FREE, URGENT, etc. in caps)
- **Personalization:** Use `{{params.firstname}}` when appropriate

**Good Examples:**
- "Your monthly tax insights from Black and White"
- "New blog: Maximising tax efficiency in 2025"
- "Sarah, here's what's new this month"

### Headline Guidelines

- **H1 (Hero):** One per email, 32px, bold
- **H2 (Section):** 28px, bold, clear value proposition
- **H3 (Subsection):** 22px, bold

### Body Text

- **Length:** Keep paragraphs to 3-4 lines max
- **Tone:** Conversational, helpful, clear
- **Formatting:** Use bullet points for lists
- **Links:** Make call-to-action links clear and prominent

### Call-to-Action (CTA)

- **Placement:** Above the fold when possible
- **Clarity:** Use action verbs (Contact, Call, Explore, Learn)
- **Quantity:** Maximum 2-3 CTAs per email
- **Hierarchy:** Primary CTA more prominent than secondary

---

## Testing Checklist

### Before Sending

- [ ] **Spelling & Grammar:** Proofread all content
- [ ] **Links:** Test all links (use absolute URLs)
- [ ] **Images:** Verify all images load (check URLs)
- [ ] **Personalization:** Test `{{variables}}` with sample data
- [ ] **Unsubscribe:** Verify unsubscribe link works
- [ ] **Mobile View:** Test on iOS and Android devices
- [ ] **Desktop View:** Test in Gmail, Outlook, Apple Mail
- [ ] **Dark Mode:** Check appearance in dark mode (if applicable)
- [ ] **Accessibility:** Ensure alt text on all images
- [ ] **Subject Line:** Test subject line length and clarity

### Email Client Testing

Test in these clients (minimum):
- [ ] Gmail (Web)
- [ ] Gmail (Mobile App)
- [ ] Outlook 365 (Web)
- [ ] Apple Mail (iOS)
- [ ] Apple Mail (macOS)

### Tools for Testing

- **Litmus** - Comprehensive email testing
- **Email on Acid** - Cross-client testing
- **Brevo Preview** - Built-in preview tool
- **Real Device Testing** - Send test emails to your own devices

---

## Best Practices

### Frequency

- **Newsletters:** Monthly or bi-monthly
- **Promotional:** As needed, but not more than weekly
- **Transactional:** Immediate (welcome, confirmations, etc.)
- **Educational:** Weekly or bi-weekly for blog updates

### Timing

- **Best Days:** Tuesday, Wednesday, Thursday
- **Best Times:** 10:00 AM - 2:00 PM (local time)
- **Avoid:** Monday mornings, Friday afternoons, weekends

### Segmentation

Segment your audience by:
- Service interest (Tax, Accounts, Advisory)
- Business type (Sole trader, Limited company, Individual)
- Location (Wraysbury, Herriard, Other)
- Engagement level (Active, Inactive, New subscriber)

### Personalization

Use personalization sparingly and naturally:
- ✅ "Hi {{params.firstname}}," in greeting
- ✅ "Based in {{params.location}}?" for location-specific content
- ❌ Over-personalization (can feel creepy)
- ❌ Personalization in subject line (can trigger spam filters)

### A/B Testing

Test these elements:
- Subject lines
- Send times
- CTA button colors/text
- Content length
- Image vs. text-heavy layouts

### Analytics

Track these metrics:
- **Open Rate:** Target 20-25% (industry average: 20%)
- **Click Rate:** Target 2-5% (industry average: 2.6%)
- **Unsubscribe Rate:** Keep below 0.5%
- **Bounce Rate:** Keep below 2%

### Compliance

- **GDPR:** Include unsubscribe link (required)
- **CAN-SPAM:** Include physical address (if applicable)
- **Consent:** Only send to subscribers who opted in
- **Data Protection:** Don't share subscriber data

---

## Template Customization

### Adding New Sections

1. Copy an existing section structure
2. Modify content and styling
3. Maintain table-based layout
4. Test across email clients
5. Update this document with new section guidelines

### Modifying Colors

1. Find all instances of the color in the template
2. Replace with new color (use hex codes)
3. Ensure sufficient contrast (WCAG AA minimum)
4. Test in dark mode if applicable

### Updating Images

1. Optimize new images (compress, resize)
2. Upload to website server
3. Update image URLs in template
4. Update alt text for accessibility
5. Test image loading

---

## Troubleshooting

### Common Issues

**Images Not Loading:**
- Check URLs are absolute (https://)
- Verify images are uploaded to server
- Check image file permissions

**Layout Breaking:**
- Ensure all tables have `role="presentation"`
- Check for unclosed tags
- Verify table structure is correct

**Text Too Small on Mobile:**
- Increase font sizes in media queries
- Reduce padding to fit more content
- Simplify layout for mobile

**Buttons Not Clickable:**
- Ensure sufficient padding around buttons
- Check link URLs are correct
- Verify button is inside `<a>` tag, not `<div>`

**Outlook Rendering Issues:**
- Simplify table structure
- Use VML for complex backgrounds (if needed)
- Test in Outlook specifically

---

## Resources

### Brand Assets

- **Logo (Horizontal):** `/Images/long logo.png`
- **Logo (Circle):** `/Images/circle logo.png`
- **Service Icons:** `/Images/Tax.png`, `/Images/Accounts.png`, `/Images/Advisory.png`
- **Blog Images:** `/Images/blog/`

### External Resources

- [Email Client Support Guide](https://www.caniemail.com/)
- [Brevo Documentation](https://developers.brevo.com/)
- [Email Design Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Version History

- **v1.0** (January 2025) - Initial master template with 12 sections
- Created for Black and White Accounting
- Brevo-compatible, mobile-optimized, multi-client tested

---

## Contact

For questions or updates to this template:
- **Email:** info@blackandwhiteaccounting.co.uk
- **Website:** https://www.blackandwhiteaccounting.co.uk
- **Phone:** 0800 140 4644

---

**Last Updated:** January 2025
