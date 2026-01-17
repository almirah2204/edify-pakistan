import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Fee {
  id: string;
  student_id: string;
  fee_structure_id: string | null;
  amount_due: number;
  amount_paid: number | null;
  due_date: string;
  paid_date: string | null;
  status: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string | null;
  student?: {
    id: string;
    profile?: {
      full_name: string;
    };
    class?: {
      name: string;
    };
  };
}

export function useFees() {
  return useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select(`
          *,
          student:students(
            id,
            profile:profiles!students_id_fkey(full_name),
            class:classes(name)
          )
        `)
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data as Fee[];
    },
  });
}

export function useFeesByStudent(studentId: string) {
  return useQuery({
    queryKey: ['fees', 'student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data as Fee[];
    },
    enabled: !!studentId,
  });
}

export function useFeeStats() {
  return useQuery({
    queryKey: ['fees', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('amount_due, amount_paid, status');

      if (error) throw error;

      const totalDue = data.reduce((sum, fee) => sum + Number(fee.amount_due), 0);
      const totalPaid = data.reduce((sum, fee) => sum + Number(fee.amount_paid || 0), 0);
      const pending = data.filter(f => f.status === 'pending').length;
      const paid = data.filter(f => f.status === 'paid').length;

      return { totalDue, totalPaid, pending, paid };
    },
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      amount_paid?: number;
      status?: string;
      payment_method?: string;
      paid_date?: string | null;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('fees')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      amount_due: number;
      due_date: string;
      fee_structure_id?: string;
    }) => {
      const { error } = await supabase
        .from('fees')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    },
  });
}
