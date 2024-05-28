import { createContext, useContext, useState } from "react";
import { userServiceFactory } from "../Services/userService";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import './error.css'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useLocalStorage('auth', {})
    const [errorMessage, setErrorMessage] = useState('');
    console.error("err",errorMessage)
    const userService = userServiceFactory(isAuth.token)

    const navigate = useNavigate()

    const showErrorAndSetTimeouts = (error) => {

        setErrorMessage(error)
        console.log("Setting error message:", error);
        setTimeout(() => {
            setErrorMessage('')
            console.log("Clearing error message");
        }, 4000);
       
    
    }


    const onRegisterSubmit = async (data) => {
        try {
        
            const response = await userService.register(data);
            const {password, rePassword,...newUser} = response
            setIsAuth(newUser)
            navigate('/')
         
        } catch (error) {
            showErrorAndSetTimeouts(error.message)

        }
        
    }

    const onLoginSubmit= async (data) => {
        const{ rePassword, ...newData}= data
        try {
            const response = await userService.login(newData);
            const {password,...newUser} = response
            setIsAuth(newUser)  
            navigate('/')
        } catch (error) {
            showErrorAndSetTimeouts(error.message)


            
        }
   

    }

    const onLogout = () => {
        try {
            userService.logout()
            setIsAuth({})
            localStorage.removeItem("auth");
        } catch (error) {
            showErrorAndSetTimeouts(error.message)


        }
    }

    const contextService = {
        onRegisterSubmit,
        onLoginSubmit,
        userId:isAuth.data?.userId,
        token: isAuth.token,
        isAuthentication: !!isAuth.token,
        onLogout,

    }



    return (
        <UserContext.Provider value={contextService}>
            {children}
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