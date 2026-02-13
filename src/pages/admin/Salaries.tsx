import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { useTeachers } from '@/hooks/useTeachers';
import { useSalaries, useCreateSalary, useUpdateSalary } from '@/hooks/useFrontOffice';
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Wallet, Plus, Search, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StatCard } from '@/components/common/DashboardWidgets';

interface SalaryForm {
  teacher_id: string;
  month: string;
  base_salary: string;
  deductions: string;
  bonuses: string;
}

const emptyForm: SalaryForm = {
  teacher_id: '', month: '', base_salary: '', deductions: '0', bonuses: '0',
};

export default function SalariesPage() {
  const { data: teachers } = useTeachers();
  const { data: salaries, isLoading } = useSalaries();
  const createSalary = useCreateSalary();
  const updateSalary = useUpdateSalary();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SalaryForm>(emptyForm);

  const filtered = salaries?.filter((s: any) => {
    const name = s.teacher?.profile?.full_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  }) || [];

  const totalPending = salaries?.filter((s: any) => s.status === 'pending').length || 0;
  const totalPaid = salaries?.filter((s: any) => s.status === 'paid').length || 0;
  const totalAmount = salaries?.reduce((sum: number, s: any) => sum + Number(s.net_salary || 0), 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseSalary = parseFloat(formData.base_salary);
    const deductions = parseFloat(formData.deductions) || 0;
    const bonuses = parseFloat(formData.bonuses) || 0;
    const netSalary = baseSalary - deductions + bonuses;

    try {
      await createSalary.mutateAsync({
        teacher_id: formData.teacher_id,
        month: formData.month + '-01',
        base_salary: baseSalary,
        deductions,
        bonuses,
        net_salary: netSalary,
      });
      toast.success('Salary record created!');
      setIsDialogOpen(false);
      setFormData(emptyForm);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateSalary.mutateAsync({
        id,
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      });
      toast.success('Salary marked as paid!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Wallet className="h-8 w-8 text-primary" />
                HR & Payroll / تنخواہ
              </h1>
              <p className="page-subtitle">Manage staff salaries and payments</p>
            </div>
            <Button onClick={() => { setFormData(emptyForm); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 me-2" />
              Generate Salary
            </Button>
          </div>
        </SlideIn>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard title="Pending Salaries" value={totalPending.toString()} icon={<Clock className="h-6 w-6 text-warning" />} iconBgClass="bg-warning/10" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="Paid This Month" value={totalPaid.toString()} icon={<CheckCircle2 className="h-6 w-6 text-success" />} iconBgClass="bg-success/10" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="Total Disbursed" value={formatCurrency(totalAmount)} icon={<DollarSign className="h-6 w-6 text-primary" />} iconBgClass="bg-primary/10" />
          </StaggerItem>
        </StaggerChildren>

        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Salary Records</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by teacher..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No salary records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Base</TableHead>
                        <TableHead className="text-right">Deductions</TableHead>
                        <TableHead className="text-right">Bonuses</TableHead>
                        <TableHead className="text-right">Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.teacher?.profile?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{format(new Date(s.month), 'MMM yyyy')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(s.base_salary)}</TableCell>
                          <TableCell className="text-right text-destructive">-{formatCurrency(s.deductions || 0)}</TableCell>
                          <TableCell className="text-right text-success">+{formatCurrency(s.bonuses || 0)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(s.net_salary)}</TableCell>
                          <TableCell>
                            {s.status === 'paid' ? (
                              <Badge className="bg-success/10 text-success">Paid</Badge>
                            ) : (
                              <Badge variant="outline" className="text-warning">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {s.status !== 'paid' && (
                              <Button variant="outline" size="sm" onClick={() => handleMarkPaid(s.id)}>
                                <CheckCircle2 className="h-3 w-3 me-1" />
                                Pay
                              </Button>
                            )}
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

        {/* Create Salary Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Salary</DialogTitle>
              <DialogDescription>Create a salary record for a staff member</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Teacher *</Label>
                <Select value={formData.teacher_id} onValueChange={(v) => setFormData({ ...formData, teacher_id: v })} required>
                  <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {teachers?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.profile?.full_name || 'Unknown'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month *</Label>
                <Input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Base Salary (Rs.) *</Label>
                <Input type="number" min="0" placeholder="e.g., 50000" value={formData.base_salary} onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deductions (Rs.)</Label>
                  <Input type="number" min="0" placeholder="0" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Bonuses (Rs.)</Label>
                  <Input type="number" min="0" placeholder="0" value={formData.bonuses} onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })} />
                </div>
              </div>
              {formData.base_salary && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Net Salary: <strong className="text-foreground">{formatCurrency(
                    (parseFloat(formData.base_salary) || 0) - (parseFloat(formData.deductions) || 0) + (parseFloat(formData.bonuses) || 0)
                  )}</strong></p>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createSalary.isPending}>
                  {createSalary.isPending ? 'Saving...' : 'Generate'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
