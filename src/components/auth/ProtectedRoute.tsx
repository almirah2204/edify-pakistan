import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/common/DashboardWidgets';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireApproval?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireApproval = false }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingPage />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to user's appropriate dashboard
      const dashboardPath = getRoleDashboard(profile.role);
      return <Navigate to={dashboardPath} replace />;
    }
  }

  // Check if approval is required
  if (requireApproval && profile && !profile.is_approved && profile.role !== 'admin') {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, profile, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingPage />;
  }

  // If authenticated, redirect to appropriate dashboard
  if (user && profile) {
    const dashboardPath = getRoleDashboard(profile.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}

export function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'parent':
      return '/parent/dashboard';
    default:
      return '/dashboard';
  }
}
