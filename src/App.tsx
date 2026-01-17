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
import TeacherDashboard from "./pages/teacher/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import ParentDashboard from "./pages/parent/Dashboard";

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
    <Route path="/auth" element={
      <PublicRoute>
        <Auth />
      </PublicRoute>
    } />
    <Route path="/pending-approval" element={<PendingApproval />} />

    {/* Dashboard redirect - sends to role-specific dashboard */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardRedirect />
      </ProtectedRoute>
    } />

    {/* Admin routes */}
    <Route path="/admin/dashboard" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin/*" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />

    {/* Teacher routes */}
    <Route path="/teacher/dashboard" element={
      <ProtectedRoute allowedRoles={['teacher']}>
        <TeacherDashboard />
      </ProtectedRoute>
    } />
    <Route path="/teacher/*" element={
      <ProtectedRoute allowedRoles={['teacher']}>
        <TeacherDashboard />
      </ProtectedRoute>
    } />

    {/* Student routes */}
    <Route path="/student/dashboard" element={
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboard />
      </ProtectedRoute>
    } />
    <Route path="/student/*" element={
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboard />
      </ProtectedRoute>
    } />

    {/* Parent routes */}
    <Route path="/parent/dashboard" element={
      <ProtectedRoute allowedRoles={['parent']}>
        <ParentDashboard />
      </ProtectedRoute>
    } />
    <Route path="/parent/*" element={
      <ProtectedRoute allowedRoles={['parent']}>
        <ParentDashboard />
      </ProtectedRoute>
    } />

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
