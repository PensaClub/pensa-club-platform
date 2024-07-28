
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { useContext } from 'react';

export const AdminGuard = ({ children }) => {
  const { isAdmin, isAuthentication } = useContext(UserContext);

  if (!isAuthentication) {
    return <Navigate to="/sign-up" />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" />;
  }

  return children ? children : <Outlet />;
};