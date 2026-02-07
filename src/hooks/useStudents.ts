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
  father_name: string | null;
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
      father_name?: string;
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

// Create student with profile (admin-only, no auth user created)
export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      full_name: string;
      email?: string;
      phone?: string;
      class_id?: string | null;
      admission_no?: string;
      gender?: string;
      date_of_birth?: string | null;
      address?: string;
      blood_group?: string;
      father_name?: string;
    }) => {
      // Generate a unique ID for this student record
      const studentId = crypto.randomUUID();
      
      // First create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: studentId,
          full_name: data.full_name,
          email: data.email || null,
          phone: data.phone || null,
          is_approved: true,
        });
      
      if (profileError) throw profileError;
      
      // Then create the student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: studentId,
          class_id: data.class_id || null,
          admission_no: data.admission_no || null,
          gender: data.gender || null,
          date_of_birth: data.date_of_birth || null,
          address: data.address || null,
          blood_group: data.blood_group || null,
          father_name: data.father_name || null,
        });
      
      if (studentError) {
        // Rollback profile if student creation fails
        await supabase.from('profiles').delete().eq('id', studentId);
        throw studentError;
      }
      
      // Assign student role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: studentId,
          role: 'student',
        });
      
      if (roleError) {
        console.warn('Could not assign student role:', roleError);
      }
      
      return { id: studentId, admission_no: data.admission_no };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
