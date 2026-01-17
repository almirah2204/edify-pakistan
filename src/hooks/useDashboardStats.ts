import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'stats', profile?.role],
    queryFn: async () => {
      // Get counts based on RLS - queries will automatically filter based on user role
      const [studentsRes, teachersRes, classesRes, feesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('fees').select('amount_due, amount_paid, status'),
      ]);

      const totalStudents = studentsRes.count || 0;
      const totalTeachers = teachersRes.count || 0;
      const totalClasses = classesRes.count || 0;

      // Calculate fee stats
      const fees = feesRes.data || [];
      const totalFeeCollected = fees.reduce((sum, fee) => sum + Number(fee.amount_paid || 0), 0);
      const totalFeeDue = fees.reduce((sum, fee) => sum + Number(fee.amount_due), 0);
      const pendingFees = fees.filter(f => f.status === 'pending').length;

      return {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalFeeCollected,
        totalFeeDue,
        pendingFees,
      };
    },
    enabled: !!profile,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
}

export function useWeeklyAttendance() {
  return useQuery({
    queryKey: ['attendance', 'weekly'],
    queryFn: async () => {
      // Get last 7 days of attendance
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('attendance')
        .select('date, status')
        .gte('date', weekAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0]);

      if (error) throw error;

      // Group by date
      const grouped: Record<string, { present: number; absent: number; late: number }> = {};
      
      data.forEach(record => {
        if (!grouped[record.date]) {
          grouped[record.date] = { present: 0, absent: 0, late: 0 };
        }
        if (record.status === 'present') grouped[record.date].present++;
        else if (record.status === 'absent') grouped[record.date].absent++;
        else if (record.status === 'late') grouped[record.date].late++;
      });

      // Convert to chart format
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return Object.entries(grouped).map(([date, stats]) => ({
        name: dayNames[new Date(date).getDay()],
        present: stats.present,
        absent: stats.absent,
        date,
      }));
    },
  });
}
