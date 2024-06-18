import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { mapServiceFactory } from "../Services/MapService";
import { useAuthContext } from "./UserContext";


export const MapContext = createContext()

export const MapProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [allUsers, setAllUsers] = useState({});


const {token} = useAuthContext()
    const mapService = mapServiceFactory(token)


    const onAllUsers = async ()=>{

        try {
            setIsLoading(true);

            const response = await mapService.allUsers()
            
            setAllUsers(prev =>({...prev, response}))
            setIsLoading(false);
        }catch(e) {

        }
    }






    const contextService = {
        onAllUsers,
        allUsers
    }

    return (
        <MapContext.Provider value={contextService}>
            {children}

            {isLoading && <Loader />}

        </MapContext.Provider>
    )
}

export const useMappingContext = ()=>{
    const context = useContext(MapContext)
    return context
}