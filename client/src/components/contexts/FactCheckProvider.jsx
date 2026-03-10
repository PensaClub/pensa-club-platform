import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import factCheckServiceFactory from '../Services/factCheckServiceFactory';
import clubServiceFactory from '../Services/clubServiceFactory';
import { toast } from 'react-toastify';

export const FactCheckContext = createContext();

export const FactCheckProvider = ({ children }) => {
  const { token, isAdmin, isModerator } = useAuthContext();

  const factCheckService = useMemo(() => factCheckServiceFactory(token), [token]);
  const clubService = useMemo(() => clubServiceFactory(token), [token]);

  const [isLoading, setIsLoading] = useState(false);

  // ===============================
  // PUBLIC
  // ===============================

  const getPublishedModules = useCallback(async (params = {}) => {
    try {
      return await factCheckService.getPublishedModules(params);
    } catch (error) {
      console.error('Error fetching published modules:', error);
      return { success: false, modules: [], pagination: {} };
    }
  }, []);

  const getPublicFeed = useCallback(async (params = {}) => {
    try {
      return await factCheckService.getPublicFeed(params);
    } catch (error) {
      console.error('Error fetching public feed:', error);
      return { success: false, items: [], pagination: {} };
    }
  }, []);

  const getModuleBySlug = useCallback(async (slug) => {
    try {
      return await factCheckService.getModuleBySlug(slug);
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const response = await factCheckService.getCategories();
      return response?.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }, []);

  const getPublicStats = useCallback(async () => {
    try {
      const response = await factCheckService.getPublicStats();
      return response?.stats || { totalModules: 0, totalSignals: 0, resolvedSignals: 0 };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { totalModules: 0, totalSignals: 0, resolvedSignals: 0 };
    }
  }, []);

  const submitSignal = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const response = await factCheckService.submitSignal(data);
      return response;
    } catch (error) {
      console.error('Error submitting signal:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===============================
  // ADMIN — Signals
  // ===============================

  const getAdminSignals = useCallback(async (params = {}) => {
    if (!isAdmin && !isModerator) {
      toast.error('Нямате права за тази операция');
      return { success: false, signals: [], pagination: {} };
    }
    try {
      return await factCheckService.getAdminSignals(params);
    } catch (error) {
      console.error('Error fetching admin signals:', error);
      toast.error('Грешка при зареждане на сигналите');
      return { success: false, signals: [], pagination: {} };
    }
  }, [isAdmin, isModerator]);

  const getSignalById = useCallback(async (id) => {
    try {
      return await factCheckService.getSignalById(id);
    } catch (error) {
      console.error('Error fetching signal:', error);
      throw error;
    }
  }, []);

  const updateSignal = useCallback(async (id, data) => {
    try {
      const response = await factCheckService.updateSignal(id, data);
      toast.success('Сигналът е обновен');
      return response;
    } catch (error) {
      console.error('Error updating signal:', error);
      toast.error('Грешка при обновяване на сигнала');
      throw error;
    }
  }, []);

  const deleteSignal = useCallback(async (id) => {
    try {
      const response = await factCheckService.deleteSignal(id);
      toast.success('Сигналът е изтрит');
      return response;
    } catch (error) {
      console.error('Error deleting signal:', error);
      toast.error('Грешка при изтриване на сигнала');
      throw error;
    }
  }, []);

  // ===============================
  // ADMIN — Modules
  // ===============================

  const getAdminModules = useCallback(async (params = {}) => {
    if (!isAdmin && !isModerator) {
      toast.error('Нямате права за тази операция');
      return { success: false, modules: [], pagination: {} };
    }
    try {
      return await factCheckService.getAdminModules(params);
    } catch (error) {
      console.error('Error fetching admin modules:', error);
      toast.error('Грешка при зареждане на модулите');
      return { success: false, modules: [], pagination: {} };
    }
  }, [isAdmin, isModerator]);

  const createModule = useCallback(async (data) => {
    try {
      const response = await factCheckService.createModule(data);
      toast.success('Модулът е създаден');
      return response;
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Грешка при създаване на модула');
      throw error;
    }
  }, []);

  const updateModule = useCallback(async (id, data) => {
    try {
      const response = await factCheckService.updateModule(id, data);
      toast.success('Модулът е обновен');
      return response;
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Грешка при обновяване на модула');
      throw error;
    }
  }, []);

  const deleteModule = useCallback(async (id) => {
    try {
      const response = await factCheckService.deleteModule(id);
      toast.success('Модулът е изтрит');
      return response;
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Грешка при изтриване на модула');
      throw error;
    }
  }, []);

  const publishModule = useCallback(async (id) => {
    try {
      const response = await factCheckService.publishModule(id);
      toast.success('Модулът е публикуван');
      return response;
    } catch (error) {
      console.error('Error publishing module:', error);
      toast.error('Грешка при публикуване на модула');
      throw error;
    }
  }, []);

  const hideModule = useCallback(async (id) => {
    try {
      const response = await factCheckService.hideModule(id);
      toast.success('Модулът е скрит');
      return response;
    } catch (error) {
      console.error('Error hiding module:', error);
      toast.error('Грешка при скриване на модула');
      throw error;
    }
  }, []);

  // ===============================
  // EMAIL (via clubService pattern)
  // ===============================

  const sendSignalNotificationEmail = useCallback(async (signalData) => {
    try {
      await clubService.personalEmail({
        from: signalData.reporterEmail || 'noreply@pensa.club',
        to: 'pensa.club@gmail.com',
        subject: 'Нов сигнал за проверка на факти',
        message: `Нов сигнал:\n\nТвърдение: ${signalData.claimText}\nИзточник: ${signalData.sourceType}\nГрад: ${signalData.city || '-'}\nИмейл: ${signalData.reporterEmail || '-'}`,
      });
      return true;
    } catch (error) {
      console.error('Error sending signal notification email:', error);
      return false;
    }
  }, []);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const contextValue = useMemo(() => ({
    isLoading,
    // Public
    getPublishedModules,
    getPublicFeed,
    getModuleBySlug,
    getCategories,
    getPublicStats,
    submitSignal,
    // Admin Signals
    getAdminSignals,
    getSignalById,
    updateSignal,
    deleteSignal,
    // Admin Modules
    getAdminModules,
    createModule,
    updateModule,
    deleteModule,
    publishModule,
    hideModule,
    // Email
    sendSignalNotificationEmail,
  }), [isLoading]);

  return (
    <FactCheckContext.Provider value={contextValue}>
      {children}
    </FactCheckContext.Provider>
  );
};

export const useFactCheck = () => {
  const context = useContext(FactCheckContext);
  if (!context) {
    throw new Error('useFactCheck must be used within FactCheckProvider');
  }
  return context;
};
