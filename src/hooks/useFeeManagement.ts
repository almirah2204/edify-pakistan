import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  frequency: string | null;
  description: string | null;
  class_id: string | null;
  applicable_classes: string[] | null;
  fee_category: string | null;
  created_at: string | null;
}

export interface StudentFee {
  id: string;
  student_id: string;
  fee_structure_id: string | null;
  assigned_amount: number;
  discount_percent: number | null;
  discount_amount: number | null;
  discount_reason: string | null;
  final_amount: number;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  student?: {
    id: string;
    admission_no: string | null;
    fee_category: string | null;
    profile?: { full_name: string };
    class?: { id: string; name: string };
  };
  fee_structure?: FeeStructure;
}

export interface FeeInvoice {
  id: string;
  student_id: string;
  month_year: string;
  base_amount: number;
  arrears: number | null;
  late_fine: number | null;
  discount: number | null;
  total_due: number;
  amount_paid: number | null;
  balance: number | null;
  due_date: string;
  status: string | null;
  pdf_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  student?: {
    id: string;
    admission_no: string | null;
    father_name: string | null;
    profile?: { full_name: string };
    class?: { id: string; name: string };
  };
}

export interface FeePayment {
  id: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_number: string | null;
  received_by: string | null;
  notes: string | null;
  created_at: string | null;
  invoice?: FeeInvoice;
  student?: {
    id: string;
    admission_no: string | null;
    profile?: { full_name: string };
  };
  receiver?: { full_name: string };
}

export interface FeeSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description: string | null;
  updated_at: string | null;
}

// Fee Structures Hooks
export function useFeeStructures() {
  return useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as FeeStructure[];
    },
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      amount: number;
      frequency?: string;
      description?: string;
      applicable_classes?: string[];
      fee_category?: string;
    }) => {
      const { error } = await supabase.from('fee_structures').insert({
        name: data.name,
        amount: data.amount,
        frequency: data.frequency || null,
        description: data.description || null,
        applicable_classes: data.applicable_classes || [],
        fee_category: data.fee_category || 'Normal',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
}

export function useUpdateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      amount?: number;
      frequency?: string;
      description?: string;
      applicable_classes?: string[];
      fee_category?: string;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('fee_structures')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
}

export function useDeleteFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fee_structures').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
}

// Student Fees Hooks
export function useStudentFees() {
  return useQuery({
    queryKey: ['student-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          student:students(
            id, admission_no, fee_category,
            profile:profiles!students_id_fkey(full_name),
            class:classes(id, name)
          ),
          fee_structure:fee_structures(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StudentFee[];
    },
  });
}

export function useStudentFeesByStudent(studentId: string) {
  return useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`*, fee_structure:fee_structures(*)`)
        .eq('student_id', studentId);
      if (error) throw error;
      return data as StudentFee[];
    },
    enabled: !!studentId,
  });
}

export function useAssignStudentFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      fee_structure_id?: string;
      assigned_amount: number;
      discount_percent?: number;
      discount_amount?: number;
      discount_reason?: string;
      final_amount: number;
    }) => {
      const { error } = await supabase.from('student_fees').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
    },
  });
}

export function useUpdateStudentFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      assigned_amount?: number;
      discount_percent?: number;
      discount_amount?: number;
      discount_reason?: string;
      final_amount?: number;
      status?: string;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('student_fees').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
    },
  });
}

// Fee Invoices Hooks
export function useFeeInvoices() {
  return useQuery({
    queryKey: ['fee-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_invoices')
        .select(`
          *,
          student:students(
            id, admission_no, father_name,
            profile:profiles!students_id_fkey(full_name),
            class:classes(id, name)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FeeInvoice[];
    },
  });
}

export function useFeeInvoicesByStudent(studentId: string) {
  return useQuery({
    queryKey: ['fee-invoices', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_invoices')
        .select('*')
        .eq('student_id', studentId)
        .order('month_year', { ascending: false });
      if (error) throw error;
      return data as FeeInvoice[];
    },
    enabled: !!studentId,
  });
}

export function usePendingInvoices() {
  return useQuery({
    queryKey: ['fee-invoices', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_invoices')
        .select(`
          *,
          student:students(
            id, admission_no, father_name,
            profile:profiles!students_id_fkey(full_name),
            class:classes(id, name)
          )
        `)
        .in('status', ['pending', 'partial', 'overdue'])
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as FeeInvoice[];
    },
  });
}

export function useCreateFeeInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      month_year: string;
      base_amount: number;
      arrears?: number;
      late_fine?: number;
      discount?: number;
      total_due: number;
      due_date: string;
      notes?: string;
    }) => {
      const { error, data: result } = await supabase
        .from('fee_invoices')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
    },
  });
}

export function useUpdateFeeInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      amount_paid?: number;
      status?: string;
      late_fine?: number;
      notes?: string;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('fee_invoices').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
    },
  });
}

// Fee Payments Hooks
export function useFeePayments() {
  return useQuery({
    queryKey: ['fee-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          *,
          invoice:fee_invoices(*),
          student:students(
            id, admission_no,
            profile:profiles!students_id_fkey(full_name)
          ),
          receiver:profiles!fee_payments_received_by_fkey(full_name)
        `)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as FeePayment[];
    },
  });
}

