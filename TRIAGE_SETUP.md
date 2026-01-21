# Triage System Setup

The Triage system is built on Supabase. **Team members** and **who creates/assigns** are taken from **Supabase Auth users** and the `profiles` table.

## 1. Run the schema

In the Supabase SQL Editor, run the contents of **`supabase-triage.sql`**:

- `profiles` – one row per auth user (id, email, display_name). Used for **Assign To** and **Created By**.
- `triage_categories` – category names (e.g. Tax, Accounts, Advisory).
- `triage_entries` – triage items. `archived_at` is set when you **Mark as Done**.

## 2. Auth and env

- Supabase Auth must be set up (as for the blog admin).
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set.

## 3. Profiles

- The first time an auth user opens Triage, a `profiles` row is created/updated from their auth `id`, `email`, and `user_metadata.full_name` (or `email` as fallback).
- **Assign To** is filled from all `profiles` rows.
- To change how a user appears, update `profiles.display_name` in Supabase.

## 4. Access

- Open **Admin Hub** → **Triage System**, or go to `/admin/triage`.
- You must be logged in with Supabase Auth.

## 5. Behaviour (same as the original system)

- **Active** vs **Archive** (Mark as Done sets `archived_at`).
- **Filters**: importance, status, assigned to (auth user), category (multi), and search.
- **Sort**: newest, oldest, upcoming deadlines, importance.
- **Categories**: choose from list or **+ Add**; filter via **Categories** with checkboxes.
- **Form**: client and business, phone, email, description, category, importance, assign to, deadline, status, notes, and the three required confirmations.
