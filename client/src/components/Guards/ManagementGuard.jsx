import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { useContext } from 'react';

export const ManagementGuard = ({ children }) => {
  const { isAdmin, isModerator, isAuthentication } = useContext(UserContext);

  if (!isAuthentication) {
    return <Navigate to="/sign-up" />;
  }

  if (!isAdmin && !isModerator) {
    return <Navigate to="/access-denied" />;
  }

  return children ? children : <Outlet />;
};
