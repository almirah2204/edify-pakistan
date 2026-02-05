import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateClassData {
  name: string;
  section?: string | null;
  grade_level?: number | null;
  academic_year?: string | null;
  teacher_id?: string | null;
}

interface UpdateClassData extends Partial<CreateClassData> {
  id: string;
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClassData) => {
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert({
          name: data.name,
          section: data.section || null,
          grade_level: data.grade_level || null,
          academic_year: data.academic_year || null,
          teacher_id: data.teacher_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newClass;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateClassData) => {
      const { error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}
