// src/components/Guards/AcademyStaffGuard.jsx
// Allows access for both Admin and Mentor users

import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export const AcademyStaffGuard = ({ children }) => {
  const { isAdmin, isAuthentication, profileData } = useContext(UserContext);

  if (!isAuthentication) {
    return <Navigate to="/sign-up?view=login" replace />;
  }

  const isMentor = profileData?.isMentor === true;

  if (!isAdmin && !isMentor) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? children : <Outlet />;
};
