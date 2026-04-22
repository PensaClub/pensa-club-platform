/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import "./error.css";
import { communityServiceFactory } from "../Services/communityService";
import { notify } from "../../utils/notify.jsx";
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
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
    const navigate = useLocalizedNavigate();

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

    const subscribeNewUser = async (username, email, source) => {
        try {
            setIsLoading(true);
            const response = await communityService.subscribeNewUser(username, email, source);
            setIsLoading(false);
            if (response?.alreadySubscribed) {
                return response;
            }
            notify("email-send");
            return response;
        } catch (e) {
            if (e?.statusCode === 429) {
                notify('error', { message: e.message });
            } else {
                notify('error', e);
            }
            showErrorAndSetTimeouts(e.message);
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
    const deleteSubscriber = async (id) => {
        try {
            const response = await communityService.deleteSubscriber(id);
            await getSubscribeEmails();
            return response;
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getPreferencesByToken = async (token) => {
        try {
            return await communityService.getPreferencesByToken(token);
        } catch (e) {
            throw e;
        }
    };
    const updatePreferences = async (token, preferences) => {
        try {
            const response = await communityService.updatePreferences(token, preferences);
            notify('email-send');
            return response;
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const unsubscribeByToken = async (token) => {
        try {
            return await communityService.unsubscribeByToken(token);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };

    // ===== Newsletters (admin) =====
    const getAdminNewsletters = async (params) => {
        try {
            return await communityService.getAdminNewsletters(params);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getAdminNewsletterStats = async () => {
        try {
            return await communityService.getAdminNewsletterStats();
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getNewsletterStatsOverview = async (opts = {}) => {
        try {
            return await communityService.getNewsletterStatsOverview(opts);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getAdminNewsletterById = async (id) => {
        try {
            return await communityService.getAdminNewsletterById(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const deleteNewsletter = async (id) => {
        try {
            return await communityService.deleteNewsletter(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const duplicateNewsletter = async (id) => {
        try {
            return await communityService.duplicateNewsletter(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const cancelScheduledNewsletter = async (id) => {
        try {
            return await communityService.cancelScheduledNewsletter(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const createNewsletter = async (data) => {
        try {
            return await communityService.createNewsletter(data);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const updateNewsletter = async (id, data) => {
        try {
            return await communityService.updateNewsletter(id, data);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const scheduleNewsletter = async (id, scheduledAt) => {
        try {
            return await communityService.scheduleNewsletter(id, scheduledAt);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const searchNewsletterContent = async (type, query, limit) => {
        try {
            return await communityService.searchNewsletterContent(type, query, limit);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const previewNewsletter = async (data) => {
        try {
            return await communityService.previewNewsletter(data);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getNewsletterRecipientCount = async (categories) => {
        try {
            return await communityService.getNewsletterRecipientCount(categories);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const sendTestNewsletter = async (id, to) => {
        try {
            return await communityService.sendTestNewsletter(id, to);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const sendNewsletterNow = async (id) => {
        try {
            return await communityService.sendNewsletterNow(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getNewsletterStats = async (id) => {
        try {
            return await communityService.getNewsletterStats(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getAdminSubscriberList = async (params) => {
        try {
            return await communityService.getAdminSubscriberList(params);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getAdminSubscriberStats = async () => {
        try {
            return await communityService.getAdminSubscriberStats();
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getAdminSubscriberGrowth = async (opts = {}) => {
        try {
            return await communityService.getAdminSubscriberGrowth(opts);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };

    // Cron settings
    const getAdminCrons = async () => {
        try {
            return await communityService.getAdminCrons();
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const updateAdminCron = async (key, payload) => {
        try {
            return await communityService.updateAdminCron(key, payload);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };

    // Email template
    const getAdminEmailTemplate = async () => {
        try {
            return await communityService.getAdminEmailTemplate();
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const updateAdminEmailTemplate = async (payload) => {
        try {
            return await communityService.updateAdminEmailTemplate(payload);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const blockSubscriber = async (id) => {
        try {
            return await communityService.blockSubscriber(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const unblockSubscriber = async (id) => {
        try {
            return await communityService.unblockSubscriber(id);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const updateSubscriberPreferencesByAdmin = async (id, preferences) => {
        try {
            return await communityService.updateSubscriberPreferencesByAdmin(id, preferences);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    // Token-based public access (used by /subscribe/preferences/:token + /subscribe/unsubscribe/:token pages)
    const getSubscriberPreferences = async (token) => {
        try {
            return await communityService.getSubscriberPreferences(token);
        } catch (e) {
            throw e; // Don't notify — page handles its own error UI
        }
    };
    const updateSubscriberPreferences = async (token, preferences) => {
        try {
            return await communityService.updateSubscriberPreferences(token, preferences);
        } catch (e) {
            throw e;
        }
    };
    const unsubscribeWithToken = async (token) => {
        try {
            return await communityService.unsubscribeWithToken(token);
        } catch (e) {
            throw e;
        }
    };

    const exportSubscribersCsvUrl = () => communityService.exportSubscribersCsvUrl();
    const exportSubscribersPdfUrl = (params) => communityService.exportSubscribersPdfUrl(params);
    const sendPersonalNewsletter = async (subscriberId, payload) => {
        try {
            return await communityService.sendPersonalNewsletter(subscriberId, payload);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getEventBatchPreview = async () => {
        try {
            return await communityService.getEventBatchPreview();
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const runEventBatchNow = async () => {
        try {
            return await communityService.runEventBatchNow();
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getMonthlyReportPreview = async (opts = {}) => {
        try {
            return await communityService.getMonthlyReportPreview(opts);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const runMonthlyReportNow = async (opts = {}) => {
        try {
            return await communityService.runMonthlyReportNow(opts);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const getNewsletterQueue = async (status) => {
        try {
            return await communityService.getNewsletterQueue(status);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const addNewsletterQueueItem = async (payload) => {
        try {
            return await communityService.addNewsletterQueueItem(payload);
        } catch (e) {
            notify('error', e);
            throw e;
        }
    };
    const deleteNewsletterQueueItem = async (id) => {
        try {
            return await communityService.deleteNewsletterQueueItem(id);
        } catch (e) {
            notify('error', e);
            throw e;
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
        subscribeEmails,
        deleteSubscriber,
        getPreferencesByToken,
        updatePreferences,
        unsubscribeByToken,
        getAdminNewsletters,
        getAdminNewsletterStats,
        getNewsletterStatsOverview,
        getAdminNewsletterById,
        deleteNewsletter,
        duplicateNewsletter,
        cancelScheduledNewsletter,
        createNewsletter,
        updateNewsletter,
        scheduleNewsletter,
        searchNewsletterContent,
        previewNewsletter,
        getNewsletterRecipientCount,
        sendTestNewsletter,
        sendNewsletterNow,
        getNewsletterStats,
        getAdminSubscriberList,
        getAdminSubscriberStats,
        getAdminSubscriberGrowth,
        getAdminCrons,
        updateAdminCron,
        getAdminEmailTemplate,
        updateAdminEmailTemplate,
        blockSubscriber,
        unblockSubscriber,
        updateSubscriberPreferencesByAdmin,
        exportSubscribersCsvUrl,
        exportSubscribersPdfUrl,
        getSubscriberPreferences,
        updateSubscriberPreferences,
        unsubscribeWithToken,
        sendPersonalNewsletter,
        getEventBatchPreview,
        runEventBatchNow,
        getMonthlyReportPreview,
        runMonthlyReportNow,
        getNewsletterQueue,
        addNewsletterQueueItem,
        deleteNewsletterQueueItem,
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
