-- Triage System - Supabase schema
-- Run this in Supabase SQL Editor after auth is set up.
-- Team = Supabase Auth users; profiles store display info for Assign To / Created By.

-- Profiles: one per auth user (id = auth.users.id). Used for Assign To and Created By.
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Triage categories (e.g. Tax, Accounts, Advisory)
CREATE TABLE IF NOT EXISTS triage_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE triage_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read categories" ON triage_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert categories" ON triage_categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- Triage entries. archived_at IS NULL = active; set when "Mark as Done".
CREATE TABLE IF NOT EXISTS triage_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  business_name text,
  client_phone text,
  client_email text,
  description text NOT NULL,
  importance text NOT NULL CHECK (importance IN ('critical','high','medium','low')),
  assigned_to_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN (
    'open','in-progress','resolved','no-action-required','reallocated','awaiting-further-information'
  )),
  deadline timestamptz,
  notes text,
  category_id uuid REFERENCES triage_categories(id) ON DELETE SET NULL,
  confirmation1 boolean DEFAULT false,
  confirmation2 boolean DEFAULT false,
  confirmation3 boolean DEFAULT false,
  created_by_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_triage_entries_archived ON triage_entries(archived_at);
CREATE INDEX IF NOT EXISTS idx_triage_entries_created_at ON triage_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_triage_entries_importance ON triage_entries(importance);
CREATE INDEX IF NOT EXISTS idx_triage_entries_status ON triage_entries(status);
CREATE INDEX IF NOT EXISTS idx_triage_entries_assigned ON triage_entries(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_triage_entries_deadline ON triage_entries(deadline);

ALTER TABLE triage_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select triage" ON triage_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert triage" ON triage_entries
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update triage" ON triage_entries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete triage" ON triage_entries
  FOR DELETE TO authenticated USING (true);

-- Optional: trigger to create profile on signup (run if you want automatic profile creation)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, display_name)
--   VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
