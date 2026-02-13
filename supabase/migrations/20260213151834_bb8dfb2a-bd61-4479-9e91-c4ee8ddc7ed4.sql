
-- Front Office: Enquiries table
CREATE TABLE public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  student_name TEXT NOT NULL,
  father_name TEXT,
  contact_number TEXT,
  email TEXT,
  class_applied TEXT,
  previous_school TEXT,
  address TEXT,
  source TEXT DEFAULT 'walk-in',
  status TEXT DEFAULT 'new',
  follow_up_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enquiries" ON public.enquiries FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Super admins can manage all enquiries" ON public.enquiries FOR ALL
  USING (is_super_admin(auth.uid()));

-- Front Office: Visitors log
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  phone TEXT,
  purpose TEXT NOT NULL,
  whom_to_meet TEXT,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  id_type TEXT,
  id_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage visitors" ON public.visitors FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Super admins can manage all visitors" ON public.visitors FOR ALL
  USING (is_super_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
