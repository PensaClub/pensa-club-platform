/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import "./error.css";
import { communityServiceFactory } from "../Services/communityService";
import { notify } from "../../utils/notify.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {

    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [errorMessage, setErrorMessage] = useState('');
    const [regions, setRegions] = useState([]);
    const [subregions, setSubregions] = useState({});
    const [townsSearch, setTownsSearch] = useState({});
    const [towns, setTowns] = useState({});
    const [searchCriteria, setSearchCriteria] = useState([]);
    const [subscribeEmails, setSubscribeEmails] = useState([]); 
    const [ads, setAds] = useState({ result: [], page: 1, hasMore: true });
    const communityService = communityServiceFactory();
    const navigate = useNavigate();

    const showErrorAndSetTimeouts = (error) => {
        setErrorMessage(error);
        setIsLoading(false);
        setTimeout(() => {
            setErrorMessage('');
            setIsLoading(false);
        }, 3000);
    };

    const fetchRegions = async () => {
        try {
            setIsLoading(true);
            const response = await communityService.getRegions();
            setRegions(response);
            setIsLoading(false);
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubregions = async (regionId) => {
        try {
            setIsLoading(true);
            const response = await communityService.getSubregions(regionId);
            setSubregions(prev => ({ ...prev, [regionId]: response }));
            setIsLoading(false);
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const TownSearch = async (subregionId) => {
        try {
            setIsLoading(true);
            const response = await communityService.getTowns(subregionId);
            setTownsSearch(prev => ({ ...prev, [subregionId]: response }));
            setIsLoading(false);
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTowns = async (regionId, subregionId) => {
        try {
            setIsLoading(true);
            const response = await communityService.getTowns(regionId, subregionId);
            setIsLoading(false);
            return response;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            setIsLoading(false);
            return [];
        }
    };

    const fetchSearchCriteria = async () => {
        try {
            setIsLoading(true);
            const response = await communityService.getSearchCriteria();
            setSearchCriteria(response);
            setIsLoading(false);
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const createAd = async (adData) => {
        try {
            setIsLoading(true);
            const response = await communityService.createAd(adData);
            setIsLoading(false);
            notify('success-created');
            navigate('/');
            return response;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            return toast.error(e.error);

        } finally {
            setIsLoading(false);
        }
    };

    const getMyAds = async (email) => {
        try {
            setIsLoading(true);
            const response = await communityService.getMyAds(email);
            setIsLoading(false);
            return response;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };
  const getLatestAds = async () => {
    try {
      setIsLoading(true);
      const response = await communityService.getLatestAds(3);
      setIsLoading(false);
      return response;
    } catch (e) {
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
  const getAdById = async (id) => {
    try {
      setIsLoading(true);
      const response = await communityService.getAdById(id);
      setIsLoading(false);
      return response;
    } catch (e) {
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
    const deleteAd = async (ad) => {
        try {
            setIsLoading(true);
            const response = await communityService.deleteAd(ad);
            setIsLoading(false);
            notify('success-delete-ads');
            return response;
        } catch (e) {
            notify('error', e);
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

   const editAd = async (adData) => {
    try {
      setIsLoading(true);
      const response = await communityService.editAd(adData);
      setIsLoading(false);
      notify("success-edit-ads");
      return response;
    } catch (e) {
      notify('error', e);

      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
    const searchAds = async (filters, page = 1, limit = 10) => {
        try {
            setIsLoading(true);
            const response = await communityService.searchAds(filters, page, limit);
            setIsLoading(false);
            return response;
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreAds = async (filters, page) => {
        try {
            setIsLoading(true);
            const response = await communityService.searchAds(filters, page);
            setIsLoading(false);
    
            if (response.result.length > 0) {
                setAds(prev => ({
                    result: [...prev.result, ...response.result],
                    page: page,
                    hasMore: response.result.length > 0
                }));
            } else {
                setAds(prev => ({ ...prev, hasMore: false }));
            }
        } catch (e) {
            notify('error', e)
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };    

    const updateExpirationDate = async (adId) => {
        try {
            setIsLoading(true);
            const response = await communityService.updateExpirationDate(adId);
            setIsLoading(false);
            return response;
        } catch (e) {
            notify('error', e);
            showErrorAndSetTimeouts(e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeNewUser = async (username, email) => {
        try {
            setIsLoading(true);
            const response = await communityService.subscribeNewUser(username, email);
            setIsLoading(false);  
            notify("email-send")    
             return response;
        } catch (e) {
            if(e?.message ==="Subscriber already exists.") 
                notify('subscriber-exists');
            else if (e?.message === "Username must be between 3 and 16 characters long." )
                notify('subscribe-username-length');
            else if (e?.message === "Username must start with a letter, can only contain letters, numbers, and underscores" )
                notify('subscribe-username-content');
            else 
                notify('error', e);
            showErrorAndSetTimeouts(e.message);
            // throw e;
        } finally {
            setIsLoading(false);
        }
    }
    const getSubscribeEmails = async () => {
        try {
            setIsLoading(true);
            const response = await communityService.getSubscribeEmails();
            setIsLoading(false);
            setSubscribeEmails(response.subscribers);
            return response.subscribers;
        } catch (e) {
            notify('error');
            showErrorAndSetTimeouts(e.message);
    
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchRegions();
        fetchSearchCriteria();
    }, []);
    const contextService = {
        fetchRegions,
        fetchSubregions,
        fetchTowns,
        regions,
        subregions,
        towns,
        searchCriteria,
        isLoading,
        createAd,
        getMyAds,
        deleteAd,
        editAd,
        setTowns,
        fetchSearchCriteria,
        searchAds,
        TownSearch,
        townsSearch,
        updateExpirationDate,
        ads,
        loadMoreAds,
        setAds,
        getLatestAds,
        getAdById,
        subscribeNewUser,
        getSubscribeEmails,
        subscribeEmails
    };

    return (
        <CommunityContext.Provider value={contextService}>
            {children}
            {isLoading && <Loader />}
        </CommunityContext.Provider>
    );

}
export const useCommunityContext = () => {
  const context = useContext(CommunityContext);
  return context;
};
