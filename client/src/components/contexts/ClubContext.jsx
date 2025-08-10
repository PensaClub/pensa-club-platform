import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { mockClubsData } from "../Clubs/data/mockClubsData.js";

export const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clubs, setClubs] = useState([]);
  const [clubsLoaded, setClubsLoaded] = useState(false);
  const [currentClub, setCurrentClub] = useState(null);
  const [regionalClubs, setRegionalClubs] = useState([]);
  const { isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  // Симулация на async операция с mock data
  const simulateApiCall = (data, delay = 500) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  };

  const createClub = async (clubData) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да създаде клуб');
      notify('unauthorized-action');
      return;
    }

    try {
      setIsLoading(true);

      // Симулираме API заявка
      const newClub = {
        ...clubData,
        id: `club-${Date.now()}`, // Временно ID
        metadata: {
          ...clubData.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "current-admin", // TODO: вземи от auth context
          isVerified: false,
          isPublic: true,
          views: 0,
          followers: 0
        }
      };

      await simulateApiCall(newClub);

      // Добавяме в локалното състояние
      setClubs(prevClubs => [newClub, ...prevClubs]);
      setIsLoading(false);
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

  const updateClub = async (id, clubData) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да редактира клуб');
      notify('unauthorized-action');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      const updatedClub = {
        ...clubData,
        metadata: {
          ...clubData.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      await simulateApiCall(updatedClub);
      
      // Актуализиране на списъка с клубове
      setClubs(prevClubs => 
        prevClubs.map(club => 
          club.id === id ? updatedClub : club
        )
      );
      
      // Ако редактираме текущо избрания клуб
      if (currentClub && currentClub.id === id) {
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

  const deleteClub = async (id) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да изтрие клуб');
      notify('unauthorized-action');
      return false;
    }
    
    try {
      setIsLoading(true);

      // Симулираме API заявка за изтриване
      await simulateApiCall({ success: true });
      
      // Премахваме от локалното състояние
      setClubs(prevClubs => prevClubs.filter(club => club.id !== id));
      
      // Ако изтриваме текущо избрания клуб
      if (currentClub && currentClub.id === id) {
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

  const searchClubs = async (searchTerm) => {
    try {
      if (!searchTerm.trim()) {
        return clubs;
      }

      const filtered = mockClubsData.filter(club => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return await simulateApiCall(filtered, 200);
    } catch (e) {
      console.error('Грешка при търсене на клубове:', e);
      return [];
    }
  };

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
    // CRUD операции
    createClub,
    getAllClubs,
    getClubBySlug,
    getClubById,
    updateClub,
    deleteClub,
    
    // Регионални функции
    getRegionalClubs,
    getCentralClub,
    
    // Търсене и филтриране
    searchClubs,
    filterClubsByCategory,
    filterClubsByCity,
    getAvailableCities,
    getAvailableCategories,
    
    // Utility функции
    invalidateClubsCache,
    clearCurrentClub,
    
    // State
    clubs,
    currentClub,
    regionalClubs,
    isLoading,
    clubsLoaded,
    errorMessage
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