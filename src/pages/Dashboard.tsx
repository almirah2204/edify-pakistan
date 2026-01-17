import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatCard, ActivityItem } from '@/components/common/DashboardWidgets';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { Users, GraduationCap, Building2, DollarSign, ClipboardCheck, Bell, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardStats, useWeeklyAttendance, useRecentActivity } from '@/hooks/useDashboardStats';
import { format } from 'date-fns';

export default function Dashboard() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: attendanceData, isLoading: attendanceLoading } = useWeeklyAttendance();
  const { data: activities } = useRecentActivity();

  const feeData = stats ? [
    { name: 'Collected', value: stats.totalFeeCollected, color: 'hsl(160, 85%, 28%)' },
    { name: 'Pending', value: stats.totalFeeDue - stats.totalFeeCollected, color: 'hsl(38, 92%, 50%)' },
  ] : [];

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `Rs. ${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `Rs. ${(value / 1000).toFixed(0)}K`;
    }
    return `Rs. ${value}`;
  };

  const activityIcons: Record<string, React.ReactNode> = {
    attendance: <ClipboardCheck className="h-4 w-4 text-primary" />,
    fee: <DollarSign className="h-4 w-4 text-success" />,
    notice: <Bell className="h-4 w-4 text-warning" />,
    admission: <GraduationCap className="h-4 w-4 text-info" />,
  };

  const activityBgColors: Record<string, string> = {
    attendance: 'bg-primary/10',
    fee: 'bg-success/10',
    notice: 'bg-warning/10',
    admission: 'bg-info/10',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('common.dashboard')}</h1>
              <p className="page-subtitle">
                {t('common.welcome')}, {profile?.full_name || 'User'} 👋
              </p>
            </div>
            <div className="action-buttons">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 me-2" />
                {format(new Date(), 'MMM dd, yyyy')}
              </Button>
            </div>
          </div>
        </SlideIn>

        {/* Approval Notice for non-approved users */}
        {profile && !profile.is_approved && profile.role !== 'admin' && (
          <SlideIn>
            <Card className="border-warning bg-warning/10">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">Account Pending Approval</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is awaiting admin approval. Some features may be limited.
                  </p>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Stats Grid */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            {statsLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <StatCard
                title={t('dashboard.totalStudents')}
                value={stats?.totalStudents?.toLocaleString() || '0'}
                icon={<GraduationCap className="h-6 w-6 text-primary" />}
                iconBgClass="bg-primary/10"
              />
            )}
          </StaggerItem>
          <StaggerItem>
            {statsLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <StatCard
                title={t('dashboard.totalTeachers')}
                value={stats?.totalTeachers?.toString() || '0'}
                icon={<Users className="h-6 w-6 text-secondary" />}
                iconBgClass="bg-secondary/10"
              />
            )}
          </StaggerItem>
          <StaggerItem>
            {statsLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <StatCard
                title={t('dashboard.totalClasses')}
                value={stats?.totalClasses?.toString() || '0'}
                icon={<Building2 className="h-6 w-6 text-info" />}
                iconBgClass="bg-info/10"
              />
            )}
          </StaggerItem>
          <StaggerItem>
            {statsLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <StatCard
                title={t('dashboard.feeCollection')}
                value={formatCurrency(stats?.totalFeeCollected || 0)}
                icon={<DollarSign className="h-6 w-6 text-success" />}
                iconBgClass="bg-success/10"
              />
            )}
          </StaggerItem>
        </StaggerChildren>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SlideIn delay={0.2} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.attendance')}</CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <Skeleton className="h-[250px]" />
                ) : attendanceData && attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={attendanceData}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160, 85%, 28%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160, 85%, 28%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="present" stroke="hsl(160, 85%, 28%)" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No attendance data available
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('fee.collection')}</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[200px]" />
                ) : feeData.some(d => d.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {feeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      {feeData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No fee data available
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SlideIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <span className="text-sm">{t('attendance.markAttendance')}</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span className="text-sm">{t('nav.homework')}</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <DollarSign className="h-5 w-5 text-success" />
                    <span className="text-sm">{t('fee.collection')}</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <span className="text-sm">{t('notice.createNotice')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {activities && activities.length > 0 ? (
                    activities.slice(0, 4).map((activity, index) => (
                      <ActivityItem
                        key={activity.id || index}
                        icon={activityIcons[activity.entity_type || 'attendance'] || activityIcons.attendance}
                        title={activity.action}
                        description={activity.entity_type || ''}
                        time={activity.created_at ? format(new Date(activity.created_at), 'h:mm a') : ''}
                        iconBgClass={activityBgColors[activity.entity_type || 'attendance'] || activityBgColors.attendance}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </div>
    </DashboardLayout>
  );
}
