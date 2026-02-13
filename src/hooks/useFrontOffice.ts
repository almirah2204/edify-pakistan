import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Enquiry {
  id: string;
  enquiry_date: string;
  student_name: string;
  father_name: string | null;
  contact_number: string | null;
  email: string | null;
  class_applied: string | null;
  previous_school: string | null;
  address: string | null;
  source: string | null;
  status: string | null;
  follow_up_date: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string | null;
}

export interface Visitor {
  id: string;
  visitor_name: string;
  phone: string | null;
  purpose: string;
  whom_to_meet: string | null;
  check_in: string;
  check_out: string | null;
  id_type: string | null;
  id_number: string | null;
  notes: string | null;
  created_at: string | null;
}

export function useEnquiries() {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Enquiry[];
    },
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Enquiry> & { student_name: string }) => {
      const { error } = await supabase.from('enquiries').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
}

export function useUpdateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<Enquiry>) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('enquiries').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
}

export function useVisitors() {
  return useQuery({
    queryKey: ['visitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('check_in', { ascending: false });
      if (error) throw error;
      return data as Visitor[];
    },
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Visitor> & { visitor_name: string; purpose: string }) => {
      const { error } = await supabase.from('visitors').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
}

export function useCheckoutVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('visitors').update({ check_out: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
}

export function useSalaries() {
  return useQuery({
    queryKey: ['salaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salaries')
        .select(`
          *,
          teacher:teachers!salaries_teacher_id_fkey(
            id,
            profile:profiles!teachers_id_fkey(full_name)
          )
        `)
        .order('month', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      teacher_id: string;
      month: string;
      base_salary: number;
      deductions?: number;
      bonuses?: number;
      net_salary: number;
      status?: string;
    }) => {
      const { error } = await supabase.from('salaries').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status?: string; paid_date?: string; net_salary?: number; deductions?: number; bonuses?: number }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('salaries').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
    },
  });
}
