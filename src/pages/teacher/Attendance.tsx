import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Check, X, Clock, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance, useMarkAttendance } from '@/hooks/useAttendance';
import type { Student } from '@/hooks/useStudents';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export default function TeacherAttendance() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});

  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: existingAttendance } = useAttendance(selectedClass || undefined, format(selectedDate, 'yyyy-MM-dd'));
  const markAttendance = useMarkAttendance();

  // Filter students by selected class
  const classStudents = students?.filter(s => s.class_id === selectedClass) || [];

  // Initialize attendance records from existing data
  useState(() => {
    if (existingAttendance) {
      const records: Record<string, AttendanceStatus> = {};
      existingAttendance.forEach((a: any) => {
        records[a.student_id] = a.status as AttendanceStatus;
      });
      setAttendanceRecords(records);
    }
  });

  const toggleAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'present' : status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !user) {
      toast.error('Please select a class first');
      return;
    }

    const attendanceData = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: selectedClass,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status,
      marked_by: user.id
    }));

    if (attendanceData.length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    try {
      await markAttendance.mutateAsync(attendanceData);
      toast.success('Attendance saved successfully! / حاضری کامیابی سے محفوظ ہو گئی!');
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const styles = {
      present: 'bg-success/20 text-success border-success/30',
      absent: 'bg-destructive/20 text-destructive border-destructive/30',
      late: 'bg-warning/20 text-warning border-warning/30',
      leave: 'bg-info/20 text-info border-info/30'
    };
    return styles[status] || styles.present;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('attendance.mark')}</h1>
              <p className="page-subtitle">Mark student attendance for your classes</p>
            </div>
          </div>
        </SlideIn>

        {/* Filters */}
        <SlideIn delay={0.1}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Select Class</label>
                  {classesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {classes?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} {cls.section && `- ${cls.section}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Student List */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Students</CardTitle>
              {selectedClass && classStudents.length > 0 && (
                <Button onClick={handleSaveAttendance} disabled={markAttendance.isPending}>
                  <Save className="h-4 w-4 me-2" />
                  {markAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedClass ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a class to mark attendance
                </div>
              ) : studentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : classStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found in this class
                </div>
              ) : (
                <div className="space-y-3">
                  {classStudents.map((student, index) => {
                    const currentStatus = attendanceRecords[student.id] || 'present';
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.admission_no || `ID: ${student.id.slice(0, 8)}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={currentStatus === 'present' ? 'default' : 'outline'}
                            className={cn(currentStatus === 'present' && 'bg-success hover:bg-success/90')}
                            onClick={() => toggleAttendance(student.id, 'present')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'absent' ? 'default' : 'outline'}
                            className={cn(currentStatus === 'absent' && 'bg-destructive hover:bg-destructive/90')}
                            onClick={() => toggleAttendance(student.id, 'absent')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'late' ? 'default' : 'outline'}
                            className={cn(currentStatus === 'late' && 'bg-warning hover:bg-warning/90')}
                            onClick={() => toggleAttendance(student.id, 'late')}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Badge variant="outline" className={getStatusBadge(currentStatus)}>
                            {currentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
