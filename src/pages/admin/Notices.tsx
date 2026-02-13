import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/hooks/useClasses';
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/hooks/useNotices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bell, Plus, Edit, Trash2, Search, Megaphone, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PRIORITIES = ['normal', 'important', 'urgent'];
const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admins' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'student', label: 'Students' },
  { value: 'parent', label: 'Parents' },
];

interface NoticeForm {
  title: string;
  content: string;
  priority: string;
  target_role: string;
  target_class_id: string;
  expires_at: string;
}

const emptyForm: NoticeForm = {
  title: '', content: '', priority: 'normal', target_role: '', target_class_id: '', expires_at: '',
};

export default function NoticesPage() {
  const { user } = useAuth();
  const { data: classes } = useClasses();
  const { data: notices, isLoading } = useNotices();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NoticeForm>(emptyForm);

  const filtered = notices?.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateNotice.mutateAsync({
          id: editingId,
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          target_role: (formData.target_role || null) as any,
          expires_at: formData.expires_at || null,
        });
        toast.success('Notice updated!');
      } else {
        await createNotice.mutateAsync({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          target_role: (formData.target_role || null) as any,
          target_class_id: formData.target_class_id || null,
          expires_at: formData.expires_at || null,
          created_by: user?.id,
        });
        toast.success('Notice published!');
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (notice: any) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority || 'normal',
      target_role: notice.target_role || '',
      target_class_id: notice.target_class_id || '',
      expires_at: notice.expires_at ? notice.expires_at.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotice.mutateAsync(id);
      toast.success('Notice deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateNotice.mutateAsync({ id, is_active: !current });
      toast.success(current ? 'Notice deactivated' : 'Notice activated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (priority === 'important') return <Megaphone className="h-4 w-4 text-warning" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') return <Badge variant="destructive">Urgent</Badge>;
    if (priority === 'important') return <Badge className="bg-warning text-warning-foreground">Important</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                Notices & Announcements / نوٹس
              </h1>
              <p className="page-subtitle">Create and manage school announcements</p>
            </div>
            <Button onClick={() => { setEditingId(null); setFormData(emptyForm); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 me-2" />
              New Notice
            </Button>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notices..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
          </div>
        </SlideIn>

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        ) : filtered.length === 0 ? (
          <SlideIn delay={0.2}>
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No notices found</p>
              </CardContent>
            </Card>
          </SlideIn>
        ) : (
          <div className="space-y-4">
            {filtered.map((notice, idx) => (
              <SlideIn key={notice.id} delay={0.1 + idx * 0.05}>
                <Card className={!notice.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getPriorityIcon(notice.priority || 'normal')}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold">{notice.title}</h3>
                            {getPriorityBadge(notice.priority || 'normal')}
                            {notice.target_role && <Badge variant="outline">{notice.target_role}</Badge>}
                            {!notice.is_active && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>By: {notice.creator?.full_name || 'Unknown'}</span>
                            {notice.created_at && <span>{format(new Date(notice.created_at), 'MMM dd, yyyy')}</span>}
                            {notice.expires_at && <span>Expires: {format(new Date(notice.expires_at), 'MMM dd, yyyy')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={notice.is_active ?? true} onCheckedChange={() => handleToggleActive(notice.id, notice.is_active ?? true)} />
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Notice?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently remove this notice.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(notice.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            ))}
          </div>
        )}

        {/* Notice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Notice' : 'Create Notice'}</DialogTitle>
              <DialogDescription>{editingId ? 'Update notice details' : 'Publish a new notice to the school'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Notice title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea placeholder="Write your announcement here..." rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={formData.target_role} onValueChange={(v) => setFormData({ ...formData, target_role: v })}>
                    <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {ROLES.map((r) => (
                        <SelectItem key={r.value || 'all'} value={r.value || 'all'}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createNotice.isPending || updateNotice.isPending}>
                  {createNotice.isPending || updateNotice.isPending ? 'Saving...' : editingId ? 'Update' : 'Publish'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
