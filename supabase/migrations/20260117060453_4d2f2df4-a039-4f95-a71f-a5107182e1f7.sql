-- Create a function to handle new user registration
-- This runs as SECURITY DEFINER to bypass RLS
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
  );

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- Create extended profile based on role
  IF user_role = 'teacher' THEN
    INSERT INTO public.teachers (id) VALUES (NEW.id);
  ELSIF user_role = 'student' THEN
    INSERT INTO public.students (id) VALUES (NEW.id);
  ELSIF user_role = 'parent' THEN
    INSERT INTO public.parents (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();