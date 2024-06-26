import { createContext, useContext, useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import './error.css';
import { communityServiceFactory } from "../Services/communityService";


export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [regions , setRegions] = useState([])
    const [subregions , setSubregions] = useState({})

    const communityService= communityServiceFactory()

    const showErrorAndSetTimeouts = (error) => {

        setErrorMessage(error)
        setIsLoading(false)
        setTimeout(() => {
            setErrorMessage('')
            setIsLoading(false)
        }, 3000);
    }

    const fetchRegions  = async () => {

        try {
            setIsLoading(true);
            const response = await communityService.getRegions()
            setRegions(response)
            setIsLoading(false);
        } catch (e) {
            showErrorAndSetTimeouts(e.message)
        } finally {
            setIsLoading(false);
        }
    }

    const fetchSubregions  = async (regionId) => {

        try {
            setIsLoading(true);
            const response = await communityService.getSubregions(regionId)
            setSubregions(prev => ({ ...prev, [regionId]: response }));
            setIsLoading(false);
        } catch (e) {
            showErrorAndSetTimeouts(e.message)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchRegions();
    }, []);

    const contextService = {
        fetchRegions ,
        fetchSubregions ,
        regions,
        subregions
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

export const useCommunityContext = () => {
    const context =useContext(CommunityContext)
    return context
}