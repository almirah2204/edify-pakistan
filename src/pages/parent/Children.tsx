import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, Calendar, ClipboardCheck, DollarSign, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function ParentChildren() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Fetch children linked to parent
  const { data: children, isLoading } = useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles!students_id_fkey(full_name, email, avatar_url),
          class:classes(name, section)
        `)
        .eq('parent_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title">My Children / میرے بچے</h1>
              <p className="page-subtitle">View and manage your children's information</p>
            </div>
          </div>
        </SlideIn>

        {/* Children List */}
        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrolled Children
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
              ) : children && children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child: any) => (
                    <div
                      key={child.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{child.profile?.full_name || 'Unknown'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {child.admission_no || 'No admission number'}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {child.class && (
                              <Badge variant="secondary">
                                {child.class.name} {child.class.section && `- ${child.class.section}`}
                              </Badge>
                            )}
                            {child.gender && (
                              <Badge variant="outline">{child.gender}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/parent/attendance?child=${child.id}`}>
                            <ClipboardCheck className="h-4 w-4 me-2" />
                            Attendance
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/parent/fees?child=${child.id}`}>
                            <DollarSign className="h-4 w-4 me-2" />
                            Fees
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/parent/results?child=${child.id}`}>
                            <FileText className="h-4 w-4 me-2" />
                            Results
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/parent/timetable?child=${child.id}`}>
                            <Calendar className="h-4 w-4 me-2" />
                            Timetable
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Children Linked</h3>
                  <p className="text-sm">Contact the school administrator to link your children to your account.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
