import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTE_PATHS, type RouteAccess } from '../config';

interface AccessGuardProps {
  access?: RouteAccess;
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export default function AccessGuard({ access = 'public', isAuthenticated, children }: AccessGuardProps) {
  const location = useLocation();

  if (access === 'auth' && !isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace state={{ from: location }} />;
  }

  if (access === 'guest' && isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.root} replace />;
  }

  return <>{children}</>;
}
