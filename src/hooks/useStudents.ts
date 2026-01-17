import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  admission_no: string | null;
  class_id: string | null;
  parent_id: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  blood_group: string | null;
  cnic_bform: string | null;
  created_at: string | null;
  profile?: {
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
  class?: {
    name: string;
  };
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles!students_id_fkey(full_name, email, phone, avatar_url),
          class:classes(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles!students_id_fkey(full_name, email, phone, avatar_url),
          class:classes(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Student;
    },
    enabled: !!id,
  });
}

export function useStudentsByClass(classId: string) {
  return useQuery({
    queryKey: ['students', 'class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles!students_id_fkey(full_name, email, phone, avatar_url)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
    enabled: !!classId,
  });
}
