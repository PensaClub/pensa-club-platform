// src/components/Guards/MentorGuard.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';

export const MentorGuard = () => {
  const { isAuthentication, profileData } = useAuthContext();

  // Проверка дали е logged in
  if (!isAuthentication) {
    return <Navigate to="/sign-up?view=login" replace />;
  }

  // Проверка дали е Admin или Mentor
  const isAdmin = profileData?.role === 'admin';
  
  // ✅ TODO: Добави проверка за isMentor когато го добавиш в backend
  // Когато backend-ът е готов, активирай този ред:
  // const isMentor = profileData?.isMentor === true;
  
  // ⚠️ ВРЕМЕННО: Само админите имат достъп до Mentor Dashboard
  // Когато добавиш isMentor в backend, промени тази логика
  const isMentor = false; // Обнови на: profileData?.isMentor === true
  
  // Блокирай достъпа ако не е нито Admin, нито Mentor
  if (!isAdmin && !isMentor) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};