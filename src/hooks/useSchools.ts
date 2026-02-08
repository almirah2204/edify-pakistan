import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface School {
  id: string;
  name: string;
  code: string;
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  principal_name?: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_start?: string;
  subscription_end?: string;
  max_students: number;
  max_staff: number;
  academic_year: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolInput {
  name: string;
  code: string;
  domain?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  principal_name?: string;
  subscription_plan?: string;
  max_students?: number;
  max_staff?: number;
}

export interface UpdateSchoolInput extends Partial<CreateSchoolInput> {
  id: string;
  is_active?: boolean;
  subscription_status?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
}

// Fetch all schools (super_admin only)
export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as School[];
    },
  });
}

// Fetch single school by ID
export function useSchool(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data as School;
    },
    enabled: !!schoolId,
  });
}

// Create new school
export function useCreateSchool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSchoolInput) => {
      const { data, error } = await supabase
        .from('schools')
        .insert([{
          name: input.name,
          code: input.code.toUpperCase(),
          domain: input.domain,
          address: input.address,
          city: input.city,
          phone: input.phone,
          email: input.email,
          website: input.website,
          principal_name: input.principal_name,
          subscription_plan: input.subscription_plan || 'trial',
          max_students: input.max_students || 50,
          max_staff: input.max_staff || 10,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as School;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}

// Update school
export function useUpdateSchool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateSchoolInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as School;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', data.id] });
    },
  });
}

// Delete school
export function useDeleteSchool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schoolId: string) => {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
      
      if (error) throw error;
      return schoolId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}

// Get school statistics
export function useSchoolStats(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-stats', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      
      // Count students in this school
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);
      
      // Count staff (teachers + admins)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'teacher']);
      
      // Filter by school_id through profiles
      const { data: schoolProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', schoolId);
      
      const schoolProfileIds = new Set(schoolProfiles?.map(p => p.id) || []);
      const staffCount = roleData?.filter(r => schoolProfileIds.has(r.user_id)).length || 0;
      
      return {
        studentCount: studentCount || 0,
        staffCount,
      };
    },
    enabled: !!schoolId,
  });
}

// Generate unique school code
export async function generateSchoolCode(): Promise<string> {
  const prefix = 'SCH';
  const year = new Date().getFullYear().toString().slice(-2);
  
  const { data, count } = await supabase
    .from('schools')
    .select('code', { count: 'exact' })
    .like('code', `${prefix}${year}%`)
    .order('code', { ascending: false })
    .limit(1);
  
  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].code;
    const lastNumber = parseInt(lastCode.slice(-3), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return `${prefix}${year}${String(nextNumber).padStart(3, '0')}`;
}
