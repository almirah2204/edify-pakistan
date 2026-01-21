-- Fix infinite recursion in user_roles RLS by removing self-referential policy checks.
-- The previous policy queried public.user_roles inside a public.user_roles policy, which triggers recursion.

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Users can always read their own role row
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all roles (uses SECURITY DEFINER helper to avoid recursion)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
