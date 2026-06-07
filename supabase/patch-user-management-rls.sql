-- Allow managers to update their team members' role and active status
-- Allow super_managers to update any user
-- Run this in Supabase SQL Editor

DROP POLICY IF EXISTS "users: update own" ON public.users;

CREATE POLICY "users: update" ON public.users FOR UPDATE USING (
  id = auth.uid()
  OR manager_id = auth.uid()
  OR public.current_user_role() = 'super_manager'
);
