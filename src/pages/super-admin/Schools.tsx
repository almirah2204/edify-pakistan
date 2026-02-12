import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useSchools, useCreateSchool, useUpdateSchool, useDeleteSchool, generateSchoolCode } from '@/hooks/useSchools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Building2, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface SchoolFormData {
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  principal_name: string;
  subscription_plan: string;
  max_students: number;
  max_staff: number;
}

const emptyFormData: SchoolFormData = {
  name: '',
  code: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  principal_name: '',
  subscription_plan: 'trial',
  max_students: 50,
  max_staff: 10,
};

export default function SchoolsPage() {
  const { t } = useLanguage();
  const { data: schools, isLoading } = useSchools();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SchoolFormData>(emptyFormData);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const filteredSchools = schools?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = await generateSchoolCode();
      setFormData(prev => ({ ...prev, code }));
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateSchool.mutateAsync({
          id: editingId,
          name: formData.name,
          code: formData.code,
          city: formData.city,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          principal_name: formData.principal_name,
          subscription_plan: formData.subscription_plan,
          max_students: formData.max_students,
          max_staff: formData.max_staff,
        });
        toast.success('School updated successfully!');
      } else {
        await createSchool.mutateAsync({
          name: formData.name,
          code: formData.code,
          city: formData.city,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          principal_name: formData.principal_name,
          subscription_plan: formData.subscription_plan,
          max_students: formData.max_students,
          max_staff: formData.max_staff,
        });
        toast.success('School created successfully!');
      }
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (school: any) => {
    setEditingId(school.id);
    setFormData({
      name: school.name,
      code: school.code,
      city: school.city || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      principal_name: school.principal_name || '',
      subscription_plan: school.subscription_plan,
      max_students: school.max_students,
      max_staff: school.max_staff,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchool.mutateAsync(id);
      toast.success('School deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const openNewDialog = async () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
    // Auto-generate code for new schools
    await handleGenerateCode();
  };

  const getSubscriptionBadge = (plan: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      trial: 'secondary',
      basic: 'outline',
      standard: 'default',
      premium: 'default',
    };
    return <Badge variant={variants[plan] || 'secondary'}>{plan}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                Schools Management
              </h1>
              <p className="page-subtitle">Manage all registered schools on SDMPK platform</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                  <Plus className="h-4 w-4 me-2" />
                  Add School
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit School' : 'Add New School'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Update school information' : 'Register a new school on SDMPK'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">School Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Punjab Public School"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">School Code *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="e.g., SCH26001"
                          required
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateCode}
                          disabled={isGeneratingCode}
                        >
                          {isGeneratingCode ? '...' : 'Generate'}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Lahore"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., 042-12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g., info@school.edu.pk"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="e.g., www.school.edu.pk"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="principal_name">Principal Name</Label>
                      <Input
                        id="principal_name"
                        value={formData.principal_name}
                        onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })}
                        placeholder="e.g., Mr. Ahmed Khan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription_plan">Subscription Plan</Label>
                      <Select
                        value={formData.subscription_plan}
                        onValueChange={(v) => setFormData({ ...formData, subscription_plan: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="trial">Trial (Free)</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_students">Max Students</Label>
                      <Input
                        id="max_students"
                        type="number"
                        value={formData.max_students}
                        onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 50 })}
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_staff">Max Staff</Label>
                      <Input
                        id="max_staff"
                        type="number"
                        value={formData.max_staff}
                        onChange={(e) => setFormData({ ...formData, max_staff: parseInt(e.target.value) || 10 })}
                        min={1}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSchool.isPending || updateSchool.isPending}>
                      {createSchool.isPending || updateSchool.isPending ? 'Saving...' : 'Save'}
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
                <CardTitle>All Schools ({filteredSchools.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schools..."
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
              ) : filteredSchools.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No schools found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Limits</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.map((school) => (
                        <TableRow key={school.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: school.primary_color }}
                              >
                                {school.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{school.name}</p>
                                <p className="text-xs text-muted-foreground">{school.email || 'No email'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{school.code}</Badge>
                          </TableCell>
                          <TableCell>{school.city || '-'}</TableCell>
                          <TableCell>{getSubscriptionBadge(school.subscription_plan)}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {school.max_students} students / {school.max_staff} staff
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={school.is_active ? 'outline' : 'destructive'}>
                              {school.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link to={`/super-admin/schools/${school.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(school)}>
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
                                    <AlertDialogTitle>Delete School?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{school.name}" and all its data. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(school.id)}
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
