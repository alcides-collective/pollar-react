import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  fallbackPath = '/',
}: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const location = useLocation();

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-content-heading" />
      </div>
    );
  }

  // Not authenticated - redirect and open auth modal
  if (!isAuthenticated) {
    // Open auth modal after redirect
    setTimeout(() => openAuthModal('login'), 100);
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
