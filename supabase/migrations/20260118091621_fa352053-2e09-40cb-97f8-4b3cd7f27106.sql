-- CRITICAL: Fix all RESTRICTIVE policies by converting them to PERMISSIVE
-- The issue is ALL policies were created as RESTRICTIVE which blocks access

-- Drop and recreate ALL policies as PERMISSIVE for core tables

-- ====== PROFILES TABLE ======
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view student profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

-- ====== USER_ROLES TABLE ======
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== STUDENTS TABLE ======
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Teachers can view class students" ON public.students;
DROP POLICY IF EXISTS "Parents can view children" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

CREATE POLICY "Students can view own record" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own record" ON public.students
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view students" ON public.students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Parents can view children" ON public.students
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== TEACHERS TABLE ======
DROP POLICY IF EXISTS "Teachers can update own record" ON public.teachers;
DROP POLICY IF EXISTS "Authenticated can view teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;

CREATE POLICY "Teachers can view own record" ON public.teachers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can update own record" ON public.teachers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated can view teachers" ON public.teachers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage teachers" ON public.teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== PARENTS TABLE ======
DROP POLICY IF EXISTS "Parents can view own record" ON public.parents;
DROP POLICY IF EXISTS "Admins can manage parents" ON public.parents;

CREATE POLICY "Parents can view own record" ON public.parents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can update own record" ON public.parents
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage parents" ON public.parents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== CLASSES TABLE ======
DROP POLICY IF EXISTS "Authenticated can view classes" ON public.classes;
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;

CREATE POLICY "Authenticated can view classes" ON public.classes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can manage assigned classes" ON public.classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

-- ====== ATTENDANCE TABLE ======
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Parents can view children attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;

CREATE POLICY "Students can view own attendance" ON public.attendance
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = attendance.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Teachers can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== FEES TABLE ======
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;
DROP POLICY IF EXISTS "Parents can view children fees" ON public.fees;
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;

CREATE POLICY "Students can view own fees" ON public.fees
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children fees" ON public.fees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = fees.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Admins can manage fees" ON public.fees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== RESULTS TABLE ======
DROP POLICY IF EXISTS "Students can view own results" ON public.results;
DROP POLICY IF EXISTS "Parents can view children results" ON public.results;
DROP POLICY IF EXISTS "Teachers can manage results" ON public.results;
DROP POLICY IF EXISTS "Admins can manage results" ON public.results;

CREATE POLICY "Students can view own results" ON public.results
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Parents can view children results" ON public.results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = results.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Teachers can manage results" ON public.results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Admins can manage results" ON public.results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== HOMEWORK TABLE ======
DROP POLICY IF EXISTS "Students can view class homework" ON public.homework;
DROP POLICY IF EXISTS "Parents can view children homework" ON public.homework;
DROP POLICY IF EXISTS "Teachers can manage homework" ON public.homework;
DROP POLICY IF EXISTS "Admins can manage homework" ON public.homework;

CREATE POLICY "Students can view class homework" ON public.homework
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = auth.uid() AND students.class_id = homework.class_id)
  );

CREATE POLICY "Parents can view children homework" ON public.homework
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.parent_id = auth.uid() AND s.class_id = homework.class_id)
  );

CREATE POLICY "Teachers can manage homework" ON public.homework
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Admins can manage homework" ON public.homework
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== EXAMS TABLE ======
DROP POLICY IF EXISTS "Authenticated can view exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can manage exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;

CREATE POLICY "Authenticated can view exams" ON public.exams
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can manage exams" ON public.exams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Admins can manage exams" ON public.exams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== NOTICES TABLE ======
DROP POLICY IF EXISTS "Users can view relevant notices" ON public.notices;
DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;

CREATE POLICY "Users can view active notices" ON public.notices
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage notices" ON public.notices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can create notices" ON public.notices
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

-- ====== SALARIES TABLE ======
DROP POLICY IF EXISTS "Teachers can view own salary" ON public.salaries;
DROP POLICY IF EXISTS "Admins can manage salaries" ON public.salaries;

CREATE POLICY "Teachers can view own salary" ON public.salaries
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage salaries" ON public.salaries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== FEE_STRUCTURES TABLE ======
DROP POLICY IF EXISTS "Authenticated can view fee structures" ON public.fee_structures;
DROP POLICY IF EXISTS "Admins can manage fee structures" ON public.fee_structures;

CREATE POLICY "Authenticated can view fee structures" ON public.fee_structures
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage fee structures" ON public.fee_structures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== TIMETABLE TABLE ======
DROP POLICY IF EXISTS "Authenticated can view timetable" ON public.timetable;
DROP POLICY IF EXISTS "Admins can manage timetable" ON public.timetable;

CREATE POLICY "Authenticated can view timetable" ON public.timetable
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage timetable" ON public.timetable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can update timetable" ON public.timetable
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'teacher')
  );

-- ====== TEACHER_CLASSES TABLE ======
DROP POLICY IF EXISTS "Authenticated can view teacher classes" ON public.teacher_classes;
DROP POLICY IF EXISTS "Admins can manage teacher classes" ON public.teacher_classes;

CREATE POLICY "Authenticated can view teacher classes" ON public.teacher_classes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage teacher classes" ON public.teacher_classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== LEAVE_REQUESTS TABLE ======
DROP POLICY IF EXISTS "Users can view own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can create leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins can manage leave requests" ON public.leave_requests;

CREATE POLICY "Users can view own leave requests" ON public.leave_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage leave requests" ON public.leave_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== ACTIVITY_LOGS TABLE ======
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_logs;

CREATE POLICY "Users can view own activity" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own activity" ON public.activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ====== CREATE STORAGE BUCKETS FOR FILE UPLOADS ======
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('homework-attachments', 'homework-attachments', false),
  ('fee-receipts', 'fee-receipts', false),
  ('salary-slips', 'salary-slips', false),
  ('marksheets', 'marksheets', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (public)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for homework-attachments
CREATE POLICY "Teachers can upload homework attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'homework-attachments' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Authenticated can view homework attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'homework-attachments' AND auth.uid() IS NOT NULL);

-- Storage policies for fee-receipts
CREATE POLICY "Admins can manage fee receipts" ON storage.objects
  FOR ALL USING (
    bucket_id = 'fee-receipts' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view own fee receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'fee-receipts' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for salary-slips
CREATE POLICY "Admins can manage salary slips" ON storage.objects
  FOR ALL USING (
    bucket_id = 'salary-slips' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can view own salary slips" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'salary-slips' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for marksheets
CREATE POLICY "Teachers and admins can manage marksheets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'marksheets' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Students can view own marksheets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'marksheets' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Parents can view children marksheets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'marksheets' AND 
    EXISTS (SELECT 1 FROM public.students WHERE students.parent_id = auth.uid() AND students.id::text = (storage.foldername(name))[1])
  );

-- Storage policies for documents
CREATE POLICY "Authenticated can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.homework;