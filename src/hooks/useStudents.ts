import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    section: string | null;
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
          class:classes(name, section)
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
          class:classes(name, section)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Student | null;
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

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      class_id?: string | null;
      admission_no?: string;
      gender?: string;
      date_of_birth?: string | null;
      address?: string;
      blood_group?: string;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// Note: Creating a student requires creating an auth user first (signup flow)
// This mutation is for updating student details for existing users
export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      full_name: string;
      email: string;
      class_id?: string | null;
      admission_no?: string;
      gender?: string;
      date_of_birth?: string | null;
      address?: string;
      blood_group?: string;
    }) => {
      // For admin creating student, we'd need to use auth admin API
      // For now, throw an error indicating this needs signup flow
      throw new Error('Students must register through the signup flow. Use the signup page to create student accounts.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
