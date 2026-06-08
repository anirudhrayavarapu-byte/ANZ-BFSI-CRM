-- Run this ONCE in Supabase SQL Editor.
-- Creates a trigger that auto-inserts a public.users row
-- whenever someone accepts an invite and signs up via Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1),  -- e.g. "rahul.sharma" from "rahul.sharma@techmahindra.com"
    'team_member'                    -- default role; promote to manager/super_manager via app
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
