import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Save, FileText, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TeacherResults() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [marks, setMarks] = useState<Record<string, { obtained: string; grade: string }>>({});

  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: students, isLoading: studentsLoading } = useStudents();

  // Fetch exams
  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams', selectedClass],
    queryFn: async () => {
      const query = supabase.from('exams').select('*').order('exam_date', { ascending: false });
      if (selectedClass) query.eq('class_id', selectedClass);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch existing results
  const { data: existingResults } = useQuery({
    queryKey: ['results', selectedExam],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('exam_id', selectedExam);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedExam
  });

  // Save results mutation
  const saveResults = useMutation({
    mutationFn: async (resultsData: any[]) => {
      // Upsert results
      const { error } = await supabase
        .from('results')
        .upsert(resultsData, { onConflict: 'student_id,exam_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('Results saved successfully! / نتائج کامیابی سے محفوظ ہو گئے!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save results');
    }
  });

  const classStudents = students?.filter(s => s.class_id === selectedClass) || [];
  const selectedExamData = exams?.find(e => e.id === selectedExam);

  const calculateGrade = (obtained: number, total: number): string => {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const obtained = parseInt(value) || 0;
    const total = selectedExamData?.total_marks || 100;
    const grade = calculateGrade(obtained, total);
    
    setMarks(prev => ({
      ...prev,
      [studentId]: { obtained: value, grade }
    }));
  };

  const handleSaveResults = async () => {
    if (!selectedExam || !user) {
      toast.error('Please select an exam first');
      return;
    }

    const resultsData = Object.entries(marks)
      .filter(([_, value]) => value.obtained !== '')
      .map(([studentId, value]) => ({
        student_id: studentId,
        exam_id: selectedExam,
        marks_obtained: parseInt(value.obtained) || 0,
        grade: value.grade,
        entered_by: user.id
      }));

    if (resultsData.length === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    await saveResults.mutateAsync(resultsData);
  };

  const getGradeBadgeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-success/20 text-success border-success/30',
      'A': 'bg-success/20 text-success border-success/30',
      'B': 'bg-primary/20 text-primary border-primary/30',
      'C': 'bg-warning/20 text-warning border-warning/30',
      'D': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      'F': 'bg-destructive/20 text-destructive border-destructive/30'
    };
    return colors[grade] || colors.F;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('results.enter')}</h1>
              <p className="page-subtitle">Enter and manage student exam results</p>
            </div>
          </div>
        </SlideIn>

        {/* Filters */}
        <SlideIn delay={0.1}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label className="mb-2 block">Select Class</Label>
                  {classesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedExam(''); }}>
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
                  <Label className="mb-2 block">Select Exam</Label>
                  {examsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an exam" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {exams?.filter(e => !selectedClass || e.class_id === selectedClass).map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name} ({exam.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedExamData && (
                  <div className="flex items-end gap-4">
                    <Badge variant="outline" className="h-10 px-4">
                      Total: {selectedExamData.total_marks} marks
                    </Badge>
                    <Badge variant="outline" className="h-10 px-4">
                      Pass: {selectedExamData.passing_marks} marks
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Results Entry */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Enter Results
              </CardTitle>
              {selectedExam && classStudents.length > 0 && (
                <Button onClick={handleSaveResults} disabled={saveResults.isPending}>
                  <Save className="h-4 w-4 me-2" />
                  {saveResults.isPending ? 'Saving...' : 'Save Results'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedClass || !selectedExam ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Please select a class and exam to enter results</p>
                </div>
              ) : studentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : classStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found in this class
                </div>
              ) : (
                <div className="space-y-3">
                  {classStudents.map((student, index) => {
                    const studentMarks = marks[student.id] || { obtained: '', grade: '' };
                    const existingResult = existingResults?.find((r: any) => r.student_id === student.id);
                    
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.admission_no || `Roll #${index + 1}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-24"
                              placeholder="Marks"
                              value={studentMarks.obtained || existingResult?.marks_obtained || ''}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              max={selectedExamData?.total_marks || 100}
                              min={0}
                            />
                            <span className="text-muted-foreground">/ {selectedExamData?.total_marks || 100}</span>
                          </div>
                          {(studentMarks.grade || existingResult?.grade) && (
                            <Badge 
                              variant="outline" 
                              className={getGradeBadgeColor(studentMarks.grade || existingResult?.grade)}
                            >
                              {studentMarks.grade || existingResult?.grade}
                            </Badge>
                          )}
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
