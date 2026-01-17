import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useFees, useUpdateFee } from '@/hooks/useFees';
import { useStudents } from '@/hooks/useStudents';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, DollarSign, FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export default function FeesPage() {
  const { t } = useLanguage();
  const { data: fees, isLoading } = useFees();
  const { data: students } = useStudents();
  const updateFee = useUpdateFee();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount_paid: '',
    status: '',
    payment_method: '',
    paid_date: '',
  });

  const filteredFees = fees?.filter(f => {
    const studentName = f.student?.profile?.full_name?.toLowerCase() || '';
    const matchesSearch = studentName.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'paid' && f.status === 'paid') ||
      (filter === 'pending' && f.status === 'pending') ||
      (filter === 'overdue' && f.status === 'overdue');
    return matchesSearch && matchesFilter;
  }) || [];

  const handleEdit = (fee: any) => {
    setEditingFee(fee);
    setFormData({
      amount_paid: fee.amount_paid?.toString() || '',
      status: fee.status || 'pending',
      payment_method: fee.payment_method || '',
      paid_date: fee.paid_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;

    try {
      await updateFee.mutateAsync({
        id: editingFee.id,
        amount_paid: parseFloat(formData.amount_paid) || 0,
        status: formData.status,
        payment_method: formData.payment_method,
        paid_date: formData.paid_date || null,
      });
      toast.success('Fee updated successfully! / فیس اپڈیٹ ہو گئی');
      setIsDialogOpen(false);
      setEditingFee(null);
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const generateFeeSlip = (fee: any) => {
    const doc = new jsPDF();
    const studentName = fee.students?.profiles?.full_name || 'Unknown';
    const className = fee.students?.classes?.name || 'N/A';
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 128);
    doc.text('PakSchool ERP', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Fee Receipt / فیس رسید', 105, 30, { align: 'center' });
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Details
    doc.setFontSize(12);
    doc.text(`Receipt Date: ${format(new Date(), 'dd MMM yyyy')}`, 20, 50);
    doc.text(`Student Name: ${studentName}`, 20, 60);
    doc.text(`Class: ${className}`, 20, 70);
    doc.text(`Due Date: ${fee.due_date ? format(new Date(fee.due_date), 'dd MMM yyyy') : 'N/A'}`, 20, 80);
    
    // Fee Details
    doc.setFontSize(14);
    doc.text('Fee Details', 20, 100);
    doc.line(20, 105, 190, 105);
    
    doc.setFontSize(12);
    doc.text(`Amount Due: Rs. ${fee.amount_due?.toLocaleString() || 0}`, 20, 115);
    doc.text(`Amount Paid: Rs. ${fee.amount_paid?.toLocaleString() || 0}`, 20, 125);
    doc.text(`Balance: Rs. ${((fee.amount_due || 0) - (fee.amount_paid || 0)).toLocaleString()}`, 20, 135);
    doc.text(`Status: ${fee.status?.toUpperCase() || 'PENDING'}`, 20, 145);
    
    if (fee.payment_method) {
      doc.text(`Payment Method: ${fee.payment_method}`, 20, 155);
    }
    
    // Footer
    doc.line(20, 170, 190, 170);
    doc.setFontSize(10);
    doc.text('This is a computer generated receipt.', 105, 180, { align: 'center' });
    doc.text('Thank you for your payment!', 105, 190, { align: 'center' });
    
    // Save
    doc.save(`fee-slip-${studentName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Fee slip downloaded! / فیس سلپ ڈاؤن لوڈ ہو گئی');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 me-1" />Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 me-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline" className="bg-warning/10 text-warning"><Clock className="h-3 w-3 me-1" />Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-success" />
                {t('nav.fees')}
              </h1>
              <p className="page-subtitle">Manage fee collection / فیس کا انتظام</p>
            </div>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Fee Records ({filteredFees.length})</CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex gap-1">
                    {['all', 'paid', 'pending', 'overdue'].map((f) => (
                      <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f as any)}
                        className="capitalize"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student..."
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
              ) : filteredFees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fee records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Amount Due</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">
                            {fee.student?.profile?.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{fee.student?.class?.name || '-'}</TableCell>
                          <TableCell>Rs. {fee.amount_due?.toLocaleString()}</TableCell>
                          <TableCell>Rs. {fee.amount_paid?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            {fee.due_date ? format(new Date(fee.due_date), 'dd MMM yyyy') : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(fee.status || 'pending')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(fee)}>
                                Update
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => generateFeeSlip(fee)}>
                                <Download className="h-4 w-4" />
                              </Button>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Fee Payment</DialogTitle>
              <DialogDescription>Record payment for this fee</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount_paid">Amount Paid (Rs.)</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid_date">Payment Date</Label>
                  <Input
                    id="paid_date"
                    type="date"
                    value={formData.paid_date}
                    onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateFee.isPending}>
                  {updateFee.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
