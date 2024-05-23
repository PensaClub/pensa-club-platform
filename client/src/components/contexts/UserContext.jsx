import { createContext, useContext } from "react";
import { userServiceFactory } from "../Services/userService";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";


export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useLocalStorage('auth', {})
    const userService = userServiceFactory(isAuth.token)

    const navigate = useNavigate()




    const onRegisterSubmit = async (data) => {
        try {
        
            const response = await userService.register(data);
            const {password, rePassword,...newUser} = response
            setIsAuth(newUser)
            navigate('/')
         
        } catch (error) {
            console.log(error.message)

        }
        
    }

    const onLoginSubmit= async (data) => {
        try {
            const response = await userService.login(data);
            const {password,...newUser} = response
            setIsAuth(newUser)  
            navigate('/')
        } catch (error) {
            console.log(error.message)

            
        }
   

    }

    const onLogout = () => {
        try {
            userService.logout()
            setIsAuth({})
            localStorage.removeItem("auth");
        } catch (error) {
           console.log(error.message)

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
        </UserContext.Provider>
    )

}



export const useAuthContext = () => {
    const context = useContext(UserContext);

    return context;
};