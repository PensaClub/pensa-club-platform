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
  const [isFinish, setIsFinish] = useState(isAuth.data?.enabled);

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
    try {
      setIsLoading(true);
      const response = await userService.register(data);
      const { password, rePassword, ...newUser } = response;
      setIsAuth(newUser);
      setIsFinish(newUser.data.enabled);
      setIsLoading(false);
      navigate('/profile/profile-form');
      notify('success-register');
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onLoginSubmit = async (data) => {
    const { rePassword, ...newData } = data;
    try {
      setIsLoading(true);
      const response = await userService.login(newData);
      setIsAuth(response);
      setIsFinish(response.data.enabled);
      setProfileData(response.data);
      setIsLoading(false);
      notify('success-login');
      console.log('response', response);
      if (response.data.enabled) {
        console.log(response.data);
        const data = await loadAddressData(response.data.details.region, response.data.details.municipality, response.data.details.settlement);
        console.log(data);
        setAddressId({ ...data });
        navigate('/profile');
      } else {
        navigate('/profile/profile-form');
      }
    } catch (error) {
      notify('error');
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onLogout = () => {
    try {
      setIsLoading(true);
      userService.logout();
      setIsAuth({});
      setProfileData({});
      setAddressId({});
      setIsLoading(false);
      notify('success-logout');
    } catch (error) {
      notify('error');
      setIsAuth({});
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onProfileDataSubmit = async (details) => {
    try {
      setIsLoading(true);
      const response = await userService.setUserData(details);
      console.log(response);
      if (response.message === 'No such address was found!') {
        navigate('/profile/profile-form');
        notify('warn-address');
        setIsLoading(false);
        return;
      }
      setProfileData(response.user);
      const data = await loadAddressData(response.user.details.region, response.user.details.municipality, response.user.details.settlement);
      setAddressId({ ...data });
      setIsAuth({
        ...isAuth,
        token: response.token,
        data: {
          ...isAuth.data,
          enabled: true,
        },
      });
      setIsFinish(true).then(navigate('/profile'));
      setIsLoading(false);
      notify('success-data');
    } catch (error) {
      notify('error');
      console.log(error.message);
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onEditProfileDataSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await userService.editUserData(data);
      notify('success-data');
      console.log(response);
      const updatedData = response.details;
      console.log(updatedData);
      console.log(profileData);
      if (updatedData) {
        setProfileData({ ...profileData, details: updatedData });

        const data = await loadAddressData(updatedData.region, updatedData.municipality, updatedData.settlement);
        console.log(data);
        setAddressId({ ...data });

        setIsAuth({
          ...isAuth,
          token: response.token,
          enabled: response.user.enabled,
        });
      }
      setIsLoading(false);
      return updatedData;
    } catch (error) {
      notify('error');
      console.log(error.message);
      showErrorAndSetTimeouts(`Error edit profile data: ${error.message}`);
    }
  };

  const getProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserData();
      if (response) {
        // console.log(response);
        setProfileData(response.user);
        // setIsFinish(response.user.enabled);
      }
      setIsLoading(false);

      // return response;
    } catch (error) {
      showErrorAndSetTimeouts(`Error get profile data: ${error.message}`);
    }
  };

  const onPasswordReset = async (data) => {
    try {
      if (data.tokenType === 'jwt') {
        data.token = isAuth.token;
      }
      setIsLoading(true);
      // console.log({ ...data });
      const response = await userService.resetPassword({ ...data });
      console.log('Password changed');
      setIsLoading(false);
      return response;
    } catch (error) {
      console.log(error.message);
      showErrorAndSetTimeouts(error.message);
    }
  };

  const contextService = {
    onRegisterSubmit,
    onLoginSubmit,
    userId: isAuth.data?.userId,
    userEmail: isAuth.data?.email,
    token: isAuth.token,
    isAuthentication: !!isAuth.token,
    onLogout,
    onPasswordReset,
    // isFinish: isAuth.data?.enabled,
    isFinish,
    onProfileDataSubmit,
    onEditProfileDataSubmit,
    getProfileData,
    profileData,
    addressId,
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
