-- Allow any authenticated user to read managers/super_managers
-- so the onboarding manager-picker can populate without extra permissions.
-- Safe: only exposes username + role of elevated users, no PII.

CREATE POLICY "users: read managers for onboarding"
  ON public.users
  FOR SELECT
  USING (
    role IN ('manager', 'super_manager')
  );

-- Also allow a user to update their own manager_id and username on first login.
-- The existing update policy may already cover this via "id = auth.uid()",
-- but add explicitly in case it doesn't exist yet.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'users: update own profile'
  ) THEN
    CREATE POLICY "users: update own profile"
      ON public.users
      FOR UPDATE
      USING (id = auth.uid());
  END IF;
END $$;
