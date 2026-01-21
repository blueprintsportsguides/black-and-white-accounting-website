# Environment Variables Setup

## Your Supabase Credentials

You've provided:
- **Project URL**: `https://hapkzfobjmhpcdzzyzgd.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcGt6Zm9iam1ocGNkenp5emdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Nzk0NzQsImV4cCI6MjA4NDU1NTQ3NH0.ANDrsxpqLRIrF1baVmudyLmpjDEaqzEnD1g9vKYfNoI`

## Step 1: Create .env.local File (for local testing)

1. In your project root folder (same folder as `package.json`), create a file called `.env.local`
2. Add these two lines:

```
VITE_SUPABASE_URL=https://hapkzfobjmhpcdzzyzgd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcGt6Zm9iam1ocGNkenp5emdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Nzk0NzQsImV4cCI6MjA4NDU1NTQ3NH0.ANDrsxpqLRIrF1baVmudyLmpjDEaqzEnD1g9vKYfNoI
```

3. Save the file
4. Restart your dev server (`npm run dev`)

## Step 2: Add to Vercel (for production)

1. Go to **https://vercel.com** and log in
2. Find your project and click on it
3. Click **Settings** tab
4. Click **Environment Variables** in the left menu
5. Add these two variables:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://hapkzfobjmhpcdzzyzgd.supabase.co`
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcGt6Zm9iam1ocGNkenp5emdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Nzk0NzQsImV4cCI6MjA4NDU1NTQ3NH0.ANDrsxpqLRIrF1baVmudyLmpjDEaqzEnD1g9vKYfNoI`
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

6. Go to **Deployments** tab
7. Click the **"..."** menu on your latest deployment
8. Click **"Redeploy"** to activate the new variables

## Next Steps

1. Make sure you've run the SQL setup in Supabase (from SUPABASE_SIMPLE_SETUP.md)
2. **Admin login** uses Supabase Auth (email/password). See **SUPABASE_AUTH_SETUP.md** for sign-up, forgot password, and turning off sign-up once everyone has an account.
3. **Redeploy** after adding env vars so the build picks up `VITE_SUPABASE_*` (needed at build time for blog and auth).
4. Test by opening `/blog` and clicking a post; individual post URLs like `/blog/my-post-slug` are served via the `/blog/:slug` rewrite.

## If blog post pages 404

- Ensure `vercel.json` includes the rewrite: `{ "source": "/blog/:slug", "destination": "/blog-post.html" }` (must come **before** the `/blog` → `blog.html` rule)
- Redeploy so the latest `vercel.json` and build are used
