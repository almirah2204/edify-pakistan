-- Recreate the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  user_full_name TEXT;
BEGIN
  -- Get role and full_name from user metadata
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, is_approved, language_pref)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    CASE WHEN user_role = 'admin' THEN true ELSE false END,
    'en'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create extended profile based on role
  IF user_role = 'teacher' THEN
    INSERT INTO public.teachers (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  ELSIF user_role = 'student' THEN
    INSERT INTO public.students (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  ELSIF user_role = 'parent' THEN
    INSERT INTO public.parents (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint on user_roles.user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;