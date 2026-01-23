import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import {
  useFeeStructures,
  useFeeSettings,
  useCreateFeeInvoice,
  useFeeInvoicesByStudent,
} from '@/hooks/useFeeManagement';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Search, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format, addDays, differenceInDays } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function GenerateFeesPage() {
  const { t } = useLanguage();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: classes } = useClasses();
  const { data: feeStructures } = useFeeStructures();
  const { data: feeSettings } = useFeeSettings();
  const createInvoice = useCreateFeeInvoice();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get late fine settings
  const lateFineSettings = useMemo(() => {
    const setting = feeSettings?.find(s => s.setting_key === 'late_fine');
    return setting?.setting_value as { per_day: number; max_fine: number; grace_days: number } || 
      { per_day: 50, max_fine: 500, grace_days: 0 };
  }, [feeSettings]);

  const dueDaySetting = useMemo(() => {
    const setting = feeSettings?.find(s => s.setting_key === 'due_day');
    return (setting?.setting_value as { day: number })?.day || 10;
  }, [feeSettings]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students?.filter(s => {
      const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
      const matchesSearch = s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.admission_no?.toLowerCase().includes(search.toLowerCase());
      return matchesClass && matchesSearch;
    }) || [];
  }, [students, selectedClass, search]);

  // Calculate monthly fee for a student
  const calculateStudentFee = (student: any) => {
    // Get monthly fee structures
    const monthlyFees = feeStructures?.filter(f => f.frequency === 'monthly') || [];
    
    // Sum up applicable fees based on class
    let totalFee = 0;
    monthlyFees.forEach(fee => {
      const applicableClasses = fee.applicable_classes || [];
      if (applicableClasses.length === 0 || applicableClasses.includes(student.class_id)) {
        totalFee += Number(fee.amount);
      }
    });

    return totalFee;
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const generateChallan = (student: any, invoiceData: any) => {
    const doc = new jsPDF();
    const monthYear = `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 100, 100);
    doc.text('PakSchool ERP', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Fee Challan / فیس چالان', 105, 32, { align: 'center' });
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(15, 38, 195, 38);
    
    // Student Details Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Details / طالب علم کی تفصیلات', 15, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const detailsY = 58;
    doc.text(`Student ID: ${student.admission_no || 'N/A'}`, 15, detailsY);
    doc.text(`Name: ${student.profile?.full_name || 'N/A'}`, 15, detailsY + 8);
    doc.text(`Father's Name: ${student.father_name || 'N/A'}`, 15, detailsY + 16);
    doc.text(`Class: ${student.class?.name || 'N/A'}`, 15, detailsY + 24);
    doc.text(`Month: ${monthYear}`, 120, detailsY);
    doc.text(`Due Date: ${format(new Date(invoiceData.due_date), 'dd MMM yyyy')}`, 120, detailsY + 8);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 120, detailsY + 16);
    
    // Fee Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Fee Breakdown / فیس کی تفصیل', 15, 100);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 105, 180, 10, 'F');
    doc.text('Description', 20, 112);
    doc.text('Amount (PKR)', 150, 112);
    
    // Table rows
    let yPos = 122;
    doc.text('Monthly Fee', 20, yPos);
    doc.text(`Rs. ${invoiceData.base_amount.toLocaleString()}`, 150, yPos);
    
    if (invoiceData.arrears > 0) {
      yPos += 10;
      doc.text('Previous Arrears', 20, yPos);
      doc.text(`Rs. ${invoiceData.arrears.toLocaleString()}`, 150, yPos);
    }
    
    if (invoiceData.late_fine > 0) {
      yPos += 10;
      doc.text('Late Fine', 20, yPos);
      doc.text(`Rs. ${invoiceData.late_fine.toLocaleString()}`, 150, yPos);
    }
    
    if (invoiceData.discount > 0) {
      yPos += 10;
      doc.setTextColor(0, 128, 0);
      doc.text('Discount', 20, yPos);
      doc.text(`- Rs. ${invoiceData.discount.toLocaleString()}`, 150, yPos);
      doc.setTextColor(0, 0, 0);
    }
    
    // Total
    yPos += 15;
    doc.setLineWidth(0.3);
    doc.line(15, yPos - 5, 195, yPos - 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Total Due / کل رقم', 20, yPos);
    doc.text(`Rs. ${invoiceData.total_due.toLocaleString()}`, 145, yPos);
    
    // Bank Details
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Payment Instructions / ادائیگی کی ہدایات', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 8;
    doc.text('Bank: [School Bank Name]', 15, yPos);
    doc.text('Account: [Account Number]', 15, yPos + 6);
    doc.text('Branch Code: [Branch Code]', 15, yPos + 12);
    doc.text('Or pay at school office during office hours', 15, yPos + 20);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer generated challan. Please pay by due date to avoid late fine.', 105, 280, { align: 'center' });
    doc.text('براہ کرم جرمانے سے بچنے کے لیے مقررہ تاریخ تک ادائیگی کریں', 105, 286, { align: 'center' });
    
    // Save
    doc.save(`challan-${student.admission_no || student.id}-${selectedMonth}-${selectedYear}.pdf`);
  };

  const handleGenerate = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsGenerating(true);
    const monthYear = `${selectedYear}-${selectedMonth}`;
    const dueDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, dueDaySetting);
    let successCount = 0;
    let errorCount = 0;

    for (const studentId of selectedStudents) {
      const student = filteredStudents.find(s => s.id === studentId);
      if (!student) continue;

      const baseFee = calculateStudentFee(student);
      
      const invoiceData = {
        student_id: studentId,
        month_year: monthYear,
        base_amount: baseFee,
        arrears: 0, // TODO: Calculate from previous unpaid invoices
        late_fine: 0,
        discount: 0,
        total_due: baseFee,
        due_date: format(dueDate, 'yyyy-MM-dd'),
      };

      try {
        await createInvoice.mutateAsync(invoiceData);
        generateChallan(student, invoiceData);
        successCount++;
      } catch (error: any) {
        console.error(`Failed to generate invoice for ${student.profile?.full_name}:`, error);
        errorCount++;
      }
    }

    setIsGenerating(false);
    setSelectedStudents([]);
    
    if (successCount > 0) {
      toast.success(`Generated ${successCount} challan(s)! / ${successCount} چالان بن گئے`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to generate ${errorCount} challan(s). They may already exist for this month.`);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 2 + i).toString());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                Generate Fee Challans / فیس چالان بنائیں
              </h1>
              <p className="page-subtitle">Create monthly invoices for students / طلباء کے لیے ماہانہ انوائس</p>
            </div>
          </div>
        </SlideIn>

        {/* Filters */}
        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Period & Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, idx) => (
                        <SelectItem key={idx} value={(idx + 1).toString().padStart(2, '0')}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class Filter</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="ps-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Student Selection */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Select Students ({selectedStudents.length} selected)</CardTitle>
                  <CardDescription>
                    Due date: {dueDaySetting}th of {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={toggleAll}>
                    {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={selectedStudents.length === 0 || isGenerating}
                  >
                    <Calculator className="h-4 w-4 me-2" />
                    {isGenerating ? 'Generating...' : `Generate ${selectedStudents.length} Challan(s)`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students found matching your criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Father's Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const monthlyFee = calculateStudentFee(student);
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={() => toggleStudent(student.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.admission_no || '-'}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {student.profile?.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>{student.father_name || '-'}</TableCell>
                            <TableCell>{student.class?.name || '-'}</TableCell>
                            <TableCell className="font-semibold text-success">
                              Rs. {monthlyFee.toLocaleString()}
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

        {/* Late Fine Info */}
        <SlideIn delay={0.3}>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-semibold">Late Fine Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Late fine: Rs. {lateFineSettings.per_day}/day after due date (Max: Rs. {lateFineSettings.max_fine})
                    {lateFineSettings.grace_days > 0 && ` with ${lateFineSettings.grace_days} grace days`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
