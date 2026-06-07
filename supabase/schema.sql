-- ============================================================
-- TM BFSI CRM -- Full Database Schema
-- Run this in Supabase SQL Editor (once, on a fresh project)
-- ============================================================

-- ------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('team_member', 'manager', 'super_manager');
CREATE TYPE strategic_tier AS ENUM ('tier1', 'tier2', 'tier3');
CREATE TYPE sentiment AS ENUM ('very_negative', 'negative', 'neutral', 'positive', 'very_positive');
CREATE TYPE followup_interval AS ENUM ('1_week', '1_month', '1_quarter', 'custom');

-- ------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------

CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        user_role NOT NULL DEFAULT 'team_member',
  manager_id  UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  owner_id              UUID NOT NULL REFERENCES public.users(id),
  industry              TEXT,
  account_size          TEXT,
  annual_revenue        TEXT,
  strategic_importance  strategic_tier,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  is_active             BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES public.accounts(id),
  name        TEXT NOT NULL,
  title       TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  assigned_to UUID NOT NULL REFERENCES public.users(id),
  created_by  UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.client_details (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID UNIQUE NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  hot_buttons      TEXT,
  key_focus_areas  TEXT,
  likes            TEXT,
  dislikes         TEXT,
  notes            TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meetings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES public.clients(id),
  account_id          UUID NOT NULL REFERENCES public.accounts(id),
  logged_by           UUID REFERENCES public.users(id),
  meeting_date        DATE,
  attendees           TEXT,
  topics_discussed    TEXT,
  topics_custom       TEXT,
  discussion_summary  TEXT,
  outcomes            TEXT,
  client_sentiment    sentiment,
  next_followup       followup_interval,
  next_followup_date  DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meeting_attendees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id  UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id),
  UNIQUE (meeting_id, user_id)
);

-- ------------------------------------------------------------
-- 3. UPDATED_AT TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_client_details_updated_at
  BEFORE UPDATE ON public.client_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ------------------------------------------------------------
-- 4. AUTO-CREATE USER PROFILE ON SIGNUP
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'team_member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 5. HELPER FUNCTIONS FOR RLS
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 6. ENABLE ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_details    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 7. RLS POLICIES
-- ------------------------------------------------------------

-- USERS
CREATE POLICY "users: read own and team" ON public.users FOR SELECT USING (
  id = auth.uid()
  OR manager_id = auth.uid()
  OR public.current_user_role() = 'super_manager'
);

CREATE POLICY "users: update own" ON public.users FOR UPDATE USING (
  id = auth.uid()
);

-- ACCOUNTS
CREATE POLICY "accounts: select" ON public.accounts FOR SELECT USING (
  public.current_user_role() IN ('manager', 'super_manager')
  OR owner_id = auth.uid()
  OR id IN (SELECT account_id FROM public.clients WHERE assigned_to = auth.uid())
);

CREATE POLICY "accounts: insert" ON public.accounts FOR INSERT WITH CHECK (
  owner_id = auth.uid()
  OR public.current_user_role() IN ('manager', 'super_manager')
);

CREATE POLICY "accounts: update" ON public.accounts FOR UPDATE USING (
  owner_id = auth.uid()
  OR public.current_user_role() IN ('manager', 'super_manager')
);

-- CLIENTS
CREATE POLICY "clients: select" ON public.clients FOR SELECT USING (
  public.current_user_role() = 'super_manager'
  OR assigned_to = auth.uid()
  OR (
    public.current_user_role() = 'manager'
    AND assigned_to IN (SELECT id FROM public.users WHERE manager_id = auth.uid())
  )
);

CREATE POLICY "clients: insert" ON public.clients FOR INSERT WITH CHECK (
  assigned_to = auth.uid()
  OR public.current_user_role() IN ('manager', 'super_manager')
);

CREATE POLICY "clients: update" ON public.clients FOR UPDATE USING (
  assigned_to = auth.uid()
  OR (
    public.current_user_role() = 'manager'
    AND assigned_to IN (SELECT id FROM public.users WHERE manager_id = auth.uid())
  )
  OR public.current_user_role() = 'super_manager'
);

-- CLIENT_DETAILS
CREATE POLICY "client_details: select" ON public.client_details FOR SELECT USING (
  client_id IN (
    SELECT id FROM public.clients WHERE
      assigned_to = auth.uid()
      OR public.current_user_role() = 'super_manager'
      OR (
        public.current_user_role() = 'manager'
        AND assigned_to IN (SELECT id FROM public.users WHERE manager_id = auth.uid())
      )
  )
);

CREATE POLICY "client_details: insert" ON public.client_details FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM public.clients WHERE assigned_to = auth.uid())
  OR public.current_user_role() IN ('manager', 'super_manager')
);

CREATE POLICY "client_details: update" ON public.client_details FOR UPDATE USING (
  client_id IN (
    SELECT id FROM public.clients WHERE
      assigned_to = auth.uid()
      OR public.current_user_role() = 'super_manager'
      OR (
        public.current_user_role() = 'manager'
        AND assigned_to IN (SELECT id FROM public.users WHERE manager_id = auth.uid())
      )
  )
);

-- MEETINGS
CREATE POLICY "meetings: select" ON public.meetings FOR SELECT USING (
  public.current_user_role() = 'super_manager'
  OR client_id IN (
    SELECT id FROM public.clients WHERE
      assigned_to = auth.uid()
      OR (
        public.current_user_role() = 'manager'
        AND assigned_to IN (SELECT id FROM public.users WHERE manager_id = auth.uid())
      )
  )
);

CREATE POLICY "meetings: insert" ON public.meetings FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM public.clients WHERE assigned_to = auth.uid())
  OR public.current_user_role() IN ('manager', 'super_manager')
);

CREATE POLICY "meetings: update" ON public.meetings FOR UPDATE USING (
  logged_by = auth.uid()
  OR public.current_user_role() IN ('manager', 'super_manager')
);

-- MEETING_ATTENDEES
CREATE POLICY "meeting_attendees: select" ON public.meeting_attendees FOR SELECT USING (
  meeting_id IN (SELECT id FROM public.meetings)
);

CREATE POLICY "meeting_attendees: insert" ON public.meeting_attendees FOR INSERT WITH CHECK (
  meeting_id IN (SELECT id FROM public.meetings)
);
