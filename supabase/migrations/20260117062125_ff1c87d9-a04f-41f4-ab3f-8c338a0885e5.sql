-- Recreate the trigger on auth.users (it may have been lost)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  ON CONFLICT (user_id, role) DO NOTHING;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix missing profile for existing user
INSERT INTO public.profiles (id, email, full_name, is_approved, language_pref)
SELECT id, email, split_part(email, '@', 1), false, 'en'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Fix missing roles for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT DO NOTHING;

-- Fix missing extended profiles
INSERT INTO public.students (id)
SELECT ur.user_id
FROM public.user_roles ur
WHERE ur.role = 'student' AND ur.user_id NOT IN (SELECT id FROM public.students)
ON CONFLICT (id) DO NOTHING;