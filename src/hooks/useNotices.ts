import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  target_role: string | null;
  target_class_id: string | null;
  is_active: boolean | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string | null;
  creator?: {
    full_name: string;
  } | null;
}

export function useNotices() {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          creator:profiles!notices_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notice[];
    },
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      priority?: string;
      target_role?: 'admin' | 'teacher' | 'student' | 'parent' | 'super_admin' | null;
      target_class_id?: string | null;
      expires_at?: string | null;
      created_by?: string;
    }) => {
      const { error } = await supabase.from('notices').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content?: string;
      priority?: string;
      target_role?: 'admin' | 'teacher' | 'student' | 'parent' | 'super_admin' | null;
      is_active?: boolean;
      expires_at?: string | null;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('notices').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}
