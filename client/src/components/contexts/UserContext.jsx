import { createContext, useContext, useState, useEffect } from 'react';
import { userServiceFactory } from '../Services/userService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './error.css';
import { Loader } from '../Loader/Loader';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useLocalStorage('auth', {});
  const [profileData, setProfileData] = useLocalStorage('userDetails', {});
  const [isFinish, setIsFinish] = useState(isAuth.data?.enabled);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userService = userServiceFactory(isAuth.token);

  const navigate = useNavigate();

  // useEffect(() => {
  //   getProfileData();
  // }, [isAuth.data.token]);

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
    } catch (error) {
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onLoginSubmit = async (data) => {
    const { rePassword, ...newData } = data;
    try {
      setIsLoading(true);

      const response = await userService.login(newData);
      const { password, ...newUser } = response;
      setIsAuth(newUser);
      setIsFinish(newUser.data.enabled);
      setIsLoading(false);
      if (newUser.data.enabled) {
        const res = await getProfileData();
        // console.log(res);
        navigate('/profile');
      } else {
        navigate('/profile/profile-form');
      }
    } catch (error) {
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onLogout = () => {
    try {
      setIsLoading(true);
      userService.logout();
      setIsAuth({});
      localStorage.removeItem('auth');
      localStorage.removeItem('userDetails');
      localStorage.removeItem('fullData');
      setIsLoading(false);
    } catch (error) {
      setIsAuth({});
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onProfileDataSubmit = async (data) => {
    try {
      const filledData = data;
      setIsLoading(true);
      const response = await userService.setUserData(data);
      console.log(response);
      if (response.message === 'No such address was found!') {
        navigate('/profile/profile-form');
        setIsLoading(false);
        return [response.message, filledData];
      }
      setProfileData(response.user);
      setIsAuth({
        ...isAuth,
        token: response.token,
        email: response.user.email,
        enabled: response.user.enabled,
      });
      setIsFinish(true);
      // setIsFinish(true);
      setIsLoading(false);
    } catch (error) {
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onEditProfileDataSubmit = async (data) => {
    // console.log(data);
    try {
      setIsLoading(true);
      const response = await userService.editUserData(data);
      console.log(response);
      const updatedData = response.details;
      console.log(updatedData);
      if (updatedData) {
        setProfileData({...profileData, details: updatedData});
        setIsAuth({
          ...isAuth,
          token: response.token,
          email: response.user.email,
          enabled: response.user.enabled,
        });
      }
      setIsLoading(false);
      return updatedData;
    } catch (error) {
      showErrorAndSetTimeouts(`Error edit profile data: ${error.message}`);
    }
  };

  const getProfileData = async () => {
    try {
      // debugger
      setIsLoading(true);

      const response = await userService.getUserData();
      setProfileData(response.user);
      setIsFinish(response.user.enabled);
      // console.log(profileData);

      setIsLoading(false);
      return response;
    } catch (error) {
      showErrorAndSetTimeouts(`Error get profile data: ${error.message}`);
    }
  };

  const onPasswordReset = async (data) => {
    try {
      const resetToken = isAuth.token;
      setIsLoading(true);
      console.log({ ...data, resetToken });
      const response = await userService.resetPassword({ ...data, resetToken });
      console.log('Password changed');
      setIsLoading(false);
    } catch (error) {
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
