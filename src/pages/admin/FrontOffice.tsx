import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { useEnquiries, useCreateEnquiry, useUpdateEnquiry, useVisitors, useCreateVisitor, useCheckoutVisitor } from '@/hooks/useFrontOffice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Building2, Plus, Search, UserPlus, Eye, Phone, Mail, LogOut, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StatCard } from '@/components/common/DashboardWidgets';

const ENQUIRY_SOURCES = ['walk-in', 'phone', 'online', 'referral', 'advertisement'];
const ENQUIRY_STATUSES = ['new', 'contacted', 'follow-up', 'converted', 'lost'];

interface EnquiryForm {
  student_name: string;
  father_name: string;
  contact_number: string;
  email: string;
  class_applied: string;
  previous_school: string;
  address: string;
  source: string;
  notes: string;
}

const emptyEnquiryForm: EnquiryForm = {
  student_name: '', father_name: '', contact_number: '', email: '',
  class_applied: '', previous_school: '', address: '', source: 'walk-in', notes: '',
};

interface VisitorForm {
  visitor_name: string;
  phone: string;
  purpose: string;
  whom_to_meet: string;
  id_type: string;
  id_number: string;
  notes: string;
}

const emptyVisitorForm: VisitorForm = {
  visitor_name: '', phone: '', purpose: '', whom_to_meet: '',
  id_type: '', id_number: '', notes: '',
};

