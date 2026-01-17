-- Create role enum (secure approach)
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
      AND role = _role
  )
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles table (no role stored here)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    language_pref TEXT DEFAULT 'en' CHECK (language_pref IN ('en', 'ur')),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table (create before students due to FK)
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    section TEXT,
    grade_level INTEGER,
    teacher_id UUID REFERENCES public.profiles(id),
    academic_year TEXT DEFAULT '2024-2025',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers extended profile
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    designation TEXT,
    department TEXT,
    qualification TEXT,
    salary DECIMAL(10,2),
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents extended profile
CREATE TABLE public.parents (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    occupation TEXT,
    address TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students extended profile
CREATE TABLE public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id),
    parent_id UUID REFERENCES public.parents(id),
    cnic_bform TEXT,
    admission_no TEXT UNIQUE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher class assignments (many-to-many)
CREATE TABLE public.teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, class_id, subject)
);

-- Attendance
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES public.profiles(id),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, date)
);

-- Fee structure
CREATE TABLE public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    amount DECIMAL(10,2) NOT NULL,
    frequency TEXT CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fees/payments
CREATE TABLE public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    fee_structure_id UUID REFERENCES public.fee_structures(id),
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    receipt_url TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    subject TEXT,
    exam_date DATE,
    total_marks INTEGER DEFAULT 100,
    passing_marks INTEGER DEFAULT 33,
    exam_type TEXT CHECK (exam_type IN ('midterm', 'final', 'quiz', 'assignment')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results/Marks
CREATE TABLE public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    marks_obtained INTEGER,
    grade TEXT,
    remarks TEXT,
    marksheet_url TEXT,
    entered_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, exam_id)
);

-- Homework
CREATE TABLE public.homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id),
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    attachment_url TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices/Announcements
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_role app_role,
    target_class_id UUID REFERENCES public.classes(id),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Teacher salaries
CREATE TABLE public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    deductions DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_date DATE,
    slip_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teacher_id, month)
);

-- Leave requests
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT CHECK (leave_type IN ('sick', 'casual', 'annual', 'emergency')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable
CREATE TABLE public.timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    period_number INTEGER,
    subject TEXT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id),
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_profiles_approved ON public.profiles(is_approved);
CREATE INDEX idx_students_class ON public.students(class_id);
CREATE INDEX idx_students_parent ON public.students(parent_id);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_fees_student ON public.fees(student_id);
CREATE INDEX idx_fees_status ON public.fees(status);
CREATE INDEX idx_results_student ON public.results(student_id);
CREATE INDEX idx_homework_class ON public.homework(class_id);
CREATE INDEX idx_notices_role ON public.notices(target_role);
CREATE INDEX idx_timetable_class ON public.timetable(class_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles: users can see their own, admins can see all
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: own profile readable, admins can manage all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view student profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Classes: viewable by authenticated, manageable by admins
CREATE POLICY "Authenticated can view classes" ON public.classes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage classes" ON public.classes
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Teachers: viewable by authenticated, manageable by admins
CREATE POLICY "Authenticated can view teachers" ON public.teachers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage teachers" ON public.teachers
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update own record" ON public.teachers
    FOR UPDATE USING (auth.uid() = id);

-- Parents: own record and admins
CREATE POLICY "Parents can view own record" ON public.parents
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage parents" ON public.parents
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Students: complex access rules
CREATE POLICY "Students can view own record" ON public.students
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can view children" ON public.students
    FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Teachers can view class students" ON public.students
    FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Attendance
CREATE POLICY "Students can view own attendance" ON public.attendance
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children attendance" ON public.attendance
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid())
    );

CREATE POLICY "Teachers can manage attendance" ON public.attendance
    FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fees
CREATE POLICY "Students can view own fees" ON public.fees
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children fees" ON public.fees
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid())
    );

CREATE POLICY "Admins can manage fees" ON public.fees
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fee structures
CREATE POLICY "Authenticated can view fee structures" ON public.fee_structures
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage fee structures" ON public.fee_structures
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Exams
CREATE POLICY "Authenticated can view exams" ON public.exams
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can manage exams" ON public.exams
    FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins can manage exams" ON public.exams
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Results
CREATE POLICY "Students can view own results" ON public.results
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children results" ON public.results
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND parent_id = auth.uid())
    );

CREATE POLICY "Teachers can manage results" ON public.results
    FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins can manage results" ON public.results
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Homework
CREATE POLICY "Students can view class homework" ON public.homework
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.students WHERE id = auth.uid() AND class_id = homework.class_id)
    );

CREATE POLICY "Parents can view children homework" ON public.homework
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.parent_id = auth.uid() AND s.class_id = homework.class_id
        )
    );

CREATE POLICY "Teachers can manage homework" ON public.homework
    FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins can manage homework" ON public.homework
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Notices
CREATE POLICY "Users can view relevant notices" ON public.notices
    FOR SELECT USING (
        is_active = TRUE AND (
            target_role IS NULL OR 
            target_role = public.get_user_role(auth.uid())
        )
    );

CREATE POLICY "Admins can manage notices" ON public.notices
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Salaries (teachers see own, admins see all)
CREATE POLICY "Teachers can view own salary" ON public.salaries
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage salaries" ON public.salaries
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leave requests
CREATE POLICY "Users can view own leave requests" ON public.leave_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create leave requests" ON public.leave_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage leave requests" ON public.leave_requests
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Timetable
CREATE POLICY "Authenticated can view timetable" ON public.timetable
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage timetable" ON public.timetable
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Teacher classes
CREATE POLICY "Authenticated can view teacher classes" ON public.teacher_classes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage teacher classes" ON public.teacher_classes
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Activity logs
CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own activity" ON public.activity_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON public.activity_logs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();