import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimetableEntry {
  id: string;
  class_id: string;
  subject: string;
  day_of_week: number | null;
  period_number: number | null;
  teacher_id: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string | null;
  teacher?: {
    id: string;
    full_name: string;
  } | null;
  class?: {
    name: string;
    section: string | null;
  } | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export { DAYS };

export function useTimetableByClass(classId: string) {
  return useQuery({
    queryKey: ['timetable', 'class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('class_id', classId)
        .order('day_of_week')
        .order('period_number');

      if (error) throw error;
      return data as TimetableEntry[];
    },
    enabled: !!classId,
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      class_id: string;
      subject: string;
      day_of_week: number;
      period_number: number;
      teacher_id?: string | null;
      start_time?: string;
      end_time?: string;
    }) => {
      const { error } = await supabase.from('timetable').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}

export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; subject?: string; teacher_id?: string | null; start_time?: string; end_time?: string }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('timetable').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timetable').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}
