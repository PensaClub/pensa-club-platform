import { createContext, useContext, useState } from 'react';
import { userServiceFactory } from '../Services/userService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './error.css';
import { Loader } from '../Loader/Loader';
import { loadAddressData } from '../../utils/loadAddressData';
import { notify } from '../../utils/notify';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useLocalStorage('auth', {});
  const [profileData, setProfileData] = useLocalStorage('userDetails', {});
  const [addressId, setAddressId] = useLocalStorage('addressId', {});
  const [isFinish, setIsFinish] = useState(isAuth.enabled);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userService = userServiceFactory(isAuth.token);

  const navigate = useNavigate();

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
      setIsAuth({ token: response.token, email: response.user.email, enabled: response.user.enabled });
      setIsFinish(response.user.enabled);
      setProfileData(response.user);
      notify('success-login');
      if (response.user.enabled) {
        const data = await loadAddressData(response.user.details.region, response.user.details.municipality, response.user.details.settlement);
        setAddressId({ ...data });
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      
      notify('error');
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
      }
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
      return response;
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onForgetPasswordSubmit =async(data)=>{

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
  }
  const contextService = {
    onRegisterSubmit,
    onLoginSubmit,
    // Server doesn`t send userId for now !
    // userId: isAuth.data?.userId,
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
  };

  return (
    <UserContext.Provider value={contextService}>
      {children}
      {isLoading && <Loader />}
      {/* {errorMessage && (
          <div className={`error-message show-error custom-style`}>
            <p>{errorMessage}</p>
            {console.log('Rendering error message:', errorMessage)}
          </div>
        )} */}
    </UserContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(UserContext);

  return context;
};
