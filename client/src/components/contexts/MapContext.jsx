import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { mapServiceFactory } from "../Services/mapService";
import { useAuthContext } from "./UserContext";


export const MapContext = createContext()

export const MapProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [allusers, setAllUsers] = useState();


const {token} = useAuthContext()
    const mapService = mapServiceFactory(token)


    const onAllUsers = async ()=>{

        try {
            setIsLoading(true);

            const response = await mapService.allUsers()
            
            setAllUsers(response)
        }catch(e) {

        }
    }






    const contextService = {

    }

    return (
        <MapContext.Provider value={contextService}>
            {isLoading && <Loader />}

        </MapContext.Provider>
    )
}

export const useMappingContext = ()=>{
    const context = useContext(MapContext)
    return context
}