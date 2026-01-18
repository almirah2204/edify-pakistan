import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, FileText, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function StudentResults() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const { data: results, isLoading } = useQuery({
    queryKey: ['results', 'student', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          exam:exams(name, subject, total_marks, passing_marks, exam_date, exam_type)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

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

  const downloadMarksheet = (result: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PakSchool ERP', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Result Card / نتائج کارڈ', 105, 30, { align: 'center' });
    
    // Student Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${profile?.full_name || 'N/A'}`, 20, 50);
    doc.text(`Exam: ${result.exam?.name || 'N/A'}`, 20, 60);
    doc.text(`Subject: ${result.exam?.subject || 'N/A'}`, 20, 70);
    doc.text(`Date: ${result.exam?.exam_date ? format(new Date(result.exam.exam_date), 'PPP') : 'N/A'}`, 20, 80);
    
    // Results
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Results', 20, 100);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Marks Obtained: ${result.marks_obtained || 0} / ${result.exam?.total_marks || 100}`, 20, 115);
    doc.text(`Grade: ${result.grade || 'N/A'}`, 20, 125);
    doc.text(`Status: ${(result.marks_obtained || 0) >= (result.exam?.passing_marks || 33) ? 'PASS' : 'FAIL'}`, 20, 135);
    
    if (result.remarks) {
      doc.text(`Remarks: ${result.remarks}`, 20, 150);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 280);
    
    doc.save(`result_${result.exam?.name || 'marksheet'}.pdf`);
    toast.success('Marksheet downloaded! / مارک شیٹ ڈاؤنلوڈ ہو گئی!');
  };

  // Calculate overall performance
  const overallStats = results ? {
    totalExams: results.length,
    passed: results.filter((r: any) => (r.marks_obtained || 0) >= (r.exam?.passing_marks || 33)).length,
    avgPercentage: results.length > 0 
      ? (results.reduce((acc: number, r: any) => acc + ((r.marks_obtained || 0) / (r.exam?.total_marks || 100)) * 100, 0) / results.length).toFixed(1)
      : '0'
  } : { totalExams: 0, passed: 0, avgPercentage: '0' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('results.my')}</h1>
              <p className="page-subtitle">View your exam results / اپنے امتحانی نتائج دیکھیں</p>
            </div>
          </div>
        </SlideIn>

        {/* Stats */}
        <SlideIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.totalExams}</p>
                    <p className="text-sm text-muted-foreground">Total Exams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.passed}</p>
                    <p className="text-sm text-muted-foreground">Passed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.avgPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SlideIn>

        {/* Results List */}
        <SlideIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Exam Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result: any) => {
                    const percentage = ((result.marks_obtained || 0) / (result.exam?.total_marks || 100)) * 100;
                    const passed = (result.marks_obtained || 0) >= (result.exam?.passing_marks || 33);
                    
                    return (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
                            <Award className={`h-6 w-6 ${passed ? 'text-success' : 'text-destructive'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{result.exam?.name || 'Exam'}</h4>
                            <p className="text-sm text-muted-foreground">{result.exam?.subject}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {result.marks_obtained || 0} / {result.exam?.total_marks || 100}
                              </Badge>
                              <Badge variant="outline" className={getGradeBadgeColor(result.grade || 'F')}>
                                {result.grade || 'N/A'}
                              </Badge>
                              <Badge variant={passed ? 'default' : 'destructive'}>
                                {passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => downloadMarksheet(result)}>
                          <Download className="h-4 w-4 me-2" />
                          Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No results available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
