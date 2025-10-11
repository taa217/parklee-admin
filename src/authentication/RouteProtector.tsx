// ProtectRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectRouteProps {
  children: React.ReactNode;
}

const ProtectRoute: React.FC<ProtectRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('isauthenticated value in app', isAuthenticated)

  // If the user is not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  console.log('suppoes to show all the children')
  // If the user is logged in, return the protected route content
  return <>{children}</>;
};

export default ProtectRoute;
