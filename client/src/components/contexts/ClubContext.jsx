import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { mockClubsData } from "../Clubs/data/mockClubsData.js";
import clubServiceFactory from "../Services/clubServiceFactory.js";

export const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clubs, setClubs] = useState([]);
  const [clubsLoaded, setClubsLoaded] = useState(false);
  const [currentClub, setCurrentClub] = useState(null);
  const [regionalClubs, setRegionalClubs] = useState([]);
  const { isAdmin, user } = useAuthContext(); // 👈 Добавяме user за token
  const navigate = useNavigate();
  const location = useLocation();

  // 🔧 Създаваме clubService инстанция
  const clubService = clubServiceFactory(user?.token);

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  // Симулация на async операция с mock data
  const simulateApiCall = (data, delay = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  };

  // ===============================
  // 🔄 CRUD ОПЕРАЦИИ - АКТУАЛИЗИРАНИ
  // ===============================

  const createClub = async (clubData) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да създаде клуб');
      notify('unauthorized-action');
      return;
    }

    try {
      setIsLoading(true);

      // 🌐 Използваме реалния API
      const newClub = await clubService.createClub(clubData);

      // Добавяме в локалното състояние
      setClubs(prevClubs => [newClub, ...prevClubs]);
      invalidateClubsCache();
      notify('club-created-success');
      navigate('/clubs');
      return newClub;
    } catch (e) {
      console.error('Грешка при създаване на клуб:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 ЗАПАЗВАМЕ СТАРИТЕ МЕТОДИ (mock data)
  const getAllClubs = async (forceRefresh = false) => {
    if (clubs.length > 0 && clubsLoaded && !forceRefresh) {
      return clubs;
    }

    try {
      setIsLoading(true);
      
      // Симулираме API заявка - за сега връщаме mock data
      const fetchedClubs = await simulateApiCall(mockClubsData);
      
      // Сортираме по най-нови първо
      const sortedClubs = fetchedClubs.sort((a, b) => {
        return new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt);
      });
      
      setClubs(sortedClubs);
      setClubsLoaded(true);
      return sortedClubs;
    } catch (e) {
      console.error('Грешка при получаване на клубове:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getClubBySlug = async (slug) => {
    try {
      setIsLoading(true);
      
      // Симулираме API заявка
      const club = mockClubsData.find(club => club.slug === slug);
      
      if (!club) {
        throw new Error('Клубът не беше намерен');
      }

      const fetchedClub = await simulateApiCall(club);
      setCurrentClub(fetchedClub);
      
      // Увеличаваме броя прегледи
      fetchedClub.metadata.views += 1;
      
      return fetchedClub;
    } catch (e) {
      console.error('Грешка при получаване на клуб по slug:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getClubById = async (id) => {
    try {
      setIsLoading(true);
      
      // Симулираме API заявка
      const club = mockClubsData.find(club => club.id === id);
      
      if (!club) {
        throw new Error('Клубът не беше намерен');
      }

      const fetchedClub = await simulateApiCall(club);
      return fetchedClub;
    } catch (e) {
      console.error('Грешка при получаване на клуб по ID:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClub = async (identifier, clubData) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да редактира клуб');
      notify('unauthorized-action');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // 🌐 Използваме реалния API
      const updatedClub = await clubService.updateClub(identifier, clubData);
      
      // Актуализиране на локалното състояние
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club.id === identifier || club.slug === identifier ? updatedClub : club
        )
      );
      
      // Ако редактираме текущо избрания клуб
      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(updatedClub);
      }
      
      invalidateClubsCache();
      notify('club-updated-success');
      return updatedClub;
    } catch (e) {
      console.error('Грешка при редактиране на клуб:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClub = async (identifier) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да изтрие клуб');
      notify('unauthorized-action');
      return false;
    }
    
    try {
      setIsLoading(true);

      // 🌐 Използваме реалния API
      await clubService.deleteClub(identifier);
      
      // Премахваме от локалното състояние
      setClubs(prevClubs => 
        prevClubs.filter(club => club.id !== identifier && club.slug !== identifier)
      );
      
      // Ако изтриваме текущо избрания клуб
      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(null);
      }
      
      invalidateClubsCache();
      notify('club-deleted-success');
      return true;
    } catch (e) {
      console.error('Грешка при изтриване на клуб:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🆕 DRAFT ФУНКЦИОНАЛНОСТИ
  // ===============================

  const saveDraftClub = async (draftData) => {
    try {
      setIsLoading(true);
      const savedDraft = await clubService.saveDraftClub(draftData);
      notify('draft-saved-success');
      return savedDraft;
    } catch (e) {
      console.error('Грешка при запазване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraftClub = async (id, draftData) => {
    try {
      setIsLoading(true);
      const updatedDraft = await clubService.updateDraftClub(id, draftData);
      notify('draft-updated-success');
      return updatedDraft;
    } catch (e) {
      console.error('Грешка при обновяване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllDrafts = async (page = 1, limit = 12) => {
    try {
      setIsLoading(true);
      const drafts = await clubService.getAllDrafts(page, limit);
      return drafts;
    } catch (e) {
      console.error('Грешка при получаване на чернови:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getDraftById = async (id) => {
    try {
      setIsLoading(true);
      const draft = await clubService.getDraftById(id);
      return draft;
    } catch (e) {
      console.error('Грешка при получаване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDraftClub = async (draftId) => {
    try {
      setIsLoading(true);
      await clubService.deleteDraftClub(draftId);
      notify('draft-deleted-success');
      return true;
    } catch (e) {
      console.error('Грешка при изтриване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDraftStatus = async (identifier) => {
    try {
      setIsLoading(true);
      const result = await clubService.toggleDraftStatus(identifier);
      notify('draft-status-changed');
      return result;
    } catch (e) {
      console.error('Грешка при промяна на статус на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🆕 FAVORITES/BOOKMARKS
  // ===============================

  const toggleBookmarkClub = async (slug) => {
    try {
      const result = await clubService.toggleBookmarkClub(slug);
      notify(result.bookmarked ? 'club-bookmarked' : 'club-unbookmarked');
      return result;
    } catch (e) {
      console.error('Грешка при промяна на отметка:', e);
      notify('error', e);
      return false;
    }
  };

  const getAllBookmarkedClubs = async (email) => {
    try {
      const bookmarkedClubs = await clubService.getAllBookmarkedClubs(email);
      return bookmarkedClubs;
    } catch (e) {
      console.error('Грешка при получаване на отметнати клубове:', e);
      notify('error', e);
      return [];
    }
  };

  const getUserClubs = async (email) => {
    try {
      const userClubs = await clubService.getUserClubs(email);
      return userClubs;
    } catch (e) {
      console.error('Грешка при получаване на потребителски клубове:', e);
      notify('error', e);
      return [];
    }
  };

  // ===============================
  // 🆕 ТЪРСЕНЕ И ФИЛТРИРАНЕ
  // ===============================

  const searchClubs = async (searchParams) => {
    try {
      if (!searchParams.query?.trim() && !searchParams.category && !searchParams.city) {
        return clubs;
      }

      const results = await clubService.searchClubs(searchParams);
      return results;
    } catch (e) {
      console.error('Грешка при търсене на клубове:', e);
      return [];
    }
  };

  const getClubsByCategory = async (category, page = 1, limit = 12) => {
    try {
      const results = await clubService.getClubsByCategory(category, page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при филтриране по категория:', e);
      return [];
    }
  };

  const getClubsByRegion = async (region, page = 1, limit = 12) => {
    try {
      const results = await clubService.getClubsByRegion(region, page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при филтриране по регион:', e);
      return [];
    }
  };

  const getClubsByCity = async (city, page = 1, limit = 12) => {
    try {
      const results = await clubService.getClubsByCity(city, page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при филтриране по град:', e);
      return [];
    }
  };

  const getFeaturedClubs = async (limit = 6) => {
    try {
      const results = await clubService.getFeaturedClubs(limit);
      return results;
    } catch (e) {
      console.error('Грешка при получаване на препоръчани клубове:', e);
      return [];
    }
  };

  const getActiveClubs = async (page = 1, limit = 12) => {
    try {
      const results = await clubService.getActiveClubs(page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при получаване на активни клубове:', e);
      return [];
    }
  };

  // ===============================
  // 🆕 MAILING СИСТЕМА
  // ===============================

  const sendContactForm = async (clubId, contactData) => {
    try {
      setIsLoading(true);
      await clubService.sendContactForm(clubId, contactData);
      notify('contact-form-sent');
      return true;
    } catch (e) {
      console.error('Грешка при изпращане на контактна форма:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMembershipApplication = async (clubId, applicationData) => {
    try {
      setIsLoading(true);
      await clubService.sendMembershipApplication(clubId, applicationData);
      notify('membership-application-sent');
      return true;
    } catch (e) {
      console.error('Грешка при кандидатстване за членство:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNewsletter = async (clubId, subscriptionData) => {
    try {
      await clubService.subscribeToNewsletter(clubId, subscriptionData);
      notify('newsletter-subscribed');
      return true;
    } catch (e) {
      console.error('Грешка при абониране за newsletter:', e);
      notify('error', e);
      return false;
    }
  };

  const sendVolunteerApplication = async (clubId, volunteerData) => {
    try {
      setIsLoading(true);
      await clubService.sendVolunteerApplication(clubId, volunteerData);
      notify('volunteer-application-sent');
      return true;
    } catch (e) {
      console.error('Грешка при кандидатстване за доброволчество:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPartnershipInquiry = async (clubId, partnershipData) => {
    try {
      setIsLoading(true);
      await clubService.sendPartnershipInquiry(clubId, partnershipData);
      notify('partnership-inquiry-sent');
      return true;
    } catch (e) {
      console.error('Грешка при запитване за партньорство:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerForEvent = async (clubId, eventId, registrationData) => {
    try {
      setIsLoading(true);
      await clubService.registerForEvent(clubId, eventId, registrationData);
      notify('event-registration-sent');
      return true;
    } catch (e) {
      console.error('Грешка при записване за събитие:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 📌 ЗАПАЗВАМЕ СТАРИТЕ МЕТОДИ (временно)
  // ===============================

  const filterClubsByCategory = async (category) => {
    try {
      if (category === 'all') {
        return clubs;
      }

      const filtered = mockClubsData.filter(club => club.category === category);
      return await simulateApiCall(filtered, 200);
    } catch (e) {
      console.error('Грешка при филтриране по категория:', e);
      return [];
    }
  };

  const filterClubsByCity = async (city) => {
    try {
      if (city === 'all') {
        return clubs;
      }

      const filtered = mockClubsData.filter(club => club.location.city === city);
      return await simulateApiCall(filtered, 200);
    } catch (e) {
      console.error('Грешка при филтриране по град:', e);
      return [];
    }
  };

  const getRegionalClubs = async (clubId) => {
    try {
      setIsLoading(true);
      
      const club = mockClubsData.find(c => c.id === clubId);
      if (!club) {
        throw new Error('Клубът не беше намерен');
      }

      let relatedClubs = [];

      // Ако е централен клуб - взимаме свързаните клубове
      if (club.regionalInfo.isCentralClub && club.regionalInfo.affiliatedClubs.length > 0) {
        relatedClubs = mockClubsData.filter(c => 
          club.regionalInfo.affiliatedClubs.includes(c.id)
        );
      }
      // Ако не е централен - взимаме централния клуб и другите свързани
      else if (club.regionalInfo.centralClubId) {
        const centralClub = mockClubsData.find(c => c.id === club.regionalInfo.centralClubId);
        if (centralClub) {
          relatedClubs = [centralClub];
          // Добавяме и другите свързани клубове
          const otherAffiliated = mockClubsData.filter(c => 
            centralClub.regionalInfo.affiliatedClubs.includes(c.id) && c.id !== clubId
          );
          relatedClubs = [...relatedClubs, ...otherAffiliated];
        }
      }

      const fetchedClubs = await simulateApiCall(relatedClubs);
      setRegionalClubs(fetchedClubs);
      return fetchedClubs;
    } catch (e) {
      console.error('Грешка при получаване на регионални клубове:', e);
      showErrorAndSetTimeouts(e.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getCentralClub = async (region) => {
    try {
      const centralClub = mockClubsData.find(club => 
        club.regionalInfo.isCentralClub && 
        club.location.region === region
      );

      if (centralClub) {
        return await simulateApiCall(centralClub);
      }
      return null;
    } catch (e) {
      console.error('Грешка при намиране на централен клуб:', e);
      return null;
    }
  };

  const getAvailableCities = () => {
    const cities = [...new Set(mockClubsData.map(club => club.location.city))];
    return cities.sort();
  };

  const getAvailableCategories = () => {
    const categories = [...new Set(mockClubsData.map(club => club.category))];
    return categories.sort();
  };

  const invalidateClubsCache = () => {
    setClubsLoaded(false);
  };

  const clearCurrentClub = () => {
    setCurrentClub(null);
  };

  // Context service обект
  const contextService = {
    // ===============================
    // ОСНОВНИ CRUD ОПЕРАЦИИ
    // ===============================
    createClub,
    getAllClubs,           // 📌 Mock data (запазен)
    getClubBySlug,         // 📌 Mock data (запазен)
    getClubById,           // 📌 Mock data (запазен)
    updateClub,            // 🌐 API
    deleteClub,            // 🌐 API
    
    // ===============================
    // DRAFT ФУНКЦИОНАЛНОСТИ
    // ===============================
    saveDraftClub,         // 🆕 API
    updateDraftClub,       // 🆕 API
    getAllDrafts,          // 🆕 API
    getDraftById,          // 🆕 API
    deleteDraftClub,       // 🆕 API
    toggleDraftStatus,     // 🆕 API

    // ===============================
    // FAVORITES/BOOKMARKS
    // ===============================
    toggleBookmarkClub,    // 🆕 API
    getAllBookmarkedClubs, // 🆕 API
    getUserClubs,          // 🆕 API

    // ===============================
    // ТЪРСЕНЕ И ФИЛТРИРАНЕ
    // ===============================
    searchClubs,           // 🌐 API (обновен)
    getClubsByCategory,    // 🆕 API
    getClubsByRegion,      // 🆕 API
    getClubsByCity,        // 🆕 API
    getFeaturedClubs,      // 🆕 API
    getActiveClubs,        // 🆕 API
    
    // 📌 Запазени методи (временно)
    filterClubsByCategory, // 📌 Mock data
    filterClubsByCity,     // 📌 Mock data

    // ===============================
    // MAILING СИСТЕМА
    // ===============================
    sendContactForm,           // 🆕 API
    sendMembershipApplication, // 🆕 API
    subscribeToNewsletter,     // 🆕 API
    sendVolunteerApplication,  // 🆕 API
    sendPartnershipInquiry,    // 🆕 API
    registerForEvent,          // 🆕 API
    
    // ===============================
    // РЕГИОНАЛНИ ФУНКЦИИ
    // ===============================
    getRegionalClubs,      // 📌 Mock data (запазен)
    getCentralClub,        // 📌 Mock data (запазен)
    
    // ===============================
    // UTILITY ФУНКЦИИ
    // ===============================
    getAvailableCities,    // 📌 Mock data (запазен)
    getAvailableCategories,// 📌 Mock data (запазен)
    invalidateClubsCache,
    clearCurrentClub,
    
    // ===============================
    // STATE
    // ===============================
    clubs,
    currentClub,
    regionalClubs,
    isLoading,
    clubsLoaded,
    errorMessage,

    // ===============================
    // 🆕 ДИРЕКТЕН ДОСТЪП ДО SERVICE
    // ===============================
    clubService // За директни повиквания когато е нужно
  };

  // Страници с lazy loading (където не показваме loader)
  const pagesWithLazyLoading = ['/clubs', '/club'];
  const shouldShowLoader = isLoading && !pagesWithLazyLoading.some(page => 
    location.pathname.includes(page)
  );

  return (
    <ClubContext.Provider value={contextService}>
      {children}
      {shouldShowLoader && <Loader />}
    </ClubContext.Provider>
  );
};

export const useClubContext = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClubContext must be used within a ClubProvider');
  }
  return context;
};