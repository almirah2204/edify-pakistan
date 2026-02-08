-- SDMPK Multi-Tenant Foundation - Part 3: Super Admin Functions & Policies

-- 1. Create security definer function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- 2. Super admins can manage all schools
CREATE POLICY "Super admins can manage all schools"
ON public.schools
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 3. Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- 4. Super admins can manage all profiles
CREATE POLICY "Super admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 5. Super admins can manage all user_roles
CREATE POLICY "Super admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 6. Super admins can manage all students
CREATE POLICY "Super admins can manage all students"
ON public.students
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 7. Super admins can manage all teachers
CREATE POLICY "Super admins can manage all teachers"
ON public.teachers
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 8. Super admins can manage all classes
CREATE POLICY "Super admins can manage all classes"
ON public.classes
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 9. Super admins can manage all fees
CREATE POLICY "Super admins can manage all fees"
ON public.fees
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all fee_structures"
ON public.fee_structures
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage all fee_invoices"
ON public.fee_invoices
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- 10. Update handle_new_user to support super_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  user_full_name TEXT;
  user_school_id UUID;
BEGIN
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  user_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;

  INSERT INTO public.profiles (id, email, full_name, is_approved, language_pref, school_id)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    CASE WHEN user_role IN ('admin', 'super_admin') THEN true ELSE false END,
    'en',
    user_school_id
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create extended profile based on role (skip for super_admin)
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