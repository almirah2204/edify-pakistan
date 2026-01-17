import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatCard } from '@/components/common/DashboardWidgets';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { Users, ClipboardCheck, BookOpen, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useClasses } from '@/hooks/useClasses';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { data: classes, isLoading } = useClasses();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">Teacher Dashboard</h1>
              <p className="page-subtitle">
                {t('common.welcome')}, {profile?.full_name || 'Teacher'} 👋
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

        {/* Stats Grid */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <StatCard
                title="My Classes"
                value={classes?.length?.toString() || '0'}
                icon={<Users className="h-6 w-6 text-primary" />}
                iconBgClass="bg-primary/10"
              />
            )}
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Today's Classes"
              value="4"
              icon={<Calendar className="h-6 w-6 text-secondary" />}
              iconBgClass="bg-secondary/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Pending Homework"
              value="3"
              icon={<BookOpen className="h-6 w-6 text-info" />}
              iconBgClass="bg-info/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Attendance Today"
              value="Pending"
              icon={<ClipboardCheck className="h-6 w-6 text-warning" />}
              iconBgClass="bg-warning/10"
            />
          </StaggerItem>
        </StaggerChildren>

        {/* Quick Actions */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/teacher/attendance">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <span className="text-sm">Mark Attendance</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/teacher/homework">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span className="text-sm">Assign Homework</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/teacher/results">
                    <FileText className="h-5 w-5 text-success" />
                    <span className="text-sm">Enter Results</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/teacher/timetable">
                    <Calendar className="h-5 w-5 text-info" />
                    <span className="text-sm">View Timetable</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* My Classes */}
        <SlideIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : classes && classes.length > 0 ? (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">{cls.section || 'No section'}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/teacher/class/${cls.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No classes assigned yet
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
