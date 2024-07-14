import { createContext, useContext, useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import './error.css';
import { communityServiceFactory } from "../Services/communityService";
import { notify } from '../../utils/notify';

export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [errorMessage, setErrorMessage] = useState('');
    const [regions , setRegions] = useState([])
    const [subregions , setSubregions] = useState({})
    const [townsSearch, setTownsSearch] = useState({});
    const [searchCriteria, setSearchCriteria] = useState([]);
    const communityService= communityServiceFactory();

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
    const TownSearch = async (subregionId) => {
        try {
            setIsLoading(true);
            const response = await communityService.getTowns(subregionId);
            setTownsSearch(prev => ({ ...prev, [subregionId]: response }));
            setIsLoading(false);
        } catch (e) {
            showErrorAndSetTimeouts(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSearchCriteria = async () => {
        try {
            setIsLoading(true);
            const response = await communityService.getSearchCriteria()
            setSearchCriteria(response)
            setIsLoading(false);
        } catch (e) {
            showErrorAndSetTimeouts(e.message)
        } finally {
            setIsLoading(false);
        }
    
    }
    const createAd = async (adData) => {
        try {
            setIsLoading(true);
            const response = await communityService.createAd(adData);
            setIsLoading(false);
            notify('success-created')
            return response;
        } catch (e) {
            notify('error')

            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }

    const getMyAds = async (email) => {
        try {
            setIsLoading(true);
            const response = await communityService.getMyAds(email);
            setIsLoading(false);
            notify('success-created')
            return response;
        } catch (e) {
            notify('error')

            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };
    const searchAds = async (filters) => {
        try {
            setIsLoading(true);
            const response = await communityService.searchAds(filters);
            setIsLoading(false);
            return response;
        } catch (e) {
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        fetchRegions();
        fetchSearchCriteria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextService = {
     fetchRegions ,
        fetchSubregions ,
        regions,
        subregions,
        searchCriteria,
        isLoading,
        fetchSearchCriteria,
        createAd,
        getMyAds,
        searchAds,
        TownSearch,
        townsSearch
    }
    
    return (

        <CommunityContext.Provider value={contextService}>
            {children}
            {isLoading && <Loader />}

            {/* {errorMessage && (
                <div className={`error-message show-error custom-style`}>
                    <p>{errorMessage}</p>
                    {console.log("Rendering error message:", errorMessage)}
                </div>
            )} */}
        </CommunityContext.Provider>
    )
}

export const useCommunityContext = () => {
    const context =useContext(CommunityContext)
    return context
}