import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { useAuthContext } from "./UserContext";
import { mapServiceFactory } from "../Services/MapService";


export const MapContext = createContext()

export const MapProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [allUsers, setAllUsers] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
console.log(allUsers);
    const { token } = useAuthContext()
    const mapService = mapServiceFactory(token)

    const showErrorAndSetTimeouts = (error) => {

        setErrorMessage(error)
        setIsLoading(false)
        setTimeout(() => {
            setErrorMessage('')
            setIsLoading(false)
        }, 3000);
    }

    const onAllUsers = async () => {

        try {
            setIsLoading(true);
            const response = await mapService.allUsers()
            setAllUsers(prev => ({ ...prev, response }))
            setIsLoading(false);
        } catch (e) {
            showErrorAndSetTimeouts(e.message)
        }
    }


    const contextService = {
        onAllUsers,
        allUsers,
        setAllUsers
    }

    return (
        <MapContext.Provider value={contextService}>
            {children}
            {isLoading && <Loader />}
            {errorMessage && (
                <div className={`error-message show-error custom-style`}>
                    <p>{errorMessage}</p>
                    {console.log("Rendering error message:", errorMessage)}
                </div>
            )}
        </MapContext.Provider>
    )
}

export const useMappingContext = () => {
    const context = useContext(MapContext)
    return context
}