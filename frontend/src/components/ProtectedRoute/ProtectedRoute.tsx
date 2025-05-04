import { Navigate } from 'react-router-dom';
import { JSX, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, forceValidateToken } = useAuth();
  
  useEffect(() => {
    forceValidateToken();
  }, [forceValidateToken]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;