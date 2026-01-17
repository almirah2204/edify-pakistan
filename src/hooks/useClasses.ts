import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Class {
  id: string;
  name: string;
  section: string | null;
  grade_level: number | null;
  academic_year: string | null;
  teacher_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  teacher?: {
    id: string;
    profile?: {
      full_name: string;
    };
  } | null;
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:teachers(
            id,
            profile:profiles!teachers_id_fkey(full_name)
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        teacher: Array.isArray(item.teacher) ? item.teacher[0] || null : item.teacher,
      })) as Class[];
    },
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ['class', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:teachers(
            id,
            profile:profiles!teachers_id_fkey(full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        teacher: Array.isArray(data.teacher) ? data.teacher[0] || null : data.teacher,
      } as Class;
    },
    enabled: !!id,
  });
}
