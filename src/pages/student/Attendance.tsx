import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn, StaggerChildren, StaggerItem } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAttendanceByStudent, useAttendanceStats } from '@/hooks/useAttendance';

export default function StudentAttendance() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const { data: attendance, isLoading } = useAttendanceByStudent(user?.id || '');
  const { data: stats } = useAttendanceStats(undefined, undefined, undefined);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'late':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: 'bg-success/20 text-success border-success/30',
      absent: 'bg-destructive/20 text-destructive border-destructive/30',
      late: 'bg-warning/20 text-warning border-warning/30',
      leave: 'bg-info/20 text-info border-info/30'
    };
    return styles[status] || styles.present;
  };

  // Calculate personal stats from attendance data
  const personalStats = attendance ? {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
  } : { total: 0, present: 0, absent: 0, late: 0 };

  const attendancePercentage = personalStats.total > 0 
    ? ((personalStats.present / personalStats.total) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('attendance.my')}</h1>
              <p className="page-subtitle">View your attendance record / اپنی حاضری دیکھیں</p>
            </div>
          </div>
        </SlideIn>

        {/* Stats */}
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StaggerItem>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-success">{personalStats.present}</p>
                  <p className="text-sm text-muted-foreground mt-1">Present Days</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-destructive">{personalStats.absent}</p>
                  <p className="text-sm text-muted-foreground mt-1">Absent Days</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-warning">{personalStats.late}</p>
                  <p className="text-sm text-muted-foreground mt-1">Late Days</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerChildren>

        {/* Attendance History */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : attendance && attendance.length > 0 ? (
                <div className="space-y-2">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <p className="font-medium">{format(new Date(record.date), 'EEEE, MMMM dd, yyyy')}</p>
                          {record.remarks && (
                            <p className="text-sm text-muted-foreground">{record.remarks}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusBadge(record.status)}>
                        {record.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
