# Email Countdown Setup Guide

## Overview

The email template includes a countdown timer for Making Tax Digital (5th April 2026). Since email clients don't support JavaScript, we use a countdown image service that automatically updates.

## Recommended Services

### Option 1: CountdownMail.com (Recommended)

**Why:** Easy setup, reliable, works in all email clients

**Setup Steps:**

1. **Sign up:** Go to https://countdownmail.com
2. **Create countdown:**
   - Target date: `2026-04-05 00:00:00`
   - Choose style/design
   - Select time units: Months, Days, Hours, Minutes
3. **Get image URL:** Copy the generated image URL
4. **Update template:** Replace `YOUR_API_KEY` in the template with your CountdownMail image URL

**URL Format:**
```
https://countdownmail.com/api/YOUR_API_KEY/2026-04-05T00:00:00
```

**Pros:**
- Free tier available
- Automatically updates
- Works in all email clients
- Customizable design

---

### Option 2: MailTimers.com

**Setup Steps:**

1. Visit https://mailtimers.com
2. Create a countdown timer
3. Set target: April 5, 2026, 00:00:00
4. Copy the image URL
5. Replace in template

**Pros:**
- Simple interface
- Free to use
- Automatic updates

---

### Option 3: MailCountdown.com

**Setup Steps:**

1. Visit https://mailcountdown.com
2. Create countdown
3. Get image URL
4. Update template

---

## Current Template Setup

The template currently has a placeholder:

```html
<img src="https://countdownmail.com/api/YOUR_API_KEY/2026-04-05T00:00:00" ...>
```

**To activate:**
1. Sign up for CountdownMail (or another service)
2. Create your countdown
3. Replace `YOUR_API_KEY` with your actual countdown image URL

---

## Quick Start (CountdownMail)

1. **Visit:** https://countdownmail.com
2. **Sign up** (free account)
3. **Create Timer:**
   - Name: "MTD Countdown"
   - Expiration: `2026-04-05 00:00:00`
   - Style: Choose one that matches your brand
   - Units: Months, Days, Hours, Minutes
4. **Copy Image URL** from your dashboard
5. **Update Template:**
   - Find: `src="https://countdownmail.com/api/YOUR_API_KEY/..."`
   - Replace with your actual image URL

---

## Alternative: Static Countdown (Manual Updates)

If you prefer not to use a service, you can:

1. Create a countdown image manually
2. Upload to Supabase
3. Update the image URL in template
4. **Update manually** before each email send

**Not recommended** - requires manual calculation and updates before every send.

---

## Testing

After setting up your countdown:

1. **Test in browser:** Open the HTML file and check the countdown loads
2. **Test in email client:** Send a test email to yourself
3. **Verify updates:** Wait a few minutes and check the countdown updates automatically

---

## Troubleshooting

**Countdown not showing:**
- Check the image URL is correct
- Verify the service is accessible
- Ensure the URL is absolute (starts with `https://`)

**Countdown not updating:**
- Some services cache images - wait a few minutes
- Check your service account is active
- Verify the target date is correct

**Countdown looks wrong:**
- Try a different style/design in your countdown service
- Adjust size parameters in the URL
- Check mobile responsiveness

---

## Service Comparison

| Service | Free Tier | Auto-Update | Customization | Ease of Use |
|---------|-----------|-------------|---------------|-------------|
| CountdownMail | ✅ Yes | ✅ Yes | ⭐⭐⭐ | ⭐⭐⭐ |
| MailTimers | ✅ Yes | ✅ Yes | ⭐⭐ | ⭐⭐⭐ |
| MailCountdown | ✅ Yes | ✅ Yes | ⭐⭐ | ⭐⭐ |

**Recommendation:** Start with CountdownMail - it's the most reliable and feature-rich.

---

## Need Help?

- CountdownMail Support: https://countdownmail.com/support
- MailTimers Support: https://mailtimers.com/support
- Or contact: info@blackandwhiteaccounting.co.uk

---

**Last Updated:** January 2025
