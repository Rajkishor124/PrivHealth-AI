import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import toast from 'react-hot-toast';
import type { Role } from '@/types/auth';

interface RoleProtectedRouteProps {
  roles: Role[];
  children: React.ReactNode;
}

export default function RoleProtectedRoute({ roles, children }: RoleProtectedRouteProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Doctor with non-approved status trying to access doctor routes
  if (user.role === 'DOCTOR' && user.staffStatus !== 'APPROVED' && roles.includes('DOCTOR')) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!roles.includes(user.role)) {
    toast.error("You don't have access to that page");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
