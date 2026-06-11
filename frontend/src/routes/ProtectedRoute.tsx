import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import Loader from '@/components/common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, initialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
