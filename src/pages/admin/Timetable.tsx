import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useClasses } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';
import { useTimetableByClass, useCreateTimetableEntry, useUpdateTimetableEntry, useDeleteTimetableEntry, DAYS } from '@/hooks/useTimetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface EntryForm {
  subject: string;
  day_of_week: string;
  period_number: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
}

const emptyForm: EntryForm = {
  subject: '', day_of_week: '', period_number: '', teacher_id: '', start_time: '', end_time: '',
};

export default function TimetablePage() {
  const { data: classes } = useClasses();
  const { data: teachers } = useTeachers();
  const [selectedClass, setSelectedClass] = useState('');
  const { data: entries, isLoading } = useTimetableByClass(selectedClass);
  const createEntry = useCreateTimetableEntry();
  const updateEntry = useUpdateTimetableEntry();
  const deleteEntry = useDeleteTimetableEntry();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EntryForm>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEntry.mutateAsync({
          id: editingId,
          subject: formData.subject,
          teacher_id: formData.teacher_id || null,
          start_time: formData.start_time || undefined,
          end_time: formData.end_time || undefined,
        });
        toast.success('Period updated!');
      } else {
        await createEntry.mutateAsync({
          class_id: selectedClass,
          subject: formData.subject,
          day_of_week: parseInt(formData.day_of_week),
          period_number: parseInt(formData.period_number),
          teacher_id: formData.teacher_id || null,
          start_time: formData.start_time || undefined,
          end_time: formData.end_time || undefined,
        });
        toast.success('Period added!');
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setFormData({
      subject: entry.subject,
      day_of_week: entry.day_of_week?.toString() || '',
      period_number: entry.period_number?.toString() || '',
      teacher_id: entry.teacher_id || '',
      start_time: entry.start_time || '',
      end_time: entry.end_time || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry.mutateAsync(id);
      toast.success('Period deleted!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  // Build grid data
  const getEntry = (day: number, period: number) =>
    entries?.find(e => e.day_of_week === day && e.period_number === period);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Calendar className="h-8 w-8 text-primary" />
                Timetable / ٹائم ٹیبل
              </h1>
              <p className="page-subtitle">Manage class schedules and periods</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.section ? `- ${c.section}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClass && (
                <Button onClick={openNew}>
                  <Plus className="h-4 w-4 me-2" />
                  Add Period
                </Button>
              )}
            </div>
          </div>
        </SlideIn>

        {!selectedClass ? (
          <SlideIn delay={0.1}>
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a class to view its timetable</p>
              </CardContent>
            </Card>
          </SlideIn>
        ) : isLoading ? (
          <Skeleton className="h-96" />
        ) : (
          <SlideIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-border p-2 bg-muted text-sm font-semibold text-muted-foreground">Period</th>
                        {DAYS.map((day) => (
                          <th key={day} className="border border-border p-2 bg-muted text-sm font-semibold text-muted-foreground">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERIODS.map((period) => (
                        <tr key={period}>
                          <td className="border border-border p-2 text-center font-medium text-sm bg-muted/50">{period}</td>
                          {DAYS.map((_, dayIdx) => {
                            const entry = getEntry(dayIdx + 1, period);
                            return (
                              <td key={dayIdx} className="border border-border p-1 min-w-[120px]">
                                {entry ? (
                                  <div className="group relative p-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                                    <p className="font-medium text-sm">{entry.subject}</p>
                                    {entry.start_time && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                                      </p>
                                    )}
                                    <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(entry)}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this period?</AlertDialogTitle>
                                            <AlertDialogDescription>This will remove this period from the timetable.</AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 text-center text-xs text-muted-foreground/50">—</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Period' : 'Add Period'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update period details' : 'Add a new period to the timetable'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input placeholder="e.g., Mathematics, English" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
              </div>
              {!editingId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Day *</Label>
                    <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })} required>
                      <SelectTrigger><SelectValue placeholder="Select Day" /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {DAYS.map((day, idx) => (
                          <SelectItem key={idx} value={(idx + 1).toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Period # *</Label>
                    <Select value={formData.period_number} onValueChange={(v) => setFormData({ ...formData, period_number: v })} required>
                      <SelectTrigger><SelectValue placeholder="Period" /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {PERIODS.map((p) => (
                          <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={formData.teacher_id} onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Assign Teacher" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {teachers?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.profile?.full_name || 'Unknown'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createEntry.isPending || updateEntry.isPending}>
                  {createEntry.isPending || updateEntry.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
