import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useClasses } from '@/hooks/useClasses';
import { useTeachers } from '@/hooks/useTeachers';
import { useCreateClass, useUpdateClass, useDeleteClass } from '@/hooks/useClassManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, School } from 'lucide-react';
import { toast } from 'sonner';

interface ClassFormData {
  name: string;
  section: string;
  grade_level: string;
  academic_year: string;
  teacher_id: string;
}

const emptyFormData: ClassFormData = {
  name: '',
  section: '',
  grade_level: '',
  academic_year: '',
  teacher_id: '',
};

const currentYear = new Date().getFullYear();
const academicYears = [
  `${currentYear}-${currentYear + 1}`,
  `${currentYear - 1}-${currentYear}`,
  `${currentYear + 1}-${currentYear + 2}`,
];

export default function ClassesPage() {
  const { t } = useLanguage();
  const { data: classes, isLoading } = useClasses();
  const { data: teachers } = useTeachers();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClassFormData>(emptyFormData);

  const filteredClasses = classes?.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.section?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateClass.mutateAsync({
          id: editingId,
          name: formData.name,
          section: formData.section || null,
          grade_level: formData.grade_level ? parseInt(formData.grade_level, 10) : null,
          academic_year: formData.academic_year || null,
          teacher_id: formData.teacher_id || null,
        });
        toast.success('Class updated successfully!');
      } else {
        await createClass.mutateAsync({
          name: formData.name,
          section: formData.section || null,
          grade_level: formData.grade_level ? parseInt(formData.grade_level, 10) : null,
          academic_year: formData.academic_year || null,
          teacher_id: formData.teacher_id || null,
        });
        toast.success('Class created successfully!');
      }
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (classItem: any) => {
    setEditingId(classItem.id);
    setFormData({
      name: classItem.name || '',
      section: classItem.section || '',
      grade_level: classItem.grade_level?.toString() || '',
      academic_year: classItem.academic_year || '',
      teacher_id: classItem.teacher_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClass.mutateAsync(id);
      toast.success('Class deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const openNewDialog = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <School className="h-8 w-8 text-primary" />
                {t('nav.classes')}
              </h1>
              <p className="page-subtitle">Manage class records / جماعتوں کا انتظام</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 me-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Update class information' : 'Enter class details to create a new record'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Class 1, Nursery, KG"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        placeholder="e.g., A, B, C"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade_level">Grade Level</Label>
                      <Input
                        id="grade_level"
                        type="number"
                        min="0"
                        max="12"
                        placeholder="e.g., 1, 2, 3"
                        value={formData.grade_level}
                        onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Select
                      value={formData.academic_year}
                      onValueChange={(v) => setFormData({ ...formData, academic_year: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Academic Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher_id">Class Teacher</Label>
                    <Select
                      value={formData.teacher_id}
                      onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a Teacher" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {teachers?.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.profile?.full_name || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createClass.isPending || updateClass.isPending}>
                      {createClass.isPending || updateClass.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Classes ({filteredClasses.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ps-9"
                  />
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
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Grade Level</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Class Teacher</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell className="font-medium">{classItem.name}</TableCell>
                          <TableCell>
                            {classItem.section ? (
                              <Badge variant="outline">{classItem.section}</Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{classItem.grade_level ?? '-'}</TableCell>
                          <TableCell>{classItem.academic_year || '-'}</TableCell>
                          <TableCell>
                            {classItem.teacher?.full_name || (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(classItem)}>
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
                                    <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. Students assigned to this class will need to be reassigned.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(classItem.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
