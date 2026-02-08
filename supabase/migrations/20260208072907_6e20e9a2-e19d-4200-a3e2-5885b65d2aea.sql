-- SDMPK Multi-Tenant Foundation - Part 1: Schema Setup

-- 1. Create schools table (core tenant entity)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  principal_name TEXT,
  
  subscription_plan TEXT DEFAULT 'trial',
  subscription_status TEXT DEFAULT 'active',
  subscription_start DATE DEFAULT CURRENT_DATE,
  subscription_end DATE,
  max_students INTEGER DEFAULT 50,
  max_staff INTEGER DEFAULT 10,
  
  academic_year TEXT DEFAULT '2025-2026',
  timezone TEXT DEFAULT 'Asia/Karachi',
  currency TEXT DEFAULT 'PKR',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add school_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

-- 3. Create index for faster school-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);

-- 4. Enable RLS on schools table
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 5. Create function to get user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- 6. RLS Policies for schools table (using existing has_role for admin)
CREATE POLICY "Admins can view their own school"
ON public.schools
FOR SELECT
USING (
  id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "Admins can update their own school"
ON public.schools
FOR UPDATE
USING (
  id = public.get_user_school_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- 7. Trigger for updated_at on schools
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Update handle_new_user function to support school_id
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
    CASE WHEN user_role = 'admin' THEN true ELSE false END,
    'en',
    user_school_id
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO NOTHING;

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