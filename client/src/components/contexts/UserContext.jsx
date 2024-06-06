import { createContext, useContext, useState } from "react";
import { userServiceFactory } from "../Services/userService";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import './error.css'
import { Loader } from "../Loader/Loader";

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useLocalStorage('auth', {});
    const [isFinish, setIsFinish] = useState(isAuth.data?.enabled); //TODO: check if ok
    
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState('');

    const userService = userServiceFactory(isAuth.token)

    const navigate = useNavigate()

    const showErrorAndSetTimeouts = (error) => {

        setErrorMessage(error)
        setIsLoading(false)
        setTimeout(() => {
            setErrorMessage('')
            setIsLoading(false)
        }, 3000);

    }


    const onRegisterSubmit = async (data) => {
        try {
            setIsLoading(true);
            const response = await userService.register(data);
            const { password, rePassword, ...newUser } = response
            setIsAuth(newUser)
            setIsLoading(false);
            navigate('/')

        } catch (error) {
            showErrorAndSetTimeouts(error.message)

        }

    }

    const onLoginSubmit = async (data) => {
        const { rePassword, ...newData } = data
        try {
            setIsLoading(true);

            const response = await userService.login(newData);
            const { password, ...newUser } = response
            setIsAuth(newUser)
            setIsLoading(false);
            navigate('/')
        } catch (error) {
            showErrorAndSetTimeouts(error.message)

        }
    }

    const onLogout = () => {
        try {
            setIsLoading(true);
            userService.logout()
            setIsAuth({})
            localStorage.removeItem("auth");
            setIsLoading(false);

        } catch (error) {
            setIsAuth({})
            showErrorAndSetTimeouts(error.message)


        }
    }

    const onProfileDataSubmit = async (data) => {
    
        console.log(data);

        try {
            setIsLoading(true);
            const response = await userService.setUserData(data, isAuth.data?.userId);
            const { ...responseData } = response;
            setProfileData(responseData);
            setIsFinish(true);
            setIsLoading(false);

        } catch (error) {
            showErrorAndSetTimeouts(error.message)

        }
    }

    const onEditProfileDataSubmit = async (data) => {
    
        console.log(data);

        try {
            setIsLoading(true);
            const response = await userService.editUserData(data, isAuth.data?.userId);
            const { ...responseData } = response;
            setProfileData(responseData);
            setIsLoading(false);

        } catch (error) {
            showErrorAndSetTimeouts(error.message)

        }
    }

    const getProfileData = async (userId) => {
        try {
            setIsLoading(true);
            const response = await userService.getUserData(userId);
            const {...userData} = response;
            setProfileData(userData);
            setIsLoading(false);
            
        } catch (error) {
            showErrorAndSetTimeouts(error.message)
        }
    }

    const contextService = {
        onRegisterSubmit,
        onLoginSubmit,
        userId: isAuth.data?.userId,
        token: isAuth.token,
        isAuthentication: !!isAuth.token,
        onLogout,
        // isFinish: isAuth.data?.enabled,
        isFinish,
        onProfileDataSubmit,
        onEditProfileDataSubmit,
        getProfileData,
        profileData
    }



    return (
        <UserContext.Provider value={contextService}>
            {children}
            {isLoading && <Loader />}
            {errorMessage && (
                <div className={`error-message show-error custom-style`}>
                    <p>{errorMessage}</p>
                    {console.log("Rendering error message:", errorMessage)}
                </div>
            )}
        </UserContext.Provider>
    )

}



export const useAuthContext = () => {
    const context = useContext(UserContext);

    return context;
};