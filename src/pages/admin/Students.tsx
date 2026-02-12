import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { supabase } from '@/integrations/supabase/client';
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
import { Plus, Search, Edit, Trash2, GraduationCap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface StudentFormData {
  full_name: string;
  email: string;
  class_id: string;
  admission_no: string;
  gender: string;
  date_of_birth: string;
  address: string;
  blood_group: string;
  father_name: string;
}

const emptyFormData: StudentFormData = {
  full_name: '',
  email: '',
  class_id: '',
  admission_no: '',
  gender: '',
  date_of_birth: '',
  address: '',
  blood_group: '',
  father_name: '',
};

// Generate unique student ID in format: YY-XXXX
async function generateStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = String(currentYear).slice(-2); // e.g., "26" for 2026
  
  // Query for highest admission_no in current year
  const { data, error } = await supabase
    .from('students')
    .select('admission_no')
    .like('admission_no', `${yearPrefix}-%`)
    .order('admission_no', { ascending: false })
    .limit(1);
  
  let nextNumber = 1;
  
  if (!error && data && data.length > 0 && data[0].admission_no) {
    // Extract the number part after the dash
    const parts = data[0].admission_no.split('-');
    if (parts.length === 2) {
      const lastNumber = parseInt(parts[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
  }
  
  // Pad with zeros to 4 digits
  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${yearPrefix}-${paddedNumber}`;
}

// Check for duplicate student based on Full Name + Father's Name + DOB
async function checkDuplicateStudent(
  fullName: string,
  fatherName: string,
  dateOfBirth: string
): Promise<boolean> {
  if (!fullName || !fatherName || !dateOfBirth) {
    return false; // Skip check if any field is empty
  }
  
  const { data, error } = await supabase
    .from('students')
    .select(`
      id,
      father_name,
      date_of_birth,
      profile:profiles!students_id_fkey(full_name)
    `)
    .eq('date_of_birth', dateOfBirth)
    .ilike('father_name', fatherName.trim());
  
  if (error || !data) {
    return false;
  }
  
  // Check for matching full_name (case-insensitive)
  return data.some((student) => 
    student.profile?.full_name?.toLowerCase().trim() === fullName.toLowerCase().trim()
  );
}

export default function StudentsPage() {
  const { t } = useLanguage();
  const { data: students, isLoading } = useStudents();
  const { data: classes } = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  // Fetch fee status for all students
  const { data: feeStatusMap } = useQuery({
    queryKey: ['student-fee-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_invoices')
        .select('student_id, total_due, amount_paid, balance, status');
      
      if (error) throw error;
      
      // Aggregate by student
      const statusMap: Record<string, { totalDue: number; totalPaid: number; balance: number }> = {};
      data?.forEach((invoice) => {
        if (!statusMap[invoice.student_id]) {
          statusMap[invoice.student_id] = { totalDue: 0, totalPaid: 0, balance: 0 };
        }
        statusMap[invoice.student_id].totalDue += Number(invoice.total_due) || 0;
        statusMap[invoice.student_id].totalPaid += Number(invoice.amount_paid) || 0;
        statusMap[invoice.student_id].balance += Number(invoice.balance) || 0;
      });
      return statusMap;
    },
  });

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyFormData);

  const filteredStudents = students?.filter(s => 
    s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_no?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `Rs. ${(amount / 1000).toFixed(1)}K`;
    }
    return `Rs. ${amount}`;
  };

  const getFeeStatusBadge = (studentId: string) => {
    const status = feeStatusMap?.[studentId];
    if (!status || status.totalDue === 0) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          No Fees
        </Badge>
      );
    }
    
    if (status.balance <= 0) {
      return (
        <Link to={`/admin/fee-reports?student=${studentId}`}>
          <Badge className="bg-success/20 text-success hover:bg-success/30 cursor-pointer">
            <DollarSign className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        </Link>
      );
    }
    
    return (
      <Link to={`/admin/fee-reports?student=${studentId}`}>
        <Badge variant="destructive" className="cursor-pointer hover:bg-destructive/90">
          <DollarSign className="h-3 w-3 mr-1" />
          Due {formatCurrency(status.balance)}
        </Badge>
      </Link>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await updateStudent.mutateAsync({
          id: editingId,
          class_id: formData.class_id || null,
          admission_no: formData.admission_no,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth || null,
          address: formData.address,
          blood_group: formData.blood_group,
          father_name: formData.father_name,
        });
        toast.success('Student updated successfully! / طالب علم کی معلومات اپڈیٹ ہو گئیں');
      } else {
        // Check for possible duplicate before creating
        const isDuplicate = await checkDuplicateStudent(
          formData.full_name,
          formData.father_name,
          formData.date_of_birth
        );
        
        if (isDuplicate) {
          toast.warning('Possible duplicate student detected! Please verify before proceeding.');
          setIsSubmitting(false);
          return;
        }
        
        // Generate unique student ID
        const generatedId = await generateStudentId();
        
        await createStudent.mutateAsync({
          full_name: formData.full_name,
          email: formData.email,
          class_id: formData.class_id || null,
          admission_no: generatedId,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth || null,
          address: formData.address,
          blood_group: formData.blood_group,
          father_name: formData.father_name,
        });
        toast.success(`Student added! Unique ID: ${generatedId}`);
      }
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student: any) => {
    setEditingId(student.id);
    setFormData({
      full_name: student.profile?.full_name || '',
      email: student.profile?.email || '',
      class_id: student.class_id || '',
      admission_no: student.admission_no || '',
      gender: student.gender || '',
      date_of_birth: student.date_of_birth || '',
      address: student.address || '',
      blood_group: student.blood_group || '',
      father_name: student.father_name || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent.mutateAsync(id);
      toast.success('Student deleted successfully! / طالب علم کا ریکارڈ حذف ہو گیا');
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
                <GraduationCap className="h-8 w-8 text-primary" />
                {t('nav.students')}
              </h1>
              <p className="page-subtitle">Manage student records / طلباء کا انتظام</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 me-2" />
                  Add Student
                </Button>
              </DialogTrigger>
               <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Update student information' : 'Enter student details to create a new record'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="e.g., Ahmed Ali"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required={!editingId}
                        disabled={!!editingId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g., student@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required={!editingId}
                        disabled={!!editingId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="father_name">Father's Name *</Label>
                      <Input
                        id="father_name"
                        placeholder="e.g., Muhammad Ali"
                        value={formData.father_name}
                        onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                        required={!editingId}
                      />
                    </div>
                    {editingId && (
                      <div className="space-y-2">
                        <Label htmlFor="admission_no">Student ID</Label>
                        <Input
                          id="admission_no"
                          value={formData.admission_no}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="class_id">Class</Label>
                      <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {cls.section && `- ${cls.section}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_group">Blood Group</Label>
                      <Select value={formData.blood_group} onValueChange={(v) => setFormData({ ...formData, blood_group: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="e.g., House 123, Street 5, Lahore"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || createStudent.isPending || updateStudent.isPending}>
                      {isSubmitting || createStudent.isPending || updateStudent.isPending ? 'Saving...' : 'Save'}
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
                <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
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
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Admission No</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Fee Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.profile?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{student.admission_no || '-'}</TableCell>
                          <TableCell>
                            {student.class?.name ? (
                              <Badge variant="outline">
                                {student.class.name} {student.class.section && `- ${student.class.section}`}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="capitalize">{student.gender || '-'}</TableCell>
                          <TableCell>{getFeeStatusBadge(student.id)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
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
                                    <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the student record.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(student.id)}
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
