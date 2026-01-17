import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, UserCheck, UserX, Shield, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  is_approved: boolean;
  created_at: string;
  role: string;
}

export default function UsersPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

      return profiles.map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email || '',
        is_approved: p.is_approved || false,
        created_at: p.created_at || '',
        role: roleMap.get(p.id) || 'unknown',
      })) as UserWithRole[];
    },
  });

  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User approved successfully! / صارف کی منظوری ہو گئی');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Approval failed');
    },
  });

  const rejectUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: false })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User approval revoked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Operation failed');
    },
  });

  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && !u.is_approved) ||
      (filter === 'approved' && u.is_approved);
    return matchesSearch && matchesFilter;
  }) || [];

  const pendingCount = users?.filter(u => !u.is_approved).length || 0;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary/10 text-primary border-primary';
      case 'teacher': return 'bg-secondary/10 text-secondary border-secondary';
      case 'student': return 'bg-info/10 text-info border-info';
      case 'parent': return 'bg-warning/10 text-warning border-warning';
      default: return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                {t('nav.users')}
              </h1>
              <p className="page-subtitle">Manage user accounts and approvals / صارفین کا انتظام</p>
            </div>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {pendingCount} Pending Approval
              </Badge>
            )}
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex gap-1">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('pending')}
                    >
                      <Clock className="h-4 w-4 me-1" />
                      Pending
                    </Button>
                    <Button
                      variant={filter === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('approved')}
                    >
                      <CheckCircle className="h-4 w-4 me-1" />
                      Approved
                    </Button>
                  </div>
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="ps-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.is_approved ? (
                              <Badge className="bg-success/10 text-success border-success">
                                <CheckCircle className="h-3 w-3 me-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                                <Clock className="h-3 w-3 me-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!user.is_approved ? (
                                <Button
                                  size="sm"
                                  onClick={() => approveUser.mutate(user.id)}
                                  disabled={approveUser.isPending}
                                >
                                  <UserCheck className="h-4 w-4 me-1" />
                                  Approve
                                </Button>
                              ) : user.role !== 'admin' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectUser.mutate(user.id)}
                                  disabled={rejectUser.isPending}
                                >
                                  <UserX className="h-4 w-4 me-1" />
                                  Revoke
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">Admin</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
