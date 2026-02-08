-- SDMPK Multi-Tenant Foundation - Part 2: Super Admin Role

-- 1. Add 'super_admin' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';