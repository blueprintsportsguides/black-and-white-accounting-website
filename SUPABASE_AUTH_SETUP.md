# Supabase Auth Setup for Admin

Admin login uses **Supabase Auth** with email/password. Follow these steps.

## 1. Enable Email Auth in Supabase

1. In [Supabase Dashboard](https://app.supabase.com) → your project
2. **Authentication** → **Providers** → **Email**
3. Ensure **Email** is **enabled**
4. Optionally:
   - **Confirm email**: if ON, new users must click the link in the email before they can log in. Turn OFF if you want immediate access after sign-up.
   - **Secure email change**: recommended ON.

## 2. Redirect URLs and Site URL

1. **Authentication** → **URL Configuration**
2. **Site URL**: set to your **production** URL, e.g. `https://yourdomain.com` (not `http://localhost:3000`). If Site URL is localhost, “Confirm your email” links can point to localhost.
3. **Redirect URLs** – add:
   - `https://yourdomain.com/admin-set-password`
   - `https://yourdomain.com/admin-login`
   - For local dev: `http://localhost:3000/admin-set-password` and `http://localhost:3000/admin-login`

Sign-up passes `emailRedirectTo: origin + '/admin-login'`, so the confirm-email link uses the site the user signed up from (production or localhost). Password-reset links go to `/admin-set-password#...`.

**If confirm-email still goes to localhost:** In Supabase → **Authentication** → **Email Templates** → “Confirm signup”, ensure the link uses `{{ .RedirectTo }}` (or `{{ .ConfirmationURL }}`) rather than `{{ .SiteURL }}`, and that **Site URL** is your production URL.

## 3. Environment variables

Same as for the blog:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set in Vercel (and in `.env.local` for local dev). Redeploy after changing them.

## 4. Sign up (temporary)

1. Go to **/admin-signup**
2. Create accounts for everyone who needs admin access
3. If “Confirm email” is on, each user must click the link in the sign-up email before they can log in

## 5. When everyone has an account: turn off sign-up

1. **Authentication** → **Providers** → **Email**
2. Turn **OFF** “Enable email signup” (or similar)
3. Optionally remove or replace the “Create an account” link on `/admin-login` with text like “Contact an admin for access”, or delete `/admin-signup.html` and the `/admin-signup` route so the page 404s.

## 6. Forgot password flow

- User goes to **/admin-login** → **Forgot password?** → **/admin-forgot-password**
- Enters email → Supabase sends a reset email
- User clicks the link → **/admin-set-password** → sets new password → redirected to **/admin-login**

No extra code required; Supabase sends the emails.

## 7. Optional: restrict who can sign up

Supabase does not support “invite-only” sign-up by default. To restrict sign-up:

- **Option A**: Turn off public sign-up (step 5) and create users yourself in **Authentication** → **Users** → **Add user** (email + password). You can then remove `/admin-signup` as above.
- **Option B**: Use Supabase’s “invite user by email” if you enable that in your project.
- **Option C**: Keep sign-up on but only share `/admin-signup` with people you trust, then turn it off once they have accounts.

## Summary

| Page | Purpose |
|------|---------|
| `/admin-login` | Email + password login; links to Forgot password and Sign up |
| `/admin-signup` | Create account (remove or hide when no longer needed) |
| `/admin-forgot-password` | Request password reset email |
| `/admin-set-password` | Set new password from the link in the reset email |
