import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Teacher {
  id: string;
  designation: string | null;
  department: string | null;
  qualification: string | null;
  salary: number | null;
  joining_date: string | null;
  created_at: string | null;
  profile?: {
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
}

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profile:profiles!teachers_id_fkey(full_name, email, phone, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Teacher[];
    },
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profile:profiles!teachers_id_fkey(full_name, email, phone, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Teacher;
    },
    enabled: !!id,
  });
}
