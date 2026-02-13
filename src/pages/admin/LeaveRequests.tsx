import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useTeachers } from '@/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Clock, Plus, Search, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const LEAVE_TYPES = ['sick', 'casual', 'earned', 'maternity', 'unpaid', 'other'];

function useLeaveRequests() {
  return useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          user:profiles!leave_requests_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status: string; approved_by?: string }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('leave_requests').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });
}

export default function LeaveRequestsPage() {
  const { data: leaves, isLoading } = useLeaveRequests();
  const updateStatus = useUpdateLeaveStatus();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = leaves?.filter((l: any) => {
    const nameMatch = l.user?.full_name?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = filterStatus === 'all' || l.status === filterStatus;
    return nameMatch && statusMatch;
  }) || [];

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'approved' });
      toast.success('Leave approved!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'rejected' });
      toast.success('Leave rejected');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-success/10 text-success">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline" className="text-warning">Pending</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Clock className="h-8 w-8 text-primary" />
                Leave Requests / چھٹی کی درخواستیں
              </h1>
              <p className="page-subtitle">Manage staff leave applications</p>
            </div>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>All Requests ({filtered.length})</CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No leave requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((l: any) => {
                        const days = Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{l.user?.full_name || 'Unknown'}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{l.leave_type || '-'}</Badge></TableCell>
                            <TableCell className="text-sm">{format(new Date(l.start_date), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-sm">{format(new Date(l.end_date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{days}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{l.reason || '-'}</TableCell>
                            <TableCell>{getStatusBadge(l.status || 'pending')}</TableCell>
                            <TableCell>
                              {l.status === 'pending' && (
                                <div className="flex items-center gap-1">
                                  <Button variant="outline" size="sm" className="text-success" onClick={() => handleApprove(l.id)}>
                                    <CheckCircle2 className="h-3 w-3 me-1" />
                                    Approve
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleReject(l.id)}>
                                    <X className="h-3 w-3 me-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
