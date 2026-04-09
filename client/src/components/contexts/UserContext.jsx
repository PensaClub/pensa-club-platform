/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from 'react';
import { userServiceFactory } from '../Services/userService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import './error.css';
import { Loader } from '../Loader/Loader';
import { loadAddressData } from '../../utils/loadAddressData';
import { notify } from '../../utils/notify.jsx';
import { toast } from 'react-toastify';
import { getAuthStatus, setAuthStatusUpdater } from '../../utils/handle401Error';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useLocalStorage('auth', {});
  const [profileData, setProfileData] = useLocalStorage('userDetails', {});
  const [addressId, setAddressId] = useLocalStorage('addressId', {});
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
  const [isModerator, setIsModerator] = useLocalStorage('isModerator', false);
  const [isMentor, setIsMentor] = useLocalStorage('isMentor', false);  // ✅ ДОБАВИ
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(getAuthStatus());
  const userService = userServiceFactory(isAuth.token);
  const [redirectPath, setRedirectPath] = useLocalStorage('redirectPath', null);
  
  const navigate = useLocalizedNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated && location.pathname.startsWith('/profile')) {
      setIsAuth({});
      setRedirectPath(location.pathname + location.search);
      navigate('/sign-up');
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    const excludePaths = ['/sign-up', '/login', '/forget-password', '/reset-password', '/contact'];
    const shouldExclude = excludePaths.some(path => location.pathname.includes(path));

    if (!isAuthenticated && !shouldExclude && location.pathname !== '/' && location.pathname !== '/redirecting') {
      setRedirectPath(location.pathname + location.search);
    }
  }, [isAuthenticated, location, setRedirectPath]);

  useEffect(() => {
    if (profileData?.role) {
      setIsAdmin(profileData.role === 'admin');
      setIsModerator(profileData.role === 'moderator');
      setIsMentor(profileData.isMentor === true);  // ✅ ДОБАВИ
    }
  }, [profileData, setIsAdmin, setIsModerator, setIsMentor]);  // ✅ ДОБАВИ setIsMentor

  useEffect(() => {
    setAuthStatusUpdater(() => {
      setIsAuthenticated(false);
    });
  }, []);

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };
  
  const handleAuthChange = (newAuthData) => {
    if (newAuthData && newAuthData.token) {
      setIsAuth(newAuthData);
      setIsAuthenticated(true);
      localStorage.setItem('auth', JSON.stringify(newAuthData));
    } else {
      setIsAuth({});
      setIsAuthenticated(false);
      localStorage.removeItem('auth');
    }
  };

  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.register(data);
      handleAuthChange({ token: response.token, email: response.user.email, enabled: response.user.enabled });
      
      // Добавяме default снимка след регистрацията
      const defaultImage = "data:image/svg+xml;base64," + btoa(`
        <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="150" height="150" fill="#cccccc"/>
          <text x="75" y="80" font-family="Arial" font-size="40" fill="#666" text-anchor="middle">User</text>
        </svg>
      `);
      
      const userWithDefaults = {
        ...response.user, 
        details: {
          ...(response.user.details || {}),
          imageURL: response.user.details?.imageURL || defaultImage
        }
      };
      
      setProfileData(userWithDefaults);
      setIsAdmin(response.user.role === 'admin');
      setIsMentor(response.user.isMentor === true);  // ✅ ДОБАВИ
      navigate('/profile/data');
      notify('success-register');
    } catch (error) {
      notify(error.message === 'User already exists with this email.' ? 'user-already-exists' : 'error');
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.login(data);
      const userRole = response.user.role;
      handleAuthChange({ token: response.token, email: response.user.email, enabled: response.user.enabled });
      setProfileData(response.user);
      setIsAdmin(userRole === 'admin');
      setIsModerator(userRole === 'moderator');
      setIsMentor(response.user.isMentor === true);  // ✅ ДОБАВИ
      notify('success-login');

      if (response.user.enabled) {
        const data = await loadAddressData(response.user.details.region, response.user.details.municipality, response.user.details.settlement);
        setAddressId({ ...data });

        // Провери дали има запазена страница за redirect
        if (redirectPath) {
          const pathToNavigate = redirectPath;
          setRedirectPath(null); 
          navigate(pathToNavigate);
        } else {
          navigate('/'); // Default redirect
        }
      } else {
        navigate('/profile/profile-form');
      }

    } catch (error) {
      if (error.message === 'Email or password are invalid.') {
        notify('error-authorize');
        return error.message;
      } else {
        notify('error', error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const setRedirectAfterLogin = (path) => {
    setRedirectPath(path);
  };

  const onLogout = async () => {
    setIsLoading(true);
    try {
      await userService.logout();
      setIsAuth({});
      setProfileData({});
      setAddressId({});
      setIsAdmin(false);
      setIsModerator(false);
      setIsMentor(false);  // ✅ ДОБАВИ
      setIsAuthenticated(false);
      localStorage.removeItem("contactRecaptchaToken");
      notify('success-logout');
    } catch (error) {
      notify('error', error);
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileDataSubmit = async (details) => {
    setIsLoading(true);
    try {
      const response = await userService.setUserData(details);

      if (response.message === 'No such address was found!') {
        navigate('/profile/profile-form');
        notify('warn-address');
        return;
      }
      const data = await loadAddressData(response.user.details.region, response.user.details.municipality, response.user.details.settlement);
      setAddressId({ ...data });
      setProfileData(response.user);
      setIsAuth({ ...isAuth, token: response.token, enabled: response.user.enabled });
      notify('success-data');
    } catch (error) {
      const isUsernameTaken =
        error?.message === "Unique constraint violation." && error?.details.some(error => error.field === 'username');

      notify(isUsernameTaken ? 'username-is-taken' : 'error', error);
      showErrorAndSetTimeouts(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onEditProfileDataSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.editUserData(data);
      const responseDetails = response.details;
      if (responseDetails) {
        setProfileData({ ...profileData, details: responseDetails });
        const data = await loadAddressData(responseDetails.region, responseDetails.municipality, responseDetails.settlement);
        setAddressId({ ...data });
      }
      notify('success-data');
    } catch (error) {
      notify('error', error);
      showErrorAndSetTimeouts(`Error edit profile data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUserData();
      if (response) {
        setProfileData(response.user);
        setIsMentor(response.user.isMentor === true);  // ✅ ДОБАВИ
      }
      return response.user;
    } catch (error) {
      notify('error', error);
      showErrorAndSetTimeouts(`Error get profile data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordReset = async (data) => {
    setIsLoading(true);
    try {
      if (data.tokenType === 'jwt') {
        data.token = isAuth.token;
      }
      setIsLoading(true);
      const response = await userService.resetPassword({ ...data });
      setIsLoading(false);
      notify('success-password-change');
      return response;
    } catch (error) {
      if (error?.message === 'Old and new password are the same.') notify('password-change-same-passwords');
      else if (error?.message === 'Old password is invalid.') notify('password-change-old-invalid');
      else if (error?.message === 'Repeat password does not match.') notify('password-change-repeat-invalid');
      else notify('error', error);

      showErrorAndSetTimeouts(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const onChangeAdminRole = async (mail, role, comment) => {
    setIsLoading(true);
    try {
      const response = await userService.changeRole(mail, role, comment);

      // Ако променяме текущияя потребител, обновяваме localStorage
      if (mail === isAuth.email) {
        const updatedProfileData = { ...profileData, role };
        setProfileData(updatedProfileData);
        setIsAdmin(role === 'admin');
        setIsModerator(role === 'moderator');
        // ✅ ДОБАВИ: Запазваме isMentor ако вече е ментор
        // (role change не трябва автоматично да премахва isMentor статуса)

        localStorage.setItem('userDetails', JSON.stringify(updatedProfileData));
        localStorage.setItem('isAdmin', JSON.stringify(role === 'admin'));
        localStorage.setItem('isModerator', JSON.stringify(role === 'moderator'));
      }

      notify('success-role-change to' + role);
      return response;
    } catch (e) {
      notify('error', e);
      showErrorAndSetTimeouts(`Error changing role: ${e.message}`);
      return toast.error(e.error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  //                    GUEST INVITATION
  // =========================================================

  const getInvitation = async (token) => {
    try {
      const response = await userService.getInvitation(token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const acceptInvitation = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.acceptInvitation(data);
      // Auto-login — same pattern as onLoginSubmit
      handleAuthChange({ token: response.token, email: response.user.email, enabled: response.user.enabled });
      setProfileData(response.user);
      setIsAdmin(response.user.role === 'admin');
      setIsModerator(response.user.role === 'moderator');
      setIsMentor(response.user.isMentor === true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onForgetPasswordSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await userService.forgetPassword(data);
      notify('email-send');
      return response;
    } catch (error) {
      if (error?.message === 'There is no user registered with that email address.') {
        notify('password-change-email-invalid');
        throw error;
      } else notify('error', error);

      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSuggestSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.suggestUser(data);
      navigate('/');
      notify('success-register');
    } catch (error) {
      notify('error', error);
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendContactForm = async (data) => {
    setIsLoading(true);
    try {
      const { name, email, subject, message, recaptchaToken } = data;
      const response = await userService.sendContactForm({
        name,
        email,
        subject,
        message,
        recaptchaToken
      });

      notify('contact-form-success');
      return response;
    } catch (error) {
      notify('error', error);
      showErrorAndSetTimeouts(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onProjectApplicationSubmit = async (applicationData) => {
    setIsLoading(true);
    try {
      const response = await userService.applyToProject(applicationData);
      
      const appliedProjects = JSON.parse(localStorage.getItem('appliedProjects') || '[]');
      const newApplication = {
        projectId: applicationData.projectId,
        email: isAuth.email,
        timestamp: Date.now(),
        applicationId: response.id || response.application?.id
      };
      
      appliedProjects.push(newApplication);
      localStorage.setItem('appliedProjects', JSON.stringify(appliedProjects));
      
      notify('application-success');
      return {
        success: true,
        message: response.message || 'Кандидатурата е изпратена успешно',
        application: response.application || response
      };
    } catch (error) {
      notify('error', error);
      showErrorAndSetTimeouts(`Error submitting application: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // USER NOTIFICATIONS
  // ===============================
  const getUserNotifications = async (params = {}) => {
    try {
      const data = await userService.getUserNotifications(params);
      return data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await userService.markNotificationAsRead(notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await userService.markAllNotificationsAsRead();
      toast.success('Всички нотификации са маркирани като прочетени');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Грешка при маркиране на нотификации');
      return false;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await userService.deleteNotification(notificationId);
      toast.success('Нотификацията е изтрита');
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Грешка при изтриване на нотификация');
      return false;
    }
  };

  const isUserAdmin = () => isAdmin;

  const contextService = {
    onRegisterSubmit,
    onLoginSubmit,
    userEmail: isAuth.email,
    username: profileData?.details?.username,
    token: isAuth.token,
    isAuthentication: isAuthenticated && !!isAuth.token,
    onLogout,
    onPasswordReset,
    isFinish: !!profileData?.enabled,
    onProfileDataSubmit,
    onEditProfileDataSubmit,
    getProfileData,
    profileData,
    addressId,
    onForgetPasswordSubmit,
    getInvitation,
    acceptInvitation,
    onSuggestSubmit,
    isUserAdmin,
    isAdmin,
    isModerator,
    isMentor,  
    onChangeAdminRole,
    sendContactForm,
    setProfileData,
    // ✅ USER NOTIFICATIONS
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    setRedirectAfterLogin,
    redirectPath,
    setUser: (user) => {
      setProfileData(user);
      if (user.role) {
        setIsAdmin(user.role === 'admin');
        setIsModerator(user.role === 'moderator');
      }
      if (user.isMentor !== undefined) {  // ✅ ДОБАВИ
        setIsMentor(user.isMentor === true);
      }
    },
    setIsAuthenticated: (value) => {
      setIsAuthenticated(value);
    },
    handleAuthChange,
    hasPassword: !!profileData?.hasPassword,
    onProjectApplicationSubmit
  };

  return (
    <UserContext.Provider value={contextService}>
      {children}
      {isLoading && <Loader />}
    </UserContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(UserContext);
  return context;
};