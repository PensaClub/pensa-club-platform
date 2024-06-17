import { createContext, useContext, useState, useEffect } from 'react';
import { userServiceFactory } from '../Services/userService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import './error.css';
import { Loader } from '../Loader/Loader';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useLocalStorage('auth', {});
  const [profileData, setProfileData] = useLocalStorage('userDetails', {}); //regionId: '1', municipalityId: '1', settlementId: '1'

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
      console.log(newUser.data.enabled);
      setIsLoading(false);
      if (newUser.data.enabled) {
        const res = await getProfileData();
        console.log(res);
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
      setIsLoading(false);
    } catch (error) {
      setIsAuth({});
      showErrorAndSetTimeouts(error.message);
    }
  };

  const onProfileDataSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await userService.setUserData(data, isAuth.data?.userId);
      const { ...responseData } = response;
      setProfileData(responseData);
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
      const updatedData = response.details;
      if (updatedData) {
        setProfileData(updatedData);
      }
      setIsLoading(false);
      return profileData;
    } catch (error) {
      showErrorAndSetTimeouts(`Error edit profile data: ${error.message}`);
    }
  };

  const getProfileData = async () => {
    try {
      // debugger
      setIsLoading(true);
      
      const response = await userService.getUserData();
      console.log(response.user.details);
      setProfileData(response.user.details);
      console.log(profileData);

      setIsLoading(false);
      return profileData;
    } catch (error) {
      showErrorAndSetTimeouts(`Error get profile data: ${error.message}`);
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
    isFinish: isAuth.data?.enabled,
    // isFinish,
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
