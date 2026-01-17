import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatCard } from '@/components/common/DashboardWidgets';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { BookOpen, ClipboardCheck, DollarSign, Calendar, FileText, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">Student Dashboard</h1>
              <p className="page-subtitle">
                {t('common.welcome')}, {profile?.full_name || 'Student'} 👋
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
            <StatCard
              title="Attendance"
              value="92%"
              icon={<ClipboardCheck className="h-6 w-6 text-primary" />}
              iconBgClass="bg-primary/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Pending Homework"
              value="3"
              icon={<BookOpen className="h-6 w-6 text-secondary" />}
              iconBgClass="bg-secondary/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Fee Status"
              value="Paid"
              icon={<DollarSign className="h-6 w-6 text-success" />}
              iconBgClass="bg-success/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Upcoming Exams"
              value="2"
              icon={<FileText className="h-6 w-6 text-warning" />}
              iconBgClass="bg-warning/10"
            />
          </StaggerItem>
        </StaggerChildren>

        {/* Quick Actions */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/student/attendance">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <span className="text-sm">My Attendance</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/student/homework">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span className="text-sm">Homework</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/student/results">
                    <FileText className="h-5 w-5 text-success" />
                    <span className="text-sm">My Results</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/student/timetable">
                    <Calendar className="h-5 w-5 text-info" />
                    <span className="text-sm">Timetable</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Notices */}
        <SlideIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning" />
                Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No recent notices
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
