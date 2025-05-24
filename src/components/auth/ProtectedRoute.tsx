
import { FC, ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user && location.pathname !== '/auth') {
      toast.error('Please sign in to access this page');
    }
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    // Show loading state while auth state is being determined
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on auth page, redirect to auth page
  if (!user && location.pathname !== '/auth') {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated and on auth page, redirect to dashboard
  if (user && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated or on auth page, render children
  return <>{children}</>;
};

export default ProtectedRoute;
