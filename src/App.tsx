import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute, getRoleDashboard } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PendingApproval from "./pages/PendingApproval";

// Role-specific dashboards
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminFees from "./pages/admin/Fees";
import AdminFeeStructures from "./pages/admin/FeeStructures";
import AdminGenerateFees from "./pages/admin/GenerateFees";
import AdminReceivePayment from "./pages/admin/ReceivePayment";
import AdminFeeReports from "./pages/admin/FeeReports";
import AdminLateFineSettings from "./pages/admin/LateFineSettings";
import AdminClasses from "./pages/admin/Classes";
import AdminUsers from "./pages/admin/Users";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherHomework from "./pages/teacher/Homework";
import TeacherResults from "./pages/teacher/Results";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentResults from "./pages/student/Results";
import StudentFees from "./pages/student/Fees";
import ParentDashboard from "./pages/parent/Dashboard";
import ParentChildren from "./pages/parent/Children";

const queryClient = new QueryClient();

// Smart redirect component based on user role
function DashboardRedirect() {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (profile) {
    return <Navigate to={getRoleDashboard(profile.role)} replace />;
  }
  
  return <Navigate to="/auth" replace />;
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
    <Route path="/pending-approval" element={<PendingApproval />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

    {/* Admin routes */}
    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
    <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachers /></ProtectedRoute>} />
    <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin']}><AdminFees /></ProtectedRoute>} />
    <Route path="/admin/fee-structures" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeeStructures /></ProtectedRoute>} />
    <Route path="/admin/generate-fees" element={<ProtectedRoute allowedRoles={['admin']}><AdminGenerateFees /></ProtectedRoute>} />
    <Route path="/admin/receive-payment" element={<ProtectedRoute allowedRoles={['admin']}><AdminReceivePayment /></ProtectedRoute>} />
    <Route path="/admin/fee-reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeeReports /></ProtectedRoute>} />
    <Route path="/admin/late-fine-settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminLateFineSettings /></ProtectedRoute>} />
    <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><AdminClasses /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

    {/* Teacher routes */}
    <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
    <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAttendance /></ProtectedRoute>} />
    <Route path="/teacher/homework" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherHomework /></ProtectedRoute>} />
    <Route path="/teacher/results" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherResults /></ProtectedRoute>} />
    <Route path="/teacher/*" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />

    {/* Student routes */}
    <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
    <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>} />
    <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />
    <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><StudentFees /></ProtectedRoute>} />
    <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

    {/* Parent routes */}
    <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
    <Route path="/parent/children" element={<ProtectedRoute allowedRoles={['parent']}><ParentChildren /></ProtectedRoute>} />
    <Route path="/parent/*" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />

    {/* Catch-all 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
