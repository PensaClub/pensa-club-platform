import { createContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import './error.css';


export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const showErrorAndSetTimeouts = (error) => {

        setErrorMessage(error)
        setIsLoading(false)
        setTimeout(() => {
            setErrorMessage('')
            setIsLoading(false)
        }, 3000);
    }

    const contextService = {

    }
    
    return (

        <CommunityContext.Provider value={contextService}>
            {children}
            {isLoading && <Loader />}

            {errorMessage && (
                <div className={`error-message show-error custom-style`}>
                    <p>{errorMessage}</p>
                    {console.log("Rendering error message:", errorMessage)}
                </div>
            )}
        </CommunityContext.Provider>
    )
}

