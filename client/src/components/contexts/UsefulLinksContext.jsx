import { createContext, useCallback, useContext, useState, useRef } from "react";
import { notify } from "../../utils/notify.jsx";
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useAuthContext } from "./UserContext";
import usefulLinksServiceFactory from "../Services/usefulLinksServiceFactory.js";

export const UsefulLinksContext = createContext();

const LINKS_PER_PAGE = 12;

export const UsefulLinksProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [publicLinks, setPublicLinks] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  const pageRef = useRef(1);
  const currentFiltersRef = useRef({ search: '', category: '' });

  const { user, isAdmin, isModerator } = useAuthContext();
  const navigate = useLocalizedNavigate();

  const isStaff = isAdmin || isModerator;

  const usefulLinksService = usefulLinksServiceFactory(user?.token);

  // === PUBLIC ===

  const fetchPublicLinks = useCallback(async (search = '', category = '') => {
    try {
      setIsLoading(true);
      setPublicLinks([]);
      setHasMore(true);
      pageRef.current = 1;
      currentFiltersRef.current = { search, category };

      const response = await usefulLinksService.getAllPublic(1, LINKS_PER_PAGE, search, category);
      const links = response?.links || [];
      const pagination = response?.pagination || {};

      setPublicLinks(links);
      setHasMore(pagination.hasMore ?? false);
      pageRef.current = 2;

      // On first load without filters, collect all categories
      if (!search && !category && links.length > 0) {
        const cats = [...new Set(links.map(l => l.category).filter(Boolean))];
        setAllCategories(prev => {
          const merged = new Set([...prev, ...cats]);
          return [...merged];
        });
      }

      return links;
    } catch (e) {
      console.error('Error fetching public links:', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMorePublicLinks = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const { search, category } = currentFiltersRef.current;
      const page = pageRef.current;

      const response = await usefulLinksService.getAllPublic(page, LINKS_PER_PAGE, search, category);
      const links = response?.links || [];
      const pagination = response?.pagination || {};

      setPublicLinks(prev => [...prev, ...links]);
      setHasMore(pagination.hasMore ?? false);
      pageRef.current = page + 1;

      // Accumulate categories
      if (links.length > 0) {
        const cats = [...new Set(links.map(l => l.category).filter(Boolean))];
        setAllCategories(prev => {
          const merged = new Set([...prev, ...cats]);
          return [...merged];
        });
      }
    } catch (e) {
      console.error('Error fetching more links:', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  const trackView = async (id) => {
    try {
      await usefulLinksService.trackView(id);
    } catch (e) {
      console.error('Error tracking view:', e);
    }
  };

  const getLinkById = async (id) => {
    try {
      const link = await usefulLinksService.getById(id);
      return link;
    } catch (e) {
      console.error('Error getting link:', e);
      return null;
    }
  };

  // === ADMIN (staff only: admin + moderator) ===

  const fetchAdminLinks = useCallback(async (page = 1, limit = 12, search = '', category = '', status = '', sortBy = 'newest') => {
    if (!isStaff) {
      notify('error', 'Нямате права за достъп до админ панела');
      return { links: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
    }

    try {
      const response = await usefulLinksService.getAllAdmin(page, limit, search, category, status, sortBy);
      return response;
    } catch (e) {
      console.error('Error fetching admin links:', e);
      notify('error', e);
      return { links: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
    }
  }, [isStaff]);

  const createLink = async (data) => {
    if (!isStaff) {
      notify('error', 'Нямате права за създаване на връзки');
      return null;
    }

    try {
      setIsLoading(true);
      const newLink = await usefulLinksService.create(data);
      return newLink;
    } catch (e) {
      console.error('Error creating link:', e);
      notify('error', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLink = async (id, data) => {
    if (!isStaff) {
      notify('error', 'Нямате права за редактиране на връзки');
      return null;
    }

    try {
      setIsLoading(true);
      const updatedLink = await usefulLinksService.update(id, data);
      return updatedLink;
    } catch (e) {
      console.error('Error updating link:', e);
      notify('error', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (id) => {
    if (!isAdmin) {
      notify('error', 'Само администратори могат да изтриват връзки');
      return false;
    }

    try {
      setIsLoading(true);
      await usefulLinksService.remove(id);
      return true;
    } catch (e) {
      console.error('Error deleting link:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id) => {
    if (!isStaff) {
      notify('error', 'Нямате права за промяна на статус');
      return null;
    }

    try {
      const updatedLink = await usefulLinksService.toggleActive(id);
      return updatedLink;
    } catch (e) {
      console.error('Error toggling active:', e);
      notify('error', e);
      return null;
    }
  };

  const contextService = {
    // State
    publicLinks,
    allCategories,
    isLoading,
    isLoadingMore,
    hasMore,
    // Public
    fetchPublicLinks,
    fetchMorePublicLinks,
    trackView,
    getLinkById,
    // Admin (protected)
    fetchAdminLinks,
    createLink,
    updateLink,
    deleteLink,
    toggleActive,
  };

  return (
    <UsefulLinksContext.Provider value={contextService}>
      {children}
    </UsefulLinksContext.Provider>
  );
};

export const useUsefulLinksContext = () => {
  const context = useContext(UsefulLinksContext);
  if (!context) {
    throw new Error('useUsefulLinksContext must be used within a UsefulLinksProvider');
  }
  return context;
};
