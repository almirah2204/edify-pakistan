import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import {
  useFeeInvoices,
  useFeePayments,
  useDefaulters,
  useFeeStats,
} from '@/hooks/useFeeManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  BarChart3,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertCircle,
  FileText,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function FeeReportsPage() {
  const { t } = useLanguage();
  const { data: invoices, isLoading: invoicesLoading } = useFeeInvoices();
  const { data: payments, isLoading: paymentsLoading } = useFeePayments();
  const { data: defaulters, isLoading: defaultersLoading } = useDefaulters();
  const { data: stats } = useFeeStats();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  // Monthly collection data
  const monthlyData = useMemo(() => {
    const year = parseInt(selectedYear);
    const data: { month: string; collected: number; due: number }[] = [];
    
    MONTHS.forEach((month, idx) => {
      const monthYear = `${year}-${(idx + 1).toString().padStart(2, '0')}`;
      const monthInvoices = invoices?.filter(i => i.month_year === monthYear) || [];
      const monthPayments = payments?.filter(p => {
        const paymentMonth = new Date(p.payment_date).getMonth();
        const paymentYear = new Date(p.payment_date).getFullYear();
        return paymentMonth === idx && paymentYear === year;
      }) || [];

      data.push({
        month: month.slice(0, 3),
        collected: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        due: monthInvoices.reduce((sum, i) => sum + Number(i.total_due), 0),
      });
    });

    return data;
  }, [invoices, payments, selectedYear]);

  // Unique students for ledger
  const uniqueStudents = useMemo(() => {
    const students = new Map();
    invoices?.forEach(inv => {
      if (inv.student) {
        students.set(inv.student.id, {
          id: inv.student.id,
          name: inv.student.profile?.full_name,
          admission_no: inv.student.admission_no,
        });
      }
    });
    return Array.from(students.values());
  }, [invoices]);

  // Student ledger data
  const studentLedger = useMemo(() => {
    if (!selectedStudent) return { invoices: [], payments: [], balance: 0 };
    
    const studentInvoices = invoices?.filter(i => i.student_id === selectedStudent) || [];
    const studentPayments = payments?.filter(p => p.student_id === selectedStudent) || [];
    
    const totalDue = studentInvoices.reduce((sum, i) => sum + Number(i.total_due), 0);
    const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    return {
      invoices: studentInvoices,
      payments: studentPayments,
      balance: totalDue - totalPaid,
    };
  }, [selectedStudent, invoices, payments]);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const exportDefaultersPDF = () => {
    if (!defaulters?.length) {
      toast.error('No defaulters to export');
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Fee Defaulters Report', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 105, 28, { align: 'center' });
    
    // Table
    let y = 45;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Student ID', 15, y);
    doc.text('Name', 45, y);
    doc.text('Class', 100, y);
    doc.text('Month', 130, y);
    doc.text('Balance', 160, y);
    
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    defaulters.slice(0, 30).forEach(d => {
      const balance = d.total_due - (d.amount_paid || 0);
      doc.text(d.student?.admission_no || '-', 15, y);
      doc.text((d.student?.profile?.full_name || '-').slice(0, 25), 45, y);
      doc.text((d.student?.class?.name || '-').slice(0, 15), 100, y);
      doc.text(d.month_year, 130, y);
      doc.text(`Rs. ${balance.toLocaleString()}`, 160, y);
      y += 8;
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    doc.save(`defaulters-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF exported successfully!');
  };

  const years = Array.from({ length: 5 }, (_, i) => (currentDate.getFullYear() - 2 + i).toString());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                Fee Reports / فیس رپورٹس
              </h1>
              <p className="page-subtitle">View collection reports and defaulters / وصولی کی رپورٹس اور بقایاجات</p>
            </div>
          </div>
        </SlideIn>

        {/* Stats Cards */}
        <SlideIn delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month Collection</p>
                    <p className="text-2xl font-bold text-success">
                      Rs. {(stats?.totalCollectedThisMonth || 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month Due</p>
                    <p className="text-2xl font-bold">
                      Rs. {(stats?.totalDueThisMonth || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Dues</p>
                    <p className="text-2xl font-bold text-warning">
                      Rs. {(stats?.pendingDues || 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue Students</p>
                    <p className="text-2xl font-bold text-destructive">{stats?.overdueCount || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </SlideIn>

        {/* Tabs */}
        <SlideIn delay={0.1}>
          <Tabs defaultValue="collection">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collection">Collection Report</TabsTrigger>
              <TabsTrigger value="defaulters">Defaulters List</TabsTrigger>
              <TabsTrigger value="ledger">Student Ledger</TabsTrigger>
            </TabsList>

            {/* Collection Report */}
            <TabsContent value="collection">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Monthly Collection Report</CardTitle>
                      <CardDescription>Fee collected vs due by month</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV(monthlyData, 'collection-report')}
                      >
                        <Download className="h-4 w-4 me-1" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Total Due</TableHead>
                          <TableHead>Total Collected</TableHead>
                          <TableHead>Collection Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyData.map((data) => {
                          const rate = data.due > 0 ? Math.round((data.collected / data.due) * 100) : 0;
                          return (
                            <TableRow key={data.month}>
                              <TableCell className="font-medium">{data.month}</TableCell>
                              <TableCell>Rs. {data.due.toLocaleString()}</TableCell>
                              <TableCell className="text-success font-semibold">
                                Rs. {data.collected.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={rate >= 80 ? 'default' : rate >= 50 ? 'secondary' : 'destructive'}>
                                  {rate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Defaulters List */}
            <TabsContent value="defaulters">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Fee Defaulters ({defaulters?.length || 0})
                      </CardTitle>
                      <CardDescription>Students with overdue fees, sorted by amount</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportDefaultersPDF}>
                      <Printer className="h-4 w-4 me-1" />
                      Print PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {defaultersLoading ? (
                    <Skeleton className="h-48" />
                  ) : defaulters && defaulters.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Father's Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {defaulters.map((d) => {
                            const balance = d.total_due - (d.amount_paid || 0);
                            return (
                              <TableRow key={d.id}>
                                <TableCell>
                                  <Badge variant="outline">{d.student?.admission_no || '-'}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {d.student?.profile?.full_name || 'N/A'}
                                </TableCell>
                                <TableCell>{d.student?.father_name || '-'}</TableCell>
                                <TableCell>{d.student?.class?.name || '-'}</TableCell>
                                <TableCell>{d.month_year}</TableCell>
                                <TableCell className="text-destructive">
                                  {format(new Date(d.due_date), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell className="font-bold text-destructive">
                                  Rs. {balance.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No defaulters found! All fees are cleared.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Ledger */}
            <TabsContent value="ledger">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Student Fee Ledger
                      </CardTitle>
                      <CardDescription>Complete fee history for a student</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Select a student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueStudents.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.admission_no} - {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedStudent ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a student to view their fee ledger</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Balance Summary */}
                      <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                        <span className="font-medium">Outstanding Balance:</span>
                        <span className={`text-xl font-bold ${studentLedger.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                          Rs. {studentLedger.balance.toLocaleString()}
                        </span>
                      </div>

                      {/* Invoices */}
                      <div>
                        <h4 className="font-semibold mb-3">Invoices</h4>
                        {studentLedger.invoices.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Total Due</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentLedger.invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                  <TableCell>{inv.month_year}</TableCell>
                                  <TableCell>{format(new Date(inv.due_date), 'dd MMM yyyy')}</TableCell>
                                  <TableCell>Rs. {inv.total_due.toLocaleString()}</TableCell>
                                  <TableCell className="text-success">
                                    Rs. {(inv.amount_paid || 0).toLocaleString()}
                                  </TableCell>
                                  <TableCell>Rs. {(inv.total_due - (inv.amount_paid || 0)).toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                                      {inv.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground">No invoices found</p>
                        )}
                      </div>

                      {/* Payments */}
                      <div>
                        <h4 className="font-semibold mb-3">Payment History</h4>
                        {studentLedger.payments.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Reference</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentLedger.payments.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell>{format(new Date(p.payment_date), 'dd MMM yyyy')}</TableCell>
                                  <TableCell className="text-success font-semibold">
                                    Rs. {p.amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell><Badge variant="outline">{p.payment_mode}</Badge></TableCell>
                                  <TableCell>{p.reference_number || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground">No payments found</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
