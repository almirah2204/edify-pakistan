-- Add UNIQUE constraint to admission_no column in students table
ALTER TABLE public.students ADD CONSTRAINT students_admission_no_unique UNIQUE (admission_no);

-- Add father_name column for duplicate detection
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS father_name text;