export default function FrontOfficePage() {
  const { data: enquiries, isLoading: eqLoading } = useEnquiries();
  const { data: visitors, isLoading: vLoading } = useVisitors();
  const createEnquiry = useCreateEnquiry();
  const updateEnquiry = useUpdateEnquiry();
  const createVisitor = useCreateVisitor();
  const checkoutVisitor = useCheckoutVisitor();

  const [eqSearch, setEqSearch] = useState('');
  const [vSearch, setVSearch] = useState('');
  const [isEqDialogOpen, setIsEqDialogOpen] = useState(false);
  const [isVDialogOpen, setIsVDialogOpen] = useState(false);
  const [eqForm, setEqForm] = useState<EnquiryForm>(emptyEnquiryForm);
  const [vForm, setVForm] = useState<VisitorForm>(emptyVisitorForm);

  const filteredEnquiries = enquiries?.filter(e =>
    e.student_name.toLowerCase().includes(eqSearch.toLowerCase()) ||
    e.father_name?.toLowerCase().includes(eqSearch.toLowerCase()) ||
    e.contact_number?.includes(eqSearch)
  ) || [];

  const filteredVisitors = visitors?.filter(v =>
    v.visitor_name.toLowerCase().includes(vSearch.toLowerCase()) ||
    v.purpose.toLowerCase().includes(vSearch.toLowerCase())
  ) || [];

  const todayVisitors = visitors?.filter(v => {
    const today = new Date().toISOString().split('T')[0];
    return v.check_in.startsWith(today);
  }) || [];

  const newEnquiries = enquiries?.filter(e => e.status === 'new').length || 0;

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEnquiry.mutateAsync(eqForm);
      toast.success('Enquiry recorded!');
      setIsEqDialogOpen(false);
      setEqForm(emptyEnquiryForm);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVisitor.mutateAsync(vForm);
      toast.success('Visitor checked in!');
      setIsVDialogOpen(false);
      setVForm(emptyVisitorForm);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      await checkoutVisitor.mutateAsync(id);
      toast.success('Visitor checked out!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEnquiry.mutateAsync({ id, status });
      toast.success('Status updated!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-600',
      contacted: 'bg-yellow-500/10 text-yellow-600',
      'follow-up': 'bg-orange-500/10 text-orange-600',
      converted: 'bg-green-500/10 text-green-600',
      lost: 'bg-red-500/10 text-red-600',
    };
    return <Badge className={map[status] || ''}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                Front Office / فرنٹ آفس
              </h1>
              <p className="page-subtitle">Manage enquiries and visitor logs</p>
            </div>
          </div>
        </SlideIn>

        {/* Stats */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard title="New Enquiries" value={newEnquiries.toString()} icon={<UserPlus className="h-6 w-6 text-primary" />} iconBgClass="bg-primary/10" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="Today's Visitors" value={todayVisitors.length.toString()} icon={<Eye className="h-6 w-6 text-secondary" />} iconBgClass="bg-secondary/10" />
          </StaggerItem>
          <StaggerItem>
            <StatCard title="Total Enquiries" value={(enquiries?.length || 0).toString()} icon={<Phone className="h-6 w-6 text-info" />} iconBgClass="bg-info/10" />
          </StaggerItem>
        </StaggerChildren>

        <SlideIn delay={0.2}>
          <Tabs defaultValue="enquiries">
            <TabsList>
              <TabsTrigger value="enquiries">Enquiries ({enquiries?.length || 0})</TabsTrigger>
              <TabsTrigger value="visitors">Visitors ({visitors?.length || 0})</TabsTrigger>
            </TabsList>

            {/* Enquiries Tab */}
            <TabsContent value="enquiries" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search enquiries..." value={eqSearch} onChange={(e) => setEqSearch(e.target.value)} className="ps-9" />
                </div>
                <Button onClick={() => { setEqForm(emptyEnquiryForm); setIsEqDialogOpen(true); }}>
                  <Plus className="h-4 w-4 me-2" />
                  New Enquiry
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {eqLoading ? (
                    <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                  ) : filteredEnquiries.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No enquiries found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Father</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEnquiries.map((eq) => (
                            <TableRow key={eq.id}>
                              <TableCell className="text-sm">{format(new Date(eq.enquiry_date), 'dd MMM')}</TableCell>
                              <TableCell className="font-medium">{eq.student_name}</TableCell>
                              <TableCell>{eq.father_name || '-'}</TableCell>
                              <TableCell>{eq.contact_number || '-'}</TableCell>
                              <TableCell>{eq.class_applied || '-'}</TableCell>
                              <TableCell><Badge variant="outline" className="capitalize">{eq.source}</Badge></TableCell>
                              <TableCell>{getStatusBadge(eq.status || 'new')}</TableCell>
                              <TableCell>
                                <Select value={eq.status || 'new'} onValueChange={(v) => handleStatusChange(eq.id, v)}>
                                  <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover">
                                    {ENQUIRY_STATUSES.map((s) => (
                                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visitors Tab */}
            <TabsContent value="visitors" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search visitors..." value={vSearch} onChange={(e) => setVSearch(e.target.value)} className="ps-9" />
                </div>
                <Button onClick={() => { setVForm(emptyVisitorForm); setIsVDialogOpen(true); }}>
                  <Plus className="h-4 w-4 me-2" />
                  Check In Visitor
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {vLoading ? (
                    <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                  ) : filteredVisitors.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No visitors logged</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Meeting</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVisitors.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell className="font-medium">{v.visitor_name}</TableCell>
                              <TableCell>{v.phone || '-'}</TableCell>
                              <TableCell>{v.purpose}</TableCell>
                              <TableCell>{v.whom_to_meet || '-'}</TableCell>
                              <TableCell className="text-sm">{format(new Date(v.check_in), 'hh:mm a')}</TableCell>
                              <TableCell>
                                {v.check_out ? (
                                  <span className="text-sm">{format(new Date(v.check_out), 'hh:mm a')}</span>
                                ) : (
                                  <Badge variant="outline" className="text-green-600">In campus</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {!v.check_out && (
                                  <Button variant="outline" size="sm" onClick={() => handleCheckout(v.id)}>
                                    <LogOut className="h-3 w-3 me-1" />
                                    Check Out
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
            </TabsContent>
          </Tabs>
        </SlideIn>

        {/* Enquiry Dialog */}
        <Dialog open={isEqDialogOpen} onOpenChange={setIsEqDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Enquiry</DialogTitle>
              <DialogDescription>Record a new admission enquiry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEnquirySubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Name *</Label>
                  <Input placeholder="Student's full name" value={eqForm.student_name} onChange={(e) => setEqForm({ ...eqForm, student_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input placeholder="Father's name" value={eqForm.father_name} onChange={(e) => setEqForm({ ...eqForm, father_name: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input placeholder="03XX-XXXXXXX" value={eqForm.contact_number} onChange={(e) => setEqForm({ ...eqForm, contact_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@example.com" value={eqForm.email} onChange={(e) => setEqForm({ ...eqForm, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class Applied For</Label>
                  <Input placeholder="e.g., Class 5" value={eqForm.class_applied} onChange={(e) => setEqForm({ ...eqForm, class_applied: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={eqForm.source} onValueChange={(v) => setEqForm({ ...eqForm, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {ENQUIRY_SOURCES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Previous School</Label>
                <Input placeholder="Previous school name" value={eqForm.previous_school} onChange={(e) => setEqForm({ ...eqForm, previous_school: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes..." rows={2} value={eqForm.notes} onChange={(e) => setEqForm({ ...eqForm, notes: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEqDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createEnquiry.isPending}>
                  {createEnquiry.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Visitor Dialog */}
        <Dialog open={isVDialogOpen} onOpenChange={setIsVDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Check In Visitor</DialogTitle>
              <DialogDescription>Record a new visitor entry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVisitorSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Visitor Name *</Label>
                <Input placeholder="Full name" value={vForm.visitor_name} onChange={(e) => setVForm({ ...vForm, visitor_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="03XX-XXXXXXX" value={vForm.phone} onChange={(e) => setVForm({ ...vForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Purpose *</Label>
                  <Input placeholder="Purpose of visit" value={vForm.purpose} onChange={(e) => setVForm({ ...vForm, purpose: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Whom to Meet</Label>
                <Input placeholder="Person to meet" value={vForm.whom_to_meet} onChange={(e) => setVForm({ ...vForm, whom_to_meet: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <Select value={vForm.id_type} onValueChange={(v) => setVForm({ ...vForm, id_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select ID" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="cnic">CNIC</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving-license">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input placeholder="ID number" value={vForm.id_number} onChange={(e) => setVForm({ ...vForm, id_number: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsVDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createVisitor.isPending}>
                  {createVisitor.isPending ? 'Checking in...' : 'Check In'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
