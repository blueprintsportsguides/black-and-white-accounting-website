# Estate and Lettings Agents Email Campaign

Two-month email campaign (8 weeks) for local estate agents and lettings agents. Content focuses on UK tax and accounting services for their landlord and property-investor clients. Built for Brevo: HTML, mobile-friendly, no em dashes. Images use existing Supabase URLs from the website.

## Campaign structure

- **Duration:** 8 weeks (2 months)
- **Per week:** 1 marketing email (designed) + 1 personal email from Jon Mills (plain text style, logo only)
- **Total emails:** 16 (8 marketing + 8 Jon Mills)

## Sending order and schedule

Send in this order, with roughly 3–4 days between the two emails in each week (e.g. marketing Tuesday, Jon Mills Friday). Adjust days to suit your Brevo automation.

| Week | Marketing email (designed) | Jon Mills email (plain) |
|------|----------------------------|--------------------------|
| 1 | estate-agents-campaign-week-01-marketing.html | estate-agents-campaign-week-01-jon-mills.html |
| 2 | estate-agents-campaign-week-02-marketing.html | estate-agents-campaign-week-02-jon-mills.html |
| 3 | estate-agents-campaign-week-03-marketing.html | estate-agents-campaign-week-03-jon-mills.html |
| 4 | estate-agents-campaign-week-04-marketing.html | estate-agents-campaign-week-04-jon-mills.html |
| 5 | estate-agents-campaign-week-05-marketing.html | estate-agents-campaign-week-05-jon-mills.html |
| 6 | estate-agents-campaign-week-06-marketing.html | estate-agents-campaign-week-06-jon-mills.html |
| 7 | estate-agents-campaign-week-07-marketing.html | estate-agents-campaign-week-07-jon-mills.html |
| 8 | estate-agents-campaign-week-08-marketing.html | estate-agents-campaign-week-08-jon-mills.html |

## File list

### Marketing emails (designed, images, CTAs)
- estate-agents-campaign-week-01-marketing.html – Intro: accountancy for landlord clients
- estate-agents-campaign-week-02-marketing.html – Making Tax Digital for landlords (6 April 2026)
- estate-agents-campaign-week-03-marketing.html – Capital Gains Tax on property
- estate-agents-campaign-week-04-marketing.html – Rental income, expenses, landlord tax
- estate-agents-campaign-week-05-marketing.html – Incorporation Relief change (April 2026)
- estate-agents-campaign-week-06-marketing.html – Property and landlord accounting (full support)
- estate-agents-campaign-week-07-marketing.html – Tax year end and landlord deadlines
- estate-agents-campaign-week-08-marketing.html – Refer your landlord clients (thank you / CTA)

### Jon Mills emails (plain text style, logo at bottom only)
- estate-agents-campaign-week-01-jon-mills.html – Personal intro, why we value agent relationships
- estate-agents-campaign-week-02-jon-mills.html – MTD in plain language
- estate-agents-campaign-week-03-jon-mills.html – CGT and selling property
- estate-agents-campaign-week-04-jon-mills.html – Rental income and record-keeping
- estate-agents-campaign-week-05-jon-mills.html – Incorporation and structure
- estate-agents-campaign-week-06-jon-mills.html – How we work with landlord clients
- estate-agents-campaign-week-07-jon-mills.html – Year end reminder
- estate-agents-campaign-week-08-jon-mills.html – Thank you and open door

## Brevo setup

1. **Unsubscribe / preferences:** All marketing and Jon emails use `{{unsubscribe}}` and `{{preferences}}`. Map these to your Brevo unsubscribe and preference centre URLs in your template or campaign settings.
2. **From name for Jon emails:** Use "Jon Mills" (or "Jon Mills, Black and White Accounting") so the plain emails look like they come from the managing director.
3. **From name for marketing emails:** Use "Black and White Accounting" or your standard marketing sender.
4. **Images:** All image URLs point to your existing Supabase storage (`https://hapkzfobjmhpcdzzyzgd.supabase.co/storage/v1/object/public/Images/...`). No local paths; safe for Brevo and mobile.
5. **Testing:** Send test emails to yourself on desktop and mobile and check links, images and unsubscribe/preference links.

## Content themes (UK tax and recent news)

- MTD for Income Tax from 6 April 2026 (landlords £50k+ first wave, then £30k, £20k).
- Capital Gains Tax: higher receipts, rates 18% / 24% on residential property, £3,000 annual exemption, 60-day reporting for UK residential sales.
- Incorporation Relief: from April 2026 must be claimed (no automatic relief); deadlines matter.
- Rental income, mortgage interest restriction, allowable expenses, property allowance.
- Tax year end, Self Assessment and MTD quarterly deadlines.

## Notes

- No em dashes; wording uses commas or "to" instead.
- No first name or business name in copy; Jon emails are generic but personable.
- All copy is HTML; compatible with Brevo and typical email clients (Gmail, Outlook, Apple Mail). Tables and inline styles used for compatibility.
