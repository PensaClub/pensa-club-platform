import { createContext, useContext, useEffect, useState } from 'react';
import { userServiceFactory } from '../Services/userService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './error.css';
import { Loader } from '../Loader/Loader';
import { loadAddressData } from '../../utils/loadAddressData';
import { notify } from '../../utils/notify';
import { toast } from 'react-toastify';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useLocalStorage('auth', {});
  const [profileData, setProfileData] = useLocalStorage('userDetails', {});
  const [addressId, setAddressId] = useLocalStorage('addressId', {});
  const [isFinish, setIsFinish] = useState(isAuth.enabled);
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
  // eslint-disable-next-line no-unused-vars
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userService = userServiceFactory(isAuth.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileData?.role) {
      setIsAdmin(profileData.role === 'admin');
    }
  }, [profileData, setIsAdmin]);

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.register(data);
      setIsAuth({ token: response.token, email: response.user.email, enabled: response.user.enabled });
      setIsFinish(response.user.enabled);
      setProfileData(response.user);
      setIsAdmin(response.user.role === 'admin');
      navigate('/profile/profile-form');
      notify('success-register');
    } catch (error) {
      notify('error');
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
      setIsAuth({ token: response.token, email: response.user.email, enabled: response.user.enabled });
      setIsFinish(response.user.enabled);
      setProfileData(response.user);
      setIsAdmin(userRole === 'admin');
      notify('success-login');
      if (response.user.enabled) {
        const data = await loadAddressData(response.user.details.region, response.user.details.municipality, response.user.details.settlement);
        setAddressId({ ...data });
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error.message == "Email or password are invalid.") {
        notify('error-authorize')
      } else {
        notify('error');
      }
    
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = () => {
    setIsLoading(true);
    try {
      userService.logout();
      setIsAuth({});
      setProfileData({});
      setAddressId({});
      setIsAdmin(false);
      notify('success-logout');
    } catch (error) {
      notify('error');
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
      setIsFinish(response.user.enabled);
      setIsAuth({ ...isAuth, token: response.token, enabled: response.user.enabled });
      // setIsAdmin(response.user.role === 'admin');
      navigate('/profile');
      notify('success-data');
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
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
      // setIsAdmin(response.user.role === 'admin');

      notify('success-data');
    } catch (error) {
      notify('error');
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
        // setIsAdmin(response.user.role === 'admin');
      }
      return response.user
    } catch (error) {
      notify('error');
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
      // setIsAdmin(response.user.role === 'admin');
      return response;
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
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
      
        localStorage.setItem('userDetails', JSON.stringify(updatedProfileData));
        localStorage.setItem('isAdmin', JSON.stringify(role === 'admin'));
      }
  
      notify('success-role-change to'+ role);
      return response;
    } catch (e) {
      showErrorAndSetTimeouts(`Error changing role: ${e.message}`);
      return toast.error(e.error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onForgetPasswordSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await userService.forgetPassword(data);
      setIsLoading(false);
      notify('email-send');
      return response;
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onSuggestSubmit = async (data) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await userService.suggestUser(data);
      navigate('/');
      notify('success-register');
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isUserAdmin = () => isAdmin;

  const contextService = {
    onRegisterSubmit,
    onLoginSubmit,
    userEmail: isAuth.email,
    token: isAuth.token,
    isAuthentication: !!isAuth.token,
    onLogout,
    onPasswordReset,
    isFinish,
    onProfileDataSubmit,
    onEditProfileDataSubmit,
    getProfileData,
    profileData,
    addressId,
    onForgetPasswordSubmit,
    onSuggestSubmit,
    isUserAdmin,
    isAdmin,
    onChangeAdminRole
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