export function useFeePaymentsByStudent(studentId: string) {
  return useQuery({
    queryKey: ['fee-payments', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`*, invoice:fee_invoices(*)`)
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as FeePayment[];
    },
    enabled: !!studentId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      invoice_id: string;
      student_id: string;
      amount: number;
      payment_date: string;
      payment_mode: string;
      reference_number?: string;
      received_by?: string;
      notes?: string;
    }) => {
      // Insert payment
      const { error: paymentError } = await supabase.from('fee_payments').insert(data);
      if (paymentError) throw paymentError;

      // Get invoice and update
      const { data: invoice, error: invoiceError } = await supabase
        .from('fee_invoices')
        .select('total_due, amount_paid')
        .eq('id', data.invoice_id)
        .single();
      if (invoiceError) throw invoiceError;

      const newAmountPaid = (invoice.amount_paid || 0) + data.amount;
      const newStatus = newAmountPaid >= invoice.total_due ? 'paid' : 'partial';

      const { error: updateError } = await supabase
        .from('fee_invoices')
        .update({ amount_paid: newAmountPaid, status: newStatus })
        .eq('id', data.invoice_id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
    },
  });
}

// Fee Settings Hooks
export function useFeeSettings() {
  return useQuery({
    queryKey: ['fee-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fee_settings').select('*');
      if (error) throw error;
      return data as FeeSetting[];
    },
  });
}

export function useUpdateFeeSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { setting_key: string; setting_value: Record<string, any> }) => {
      const { error } = await supabase
        .from('fee_settings')
        .update({ setting_value: data.setting_value, updated_at: new Date().toISOString() })
        .eq('setting_key', data.setting_key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-settings'] });
    },
  });
}

// Dashboard Stats Hook
export function useFeeStats() {
  return useQuery({
    queryKey: ['fee-stats'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get this month's invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('fee_invoices')
        .select('total_due, amount_paid, status, due_date')
        .gte('month_year', currentMonth);
      if (invoicesError) throw invoicesError;

      // Get this month's payments
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data: payments, error: paymentsError } = await supabase
        .from('fee_payments')
        .select('amount')
        .gte('payment_date', startOfMonth.toISOString().split('T')[0]);
      if (paymentsError) throw paymentsError;

      const totalCollectedThisMonth = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const totalDueThisMonth = invoices?.reduce((sum, i) => sum + Number(i.total_due), 0) || 0;
      const pendingDues = invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (Number(i.total_due) - Number(i.amount_paid || 0)), 0) || 0;
      const overdueCount = invoices?.filter(i => i.status === 'overdue' || (i.status === 'pending' && new Date(i.due_date) < new Date())).length || 0;

      return {
        totalCollectedThisMonth,
        totalDueThisMonth,
        pendingDues,
        overdueCount,
        collectionRate: totalDueThisMonth > 0 ? Math.round((totalCollectedThisMonth / totalDueThisMonth) * 100) : 0,
      };
    },
  });
}

// Defaulters List Hook
export function useDefaulters() {
  return useQuery({
    queryKey: ['defaulters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_invoices')
        .select(`
          *,
          student:students(
            id, admission_no, father_name,
            profile:profiles!students_id_fkey(full_name),
            class:classes(id, name)
          )
        `)
        .or('status.eq.overdue,status.eq.pending,status.eq.partial')
        .order('due_date', { ascending: true });
      if (error) throw error;
      
      // Filter to only show those with balance > 0 and past due date
      const now = new Date();
      return (data as FeeInvoice[]).filter(invoice => {
        const balance = invoice.total_due - (invoice.amount_paid || 0);
        return balance > 0 && new Date(invoice.due_date) < now;
      }).sort((a, b) => {
        const balanceA = a.total_due - (a.amount_paid || 0);
        const balanceB = b.total_due - (b.amount_paid || 0);
        return balanceB - balanceA;
      });
    },
  });
}
