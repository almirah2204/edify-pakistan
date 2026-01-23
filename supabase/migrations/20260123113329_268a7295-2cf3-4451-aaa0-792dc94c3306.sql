-- Add fee_category to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS fee_category text DEFAULT 'Normal';

-- Modify fee_structures table to support multiple classes
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS applicable_classes jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS fee_category text DEFAULT 'Normal';

-- Create student_fees table for individual fee assignments
CREATE TABLE IF NOT EXISTS public.student_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  assigned_amount numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  discount_reason text,
  final_amount numeric NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create fee_invoices table for monthly challans
CREATE TABLE IF NOT EXISTS public.fee_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- e.g., '2026-01'
  base_amount numeric NOT NULL DEFAULT 0,
  arrears numeric DEFAULT 0,
  late_fine numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  total_due numeric NOT NULL,
  amount_paid numeric DEFAULT 0,
  balance numeric GENERATED ALWAYS AS (total_due - COALESCE(amount_paid, 0)) STORED,
  due_date date NOT NULL,
  status text DEFAULT 'pending', -- pending, partial, paid, overdue
  pdf_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create fee_payments table for payment records
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.fee_invoices(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL, -- Cash, Bank, EasyPaisa, JazzCash, Card
  reference_number text,
  received_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create fee_settings table for configurable settings
CREATE TABLE IF NOT EXISTS public.fee_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

-- Insert default late fine settings
INSERT INTO public.fee_settings (setting_key, setting_value, description)
VALUES ('late_fine', '{"per_day": 50, "max_fine": 500, "grace_days": 0}', 'Late fine configuration: per day amount and maximum cap')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.fee_settings (setting_key, setting_value, description)
VALUES ('due_day', '{"day": 10}', 'Default due day of month for fee payment')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_fees
CREATE POLICY "Admins can manage student_fees" ON public.student_fees
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Students can view own fees" ON public.student_fees
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children fees" ON public.student_fees
FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.parent_id = auth.uid()));

-- RLS policies for fee_invoices
CREATE POLICY "Admins can manage fee_invoices" ON public.fee_invoices
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Students can view own invoices" ON public.fee_invoices
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children invoices" ON public.fee_invoices
FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = fee_invoices.student_id AND students.parent_id = auth.uid()));

-- RLS policies for fee_payments
CREATE POLICY "Admins can manage fee_payments" ON public.fee_payments
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Students can view own payments" ON public.fee_payments
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children payments" ON public.fee_payments
FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.parent_id = auth.uid()));

-- RLS policies for fee_settings (admin only)
CREATE POLICY "Admins can manage fee_settings" ON public.fee_settings
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Authenticated can view fee_settings" ON public.fee_settings
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create trigger to update updated_at
CREATE TRIGGER update_student_fees_updated_at BEFORE UPDATE ON public.student_fees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_invoices_updated_at BEFORE UPDATE ON public.fee_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_student_id ON public.fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_month_year ON public.fee_invoices(month_year);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_status ON public.fee_invoices(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_invoice_id ON public.fee_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON public.fee_payments(student_id);