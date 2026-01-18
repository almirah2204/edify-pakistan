import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Download, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useFees } from '@/hooks/useFees';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function StudentFees() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const { data: fees, isLoading } = useFees();

  // Filter fees for current student
  const myFees = fees?.filter(f => f.student_id === user?.id) || [];

  const downloadReceipt = (fee: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PakSchool ERP', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Fee Receipt / فیس رسید', 105, 30, { align: 'center' });
    
    // Receipt Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${fee.id.slice(0, 8).toUpperCase()}`, 20, 50);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 20, 60);
    
    // Student Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Details', 20, 80);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${profile?.full_name || 'N/A'}`, 20, 95);
    
    // Fee Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fee Details', 20, 120);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Due Date: ${fee.due_date ? format(new Date(fee.due_date), 'PPP') : 'N/A'}`, 20, 135);
    doc.text(`Amount Due: Rs. ${fee.amount_due?.toLocaleString() || 0}`, 20, 145);
    doc.text(`Amount Paid: Rs. ${fee.amount_paid?.toLocaleString() || 0}`, 20, 155);
    doc.text(`Status: ${fee.status?.toUpperCase() || 'PENDING'}`, 20, 165);
    
    if (fee.paid_date) {
      doc.text(`Paid Date: ${format(new Date(fee.paid_date), 'PPP')}`, 20, 175);
    }
    if (fee.payment_method) {
      doc.text(`Payment Method: ${fee.payment_method}`, 20, 185);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('This is a computer generated receipt.', 105, 250, { align: 'center' });
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 280);
    
    doc.save(`fee_receipt_${fee.id.slice(0, 8)}.pdf`);
    toast.success('Receipt downloaded! / رسید ڈاؤنلوڈ ہو گئی!');
  };

  // Calculate totals
  const totals = myFees.reduce((acc, fee) => ({
    due: acc.due + (fee.amount_due || 0),
    paid: acc.paid + (fee.amount_paid || 0),
  }), { due: 0, paid: 0 });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; icon: React.ReactNode }> = {
      paid: { class: 'bg-success/20 text-success border-success/30', icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { class: 'bg-warning/20 text-warning border-warning/30', icon: <AlertCircle className="h-3 w-3" /> },
      overdue: { class: 'bg-destructive/20 text-destructive border-destructive/30', icon: <AlertCircle className="h-3 w-3" /> },
    };
    return styles[status] || styles.pending;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('fee.my')}</h1>
              <p className="page-subtitle">View your fee details / اپنی فیس کی تفصیلات دیکھیں</p>
            </div>
          </div>
        </SlideIn>

        {/* Summary */}
        <SlideIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Rs. {totals.due.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Due</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Rs. {totals.paid.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${totals.due - totals.paid > 0 ? 'bg-warning/10' : 'bg-success/10'}`}>
                    <AlertCircle className={`h-6 w-6 ${totals.due - totals.paid > 0 ? 'text-warning' : 'text-success'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Rs. {(totals.due - totals.paid).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SlideIn>

        {/* Fee History */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : myFees.length > 0 ? (
                <div className="space-y-3">
                  {myFees.map((fee) => {
                    const statusInfo = getStatusBadge(fee.status || 'pending');
                    
                    return (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Fee Payment</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Due: {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                Rs. {fee.amount_due?.toLocaleString() || 0}
                              </Badge>
                              <Badge variant="outline" className={statusInfo.class}>
                                <span className="flex items-center gap-1">
                                  {statusInfo.icon}
                                  {(fee.status || 'pending').toUpperCase()}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {fee.status === 'paid' && (
                          <Button variant="outline" size="sm" onClick={() => downloadReceipt(fee)}>
                            <Download className="h-4 w-4 me-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No fee records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
