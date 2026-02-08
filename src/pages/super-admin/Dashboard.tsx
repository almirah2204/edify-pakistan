import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useSchools } from '@/hooks/useSchools';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  GraduationCap,
  TrendingUp,
  School,
  Plus,
  Settings,
  BarChart3,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { data: schools, isLoading } = useSchools();

  const activeSchools = schools?.filter(s => s.is_active) || [];
  const trialSchools = schools?.filter(s => s.subscription_plan === 'trial') || [];
  const paidSchools = schools?.filter(s => ['basic', 'standard', 'premium'].includes(s.subscription_plan)) || [];

  const stats = [
    {
      title: 'Total Schools',
      value: schools?.length || 0,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Schools',
      value: activeSchools.length,
      icon: School,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Trial Schools',
      value: trialSchools.length,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Paid Subscriptions',
      value: paidSchools.length,
      icon: BarChart3,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                SDMPK Super Admin
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome, {profile?.full_name} • Managing all schools
              </p>
            </div>
            <Link to="/super-admin/schools">
              <Button>
                <Plus className="h-4 w-4 me-2" />
                Add School
              </Button>
            </Link>
          </div>
        </SlideIn>

        {/* Stats Grid */}
        <SlideIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideIn>

        {/* Quick Actions */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage SDMPK platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/super-admin/schools">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Building2 className="h-6 w-6" />
                    <span>Manage Schools</span>
                  </Button>
                </Link>
                <Link to="/super-admin/users">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span>All Users</span>
                  </Button>
                </Link>
                <Link to="/super-admin/subscriptions">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Subscriptions</span>
                  </Button>
                </Link>
                <Link to="/super-admin/settings">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span>Platform Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Recent Schools */}
        <SlideIn delay={0.3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Schools</CardTitle>
                <CardDescription>Latest registered schools</CardDescription>
              </div>
              <Link to="/super-admin/schools">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : schools && schools.length > 0 ? (
                <div className="space-y-3">
                  {schools.slice(0, 5).map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: school.primary_color }}
                        >
                          {school.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{school.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {school.code} • {school.city || 'No city'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={school.subscription_plan === 'trial' ? 'secondary' : 'default'}>
                          {school.subscription_plan}
                        </Badge>
                        <Badge variant={school.is_active ? 'outline' : 'destructive'}>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No schools registered yet</p>
                  <Link to="/super-admin/schools">
                    <Button variant="link" className="mt-2">
                      Add your first school
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
