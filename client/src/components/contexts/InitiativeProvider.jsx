import { createContext, useContext, useState } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { initiativeServiceFactory } from "../Services/initiativeServiceFactory";
import mockData from '../Initiatives/data/mockInitiatives.json';

export const InitiativeContext = createContext();

export const InitiativeProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initiatives, setInitiatives] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initiativesLoaded, setInitiativesLoaded] = useState(false);
  const { isAdmin } = useAuthContext();
  const navigate = useNavigate();
  
  const initiativeService = initiativeServiceFactory();

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  // Временна функция за симулация на API със страниране
  const getMockInitiatives = async (page = 1, limit = 6) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = mockData.initiatives.slice(startIndex, endIndex);
        
        resolve({
          data: paginatedData,
          hasMore: endIndex < mockData.initiatives.length,
          totalCount: mockData.initiatives.length,
          currentPage: page
        });
      }, 200); 
    });
  };

  const getAllInitiatives = async (page = 1, forceRefresh = false) => {
    if (page === 1 && initiatives.length > 0 && initiativesLoaded && !forceRefresh) {
      return { data: initiatives, hasMore, currentPage };
    }

    try {
      setIsLoading(true);
      
      // Временно използваме mock данните
      const response = await getMockInitiatives(page, 6);
      
      if (page === 1) {
        setInitiatives(response.data);
      } else {
        setInitiatives(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.hasMore);
      setCurrentPage(response.currentPage);
      setInitiativesLoaded(true);
      
      return response;
    } catch (e) {
      console.error('Грешка при получаване на инициативи:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreInitiatives = async () => {
    if (!hasMore || isLoading) return;
    
    const nextPage = currentPage + 1;
    await getAllInitiatives(nextPage);
  };

  const invalidateInitiativesCache = () => {
    setInitiativesLoaded(false);
    setInitiatives([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getInitiativeById = async (id) => {
    try {
      setIsLoading(true);
      
      // Временно търсим в mock данните
      const initiative = mockData.initiatives.find(init => init.id === parseInt(id) || init.slug === id);
      
      if (!initiative) {
        throw new Error('Инициативата не беше намерена');
      }
      
      return initiative;
    } catch (e) {
      console.error('Грешка при получаване на инициатива по ID:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const contextService = {
    getAllInitiatives,
    loadMoreInitiatives,
    invalidateInitiativesCache,
    getInitiativeById,
    initiatives,
    hasMore,
    currentPage,
    isLoading,
    initiativesLoaded,
  };

  return (
    <InitiativeContext.Provider value={contextService}>
      {children}
      {isLoading && <Loader />}
    </InitiativeContext.Provider>
  );
};

export const useInitiativeContext = () => {
  const context = useContext(InitiativeContext);
  return context;
};