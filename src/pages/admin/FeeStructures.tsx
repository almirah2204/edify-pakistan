import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import {
  useFeeStructures,
  useCreateFeeStructure,
  useUpdateFeeStructure,
  useDeleteFeeStructure,
} from '@/hooks/useFeeManagement';
import { useClasses } from '@/hooks/useClasses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Settings, Search } from 'lucide-react';
import { toast } from 'sonner';

const FREQUENCIES = [
  { value: 'one-time', label: 'One-time / ایک بار' },
  { value: 'monthly', label: 'Monthly / ماہانہ' },
  { value: 'quarterly', label: 'Quarterly / سہ ماہی' },
  { value: 'yearly', label: 'Yearly / سالانہ' },
];

const FEE_CATEGORIES = [
  { value: 'Normal', label: 'Normal / عام' },
  { value: 'Staff', label: 'Staff / سٹاف' },
  { value: 'Sibling', label: 'Sibling Discount / بھائی بہن رعایت' },
  { value: 'Scholarship', label: 'Scholarship / وظیفہ' },
];

export default function FeeStructuresPage() {
  const { t } = useLanguage();
  const { data: feeStructures, isLoading } = useFeeStructures();
  const { data: classes } = useClasses();
  const createFeeStructure = useCreateFeeStructure();
  const updateFeeStructure = useUpdateFeeStructure();
  const deleteFeeStructure = useDeleteFeeStructure();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    description: '',
    fee_category: 'Normal',
  });

  const filteredStructures = feeStructures?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const openAddDialog = () => {
    setEditingStructure(null);
    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      description: '',
      fee_category: 'Normal',
    });
    setSelectedClasses([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (structure: any) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      amount: structure.amount?.toString() || '',
      frequency: structure.frequency || 'monthly',
      description: structure.description || '',
      fee_category: structure.fee_category || 'Normal',
    });
    setSelectedClasses(structure.applicable_classes || []);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      description: formData.description,
      applicable_classes: selectedClasses,
      fee_category: formData.fee_category,
    };

    try {
      if (editingStructure) {
        await updateFeeStructure.mutateAsync({ id: editingStructure.id, ...payload });
        toast.success('Fee structure updated! / فیس ڈھانچہ اپڈیٹ ہو گیا');
      } else {
        await createFeeStructure.mutateAsync(payload);
        toast.success('Fee structure created! / فیس ڈھانچہ بن گیا');
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFeeStructure.mutateAsync(deleteId);
      toast.success('Fee structure deleted! / فیس ڈھانچہ حذف ہو گیا');
      setIsDeleteOpen(false);
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(c => c !== classId)
        : [...prev, classId]
    );
  };

  const getFrequencyLabel = (freq: string | null) => {
    return FREQUENCIES.find(f => f.value === freq)?.label || freq || '-';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Settings className="h-8 w-8 text-primary" />
                Fee Structures / فیس ڈھانچہ
              </h1>
              <p className="page-subtitle">Manage fee heads and pricing / فیس کی اقسام اور قیمتیں</p>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 me-2" />
              Add Fee Head
            </Button>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Fee Heads ({filteredStructures.length})</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fee heads..."
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
              ) : filteredStructures.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fee structures found. Add your first fee head!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Amount (PKR)</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStructures.map((structure) => (
                        <TableRow key={structure.id}>
                          <TableCell className="font-medium">{structure.name}</TableCell>
                          <TableCell>Rs. {structure.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getFrequencyLabel(structure.frequency)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{structure.fee_category || 'Normal'}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {structure.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(structure)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeleteId(structure.id);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStructure ? 'Edit Fee Structure' : 'Add New Fee Head'}
              </DialogTitle>
              <DialogDescription>
                {editingStructure ? 'Update fee details' : 'Create a new fee head'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Fee Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tuition Fee, Exam Fee"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (PKR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) => setFormData({ ...formData, frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee_category">Fee Category</Label>
                  <Select
                    value={formData.fee_category}
                    onValueChange={(v) => setFormData({ ...formData, fee_category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Applicable Classes</Label>
                  <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                    {classes?.map((cls) => (
                      <div key={cls.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${cls.id}`}
                          checked={selectedClasses.includes(cls.id)}
                          onCheckedChange={() => toggleClass(cls.id)}
                        />
                        <label
                          htmlFor={`class-${cls.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {cls.name}
                        </label>
                      </div>
                    ))}
                    {!classes?.length && (
                      <p className="text-sm text-muted-foreground">No classes found</p>
                    )}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createFeeStructure.isPending || updateFeeStructure.isPending}
                >
                  {createFeeStructure.isPending || updateFeeStructure.isPending
                    ? 'Saving...'
                    : editingStructure
                    ? 'Update'
                    : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Fee Structure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Students assigned to this fee structure will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
