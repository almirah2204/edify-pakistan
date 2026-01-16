import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatCard, ActivityItem } from '@/components/common/DashboardWidgets';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { Users, GraduationCap, Building2, DollarSign, ClipboardCheck, Bell, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const attendanceData = [
  { name: 'Mon', present: 92, absent: 8 },
  { name: 'Tue', present: 88, absent: 12 },
  { name: 'Wed', present: 95, absent: 5 },
  { name: 'Thu', present: 90, absent: 10 },
  { name: 'Fri', present: 85, absent: 15 },
];

const feeData = [
  { name: 'Collected', value: 850000, color: 'hsl(160, 85%, 28%)' },
  { name: 'Pending', value: 150000, color: 'hsl(38, 92%, 50%)' },
];

const recentActivities = [
  { icon: <ClipboardCheck className="h-4 w-4 text-primary" />, title: 'Attendance Marked', description: 'Class 10-A attendance completed', time: '2 min ago', iconBg: 'bg-primary/10' },
  { icon: <DollarSign className="h-4 w-4 text-success" />, title: 'Fee Received', description: 'Ahmed Khan paid Rs. 15,000', time: '15 min ago', iconBg: 'bg-success/10' },
  { icon: <Bell className="h-4 w-4 text-warning" />, title: 'Notice Published', description: 'PTM scheduled for next week', time: '1 hour ago', iconBg: 'bg-warning/10' },
  { icon: <GraduationCap className="h-4 w-4 text-info" />, title: 'New Admission', description: 'Sara Ali admitted to Class 5-B', time: '2 hours ago', iconBg: 'bg-info/10' },
];

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('common.dashboard')}</h1>
              <p className="page-subtitle">{t('common.welcome')} 👋</p>
            </div>
            <div className="action-buttons">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 me-2" />
                Today: Jan 16, 2026
              </Button>
            </div>
          </div>
        </SlideIn>

        {/* Stats Grid */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            <StatCard
              title={t('dashboard.totalStudents')}
              value="1,250"
              icon={<GraduationCap className="h-6 w-6 text-primary" />}
              trend={{ value: 12, isPositive: true }}
              iconBgClass="bg-primary/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={t('dashboard.totalTeachers')}
              value="48"
              icon={<Users className="h-6 w-6 text-secondary" />}
              trend={{ value: 5, isPositive: true }}
              iconBgClass="bg-secondary/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={t('dashboard.totalClasses')}
              value="32"
              icon={<Building2 className="h-6 w-6 text-info" />}
              iconBgClass="bg-info/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={t('dashboard.feeCollection')}
              value="Rs. 8.5L"
              icon={<DollarSign className="h-6 w-6 text-success" />}
              trend={{ value: 8, isPositive: true }}
              iconBgClass="bg-success/10"
            />
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
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('fee.collection')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {feeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rs. ${(value / 1000).toFixed(0)}K`} />
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
                  {recentActivities.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      icon={activity.icon}
                      title={activity.title}
                      description={activity.description}
                      time={activity.time}
                      iconBgClass={activity.iconBg}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </div>
    </DashboardLayout>
  );
}
