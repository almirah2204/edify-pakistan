import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string | null;
  date: string;
  status: string;
  remarks: string | null;
  marked_by: string | null;
  created_at: string | null;
  student?: {
    id: string;
    profile?: {
      full_name: string;
    };
  };
}

export function useAttendance(classId?: string, date?: string) {
  return useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(
            id,
            profile:profiles!students_id_fkey(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Attendance[];
    },
  });
}

export function useAttendanceByClass(classId: string, date?: string) {
  return useQuery({
    queryKey: ['attendance', 'class', classId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(
            id,
            profile:profiles!students_id_fkey(full_name)
          )
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!classId,
  });
}

export function useAttendanceByStudent(studentId: string) {
  return useQuery({
    queryKey: ['attendance', 'student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!studentId,
  });
}

export function useAttendanceStats(classId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['attendance', 'stats', classId, startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('attendance').select('status');

      if (classId) {
        query = query.eq('class_id', classId);
      }
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const total = data.length;
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      const late = data.filter(a => a.status === 'late').length;

      return { total, present, absent, late, presentPercentage: total > 0 ? (present / total) * 100 : 0 };
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceData: Array<{
      student_id: string;
      class_id: string;
      date: string;
      status: string;
      marked_by: string;
      remarks?: string;
    }>) => {
      // Use upsert to handle both new and updated attendance
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceData, { 
          onConflict: 'student_id,date',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
