// src/components/Guards/MentorGuard.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';

export const MentorGuard = ({ children }) => {
  const { isAuthentication, profileData } = useAuthContext();

  // Проверка дали е logged in
  if (!isAuthentication) {
    return <Navigate to="/sign-up?view=login" replace />;
  }

  // Проверка дали е Admin или Mentor
  const isAdmin = profileData?.role === 'admin';
  
  const isMentor = profileData?.isMentor === true;
  
  // Блокирай достъпа ако не е нито Admin, нито Mentor
  if (!isAdmin && !isMentor) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};