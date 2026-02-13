import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { useClasses } from '@/hooks/useClasses';
import { useStudentsByClass } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FileText, Download, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

function useStudentResults(studentId: string) {
  return useQuery({
    queryKey: ['student-results', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          exam:exams(name, subject, total_marks, passing_marks, exam_type)
        `)
        .eq('student_id', studentId);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export default function ReportCardsPage() {
  const { data: classes } = useClasses();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const { data: students, isLoading: studentsLoading } = useStudentsByClass(selectedClass);
  const { data: results, isLoading: resultsLoading } = useStudentResults(selectedStudent);

  const selectedStudentData = students?.find(s => s.id === selectedStudent);

  const generatePDF = () => {
    if (!results || !selectedStudentData) return;

    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Report Card', 105, y, { align: 'center' });
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${selectedStudentData.profile?.full_name || 'N/A'}`, margin, y);
    y += 6;
    doc.text(`Class: ${selectedStudentData.class?.name || 'N/A'} ${selectedStudentData.class?.section || ''}`, margin, y);
    y += 6;
    doc.text(`Admission No: ${selectedStudentData.admission_no || 'N/A'}`, margin, y);
    y += 6;
    doc.text(`Father: ${selectedStudentData.father_name || 'N/A'}`, margin, y);
    y += 10;

    // Table header
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.rect(margin, y, 170, 8, 'F');
    doc.text('Subject', margin + 2, y + 5.5);
    doc.text('Exam', margin + 50, y + 5.5);
    doc.text('Total', margin + 100, y + 5.5);
    doc.text('Obtained', margin + 120, y + 5.5);
    doc.text('Grade', margin + 145, y + 5.5);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    let totalMarks = 0;
    let totalObtained = 0;

    results.forEach((r: any, i: number) => {
      if (i % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, 170, 7, 'F');
      }
      doc.text(r.exam?.subject || '-', margin + 2, y + 5);
      doc.text(r.exam?.name || '-', margin + 50, y + 5);
      doc.text((r.exam?.total_marks || 0).toString(), margin + 100, y + 5);
      doc.text((r.marks_obtained || 0).toString(), margin + 120, y + 5);
      doc.text(r.grade || '-', margin + 145, y + 5);
      totalMarks += r.exam?.total_marks || 0;
      totalObtained += r.marks_obtained || 0;
      y += 7;
    });

    // Summary
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${totalObtained} / ${totalMarks}`, margin, y);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : '0';
    doc.text(`Percentage: ${percentage}%`, margin + 80, y);

    doc.save(`report-card-${selectedStudentData.profile?.full_name || 'student'}.pdf`);
    toast.success('Report card downloaded!');
  };

  const totalMarks = results?.reduce((sum: number, r: any) => sum + (r.exam?.total_marks || 0), 0) || 0;
  const totalObtained = results?.reduce((sum: number, r: any) => sum + (r.marks_obtained || 0), 0) || 0;
  const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : '0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                Report Cards / رپورٹ کارڈ
              </h1>
              <p className="page-subtitle">Generate and print student report cards</p>
            </div>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudent(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {classes?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} {c.section ? `- ${c.section}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
                    <SelectTrigger><SelectValue placeholder={studentsLoading ? 'Loading...' : 'Select Student'} /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {students?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.profile?.full_name || 'Unknown'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {selectedStudent && (
          <SlideIn delay={0.2}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedStudentData?.profile?.full_name || 'Student'} — Report Card</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Class: {selectedStudentData?.class?.name} {selectedStudentData?.class?.section || ''} | Adm #: {selectedStudentData?.admission_no || 'N/A'}
                    </p>
                  </div>
                  <Button onClick={generatePDF} disabled={!results || results.length === 0}>
                    <Download className="h-4 w-4 me-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : !results || results.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No exam results found for this student</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">Obtained</TableHead>
                            <TableHead className="text-center">Passing</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((r: any) => {
                            const passed = (r.marks_obtained || 0) >= (r.exam?.passing_marks || 0);
                            return (
                              <TableRow key={r.id}>
                                <TableCell className="font-medium">{r.exam?.subject || '-'}</TableCell>
                                <TableCell>{r.exam?.name || '-'}</TableCell>
                                <TableCell><Badge variant="outline">{r.exam?.exam_type || '-'}</Badge></TableCell>
                                <TableCell className="text-center">{r.exam?.total_marks || 0}</TableCell>
                                <TableCell className="text-center font-semibold">{r.marks_obtained || 0}</TableCell>
                                <TableCell className="text-center">{r.exam?.passing_marks || 0}</TableCell>
                                <TableCell><Badge>{r.grade || '-'}</Badge></TableCell>
                                <TableCell>
                                  {passed ? (
                                    <Badge className="bg-success/10 text-success">Pass</Badge>
                                  ) : (
                                    <Badge variant="destructive">Fail</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 p-4 rounded-lg bg-muted flex items-center justify-between flex-wrap gap-4">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Marks</p>
                          <p className="text-xl font-bold">{totalObtained} / {totalMarks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Percentage</p>
                          <p className="text-xl font-bold">{percentage}%</p>
                        </div>
                      </div>
                      <Badge className={parseFloat(percentage) >= 50 ? 'bg-success/10 text-success text-lg px-4 py-1' : 'bg-destructive/10 text-destructive text-lg px-4 py-1'}>
                        {parseFloat(percentage) >= 80 ? 'A+' : parseFloat(percentage) >= 70 ? 'A' : parseFloat(percentage) >= 60 ? 'B' : parseFloat(percentage) >= 50 ? 'C' : 'F'}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </SlideIn>
        )}
      </div>
    </DashboardLayout>
  );
}
