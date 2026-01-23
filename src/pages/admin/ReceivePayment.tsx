import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import {
  usePendingInvoices,
  useRecordPayment,
  useFeePayments,
} from '@/hooks/useFeeManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { CreditCard, Search, CheckCircle, Clock, AlertCircle, Receipt, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PAYMENT_MODES = [
  { value: 'Cash', label: 'Cash / نقد' },
  { value: 'Bank', label: 'Bank Transfer / بینک' },
  { value: 'EasyPaisa', label: 'EasyPaisa' },
  { value: 'JazzCash', label: 'JazzCash' },
  { value: 'Card', label: 'Card / کارڈ' },
  { value: 'Cheque', label: 'Cheque / چیک' },
];

export default function ReceivePaymentPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: pendingInvoices, isLoading } = usePendingInvoices();
  const { data: recentPayments, isLoading: paymentsLoading } = useFeePayments();
  const recordPayment = useRecordPayment();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    payment_mode: 'Cash',
    reference_number: '',
    notes: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const filteredInvoices = useMemo(() => {
    return pendingInvoices?.filter(inv => {
      const studentName = inv.student?.profile?.full_name?.toLowerCase() || '';
      const admissionNo = inv.student?.admission_no?.toLowerCase() || '';
      const searchLower = search.toLowerCase();
      return studentName.includes(searchLower) || admissionNo.includes(searchLower);
    }) || [];
  }, [pendingInvoices, search]);

  const openPaymentDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    const balance = invoice.total_due - (invoice.amount_paid || 0);
    setFormData({
      amount: balance.toString(),
      payment_mode: 'Cash',
      reference_number: '',
      notes: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const balance = selectedInvoice.total_due - (selectedInvoice.amount_paid || 0);
    if (amount > balance) {
      toast.error(`Amount cannot exceed balance of Rs. ${balance.toLocaleString()}`);
      return;
    }

    try {
      await recordPayment.mutateAsync({
        invoice_id: selectedInvoice.id,
        student_id: selectedInvoice.student_id,
        amount,
        payment_date: formData.payment_date,
        payment_mode: formData.payment_mode,
        reference_number: formData.reference_number || undefined,
        received_by: user?.id,
        notes: formData.notes || undefined,
      });
      toast.success('Payment recorded successfully! / ادائیگی درج ہو گئی');
      setIsDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 me-1" />Paid</Badge>;
      case 'partial':
        return <Badge className="bg-warning/10 text-warning"><Clock className="h-3 w-3 me-1" />Partial</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 me-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 me-1" />Pending</Badge>;
    }
  };

  const todaysCollection = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return recentPayments?.filter(p => p.payment_date === today).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  }, [recentPayments]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <CreditCard className="h-8 w-8 text-success" />
                Receive Payment / ادائیگی وصول کریں
              </h1>
              <p className="page-subtitle">Record fee payments from students / طلباء سے فیس کی ادائیگی</p>
            </div>
          </div>
        </SlideIn>

        {/* Today's Stats */}
        <SlideIn delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Collection</p>
                    <p className="text-2xl font-bold text-success">Rs. {todaysCollection.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Invoices</p>
                    <p className="text-2xl font-bold">{pendingInvoices?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pending Amount</p>
                    <p className="text-2xl font-bold">
                      Rs. {(pendingInvoices?.reduce((sum, inv) => sum + (inv.total_due - (inv.amount_paid || 0)), 0) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SlideIn>

        {/* Pending Invoices */}
        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Pending Invoices</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
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
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-success" />
                  <p>No pending invoices found! All fees are cleared.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Total Due</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => {
                        const balance = invoice.total_due - (invoice.amount_paid || 0);
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <Badge variant="outline">{invoice.student?.admission_no || '-'}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {invoice.student?.profile?.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>{invoice.student?.class?.name || '-'}</TableCell>
                            <TableCell>{invoice.month_year}</TableCell>
                            <TableCell>Rs. {invoice.total_due.toLocaleString()}</TableCell>
                            <TableCell className="text-success">
                              Rs. {(invoice.amount_paid || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-semibold text-destructive">
                              Rs. {balance.toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status || 'pending')}</TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => openPaymentDialog(invoice)}>
                                <CreditCard className="h-4 w-4 me-1" />
                                Pay
                              </Button>
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

        {/* Recent Payments */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments (Last 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <Skeleton className="h-32" />
              ) : recentPayments && recentPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.slice(0, 10).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{payment.student?.profile?.full_name || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-success">
                            Rs. {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell><Badge variant="secondary">{payment.payment_mode}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.reference_number || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No payments recorded yet</p>
              )}
            </CardContent>
          </Card>
        </SlideIn>

        {/* Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment / ادائیگی درج کریں</DialogTitle>
              <DialogDescription>
                {selectedInvoice && (
                  <>
                    Student: {selectedInvoice.student?.profile?.full_name} |
                    Month: {selectedInvoice.month_year} |
                    Balance: Rs. {(selectedInvoice.total_due - (selectedInvoice.amount_paid || 0)).toLocaleString()}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (PKR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max={selectedInvoice ? selectedInvoice.total_due - (selectedInvoice.amount_paid || 0) : undefined}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_mode">Payment Mode *</Label>
                  <Select
                    value={formData.payment_mode}
                    onValueChange={(v) => setFormData({ ...formData, payment_mode: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_number">Transaction ID / Reference</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={recordPayment.isPending}>
                  {recordPayment.isPending ? 'Processing...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
