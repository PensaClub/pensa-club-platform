import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import reActionServiceFactory from '../Services/reActionServiceFactory';
import { toast } from 'react-toastify';

export const ReActionContext = createContext();

export const ReActionProvider = ({ children }) => {
  const { token, isAdmin, isModerator } = useAuthContext();

  const reActionService = useMemo(() => reActionServiceFactory(token), [token]);

  const [isLoading, setIsLoading] = useState(false);

  // ===============================
  // PUBLIC
  // ===============================

  const getAvailability = useCallback(async (params = {}) => {
    try {
      return await reActionService.getAvailability(params);
    } catch (error) {
      console.error('Error fetching availability:', error);
      return { success: false, availability: [] };
    }
  }, []);

  const submitRequest = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const response = await reActionService.submitRequest(data);
      return response;
    } catch (error) {
      console.error('Error submitting request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackRequest = useCallback(async (code) => {
    try {
      return await reActionService.trackRequest(code);
    } catch (error) {
      console.error('Error tracking request:', error);
      throw error;
    }
  }, []);

  const getTestimonials = useCallback(async () => {
    try {
      const response = await reActionService.getTestimonials();
      return response?.testimonials || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }, []);

  const getPublicStats = useCallback(async () => {
    try {
      const response = await reActionService.getPublicStats();
      return response?.stats || { visitsCompleted: 0, clubsReached: 0, citiesCovered: 0 };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { visitsCompleted: 0, clubsReached: 0, citiesCovered: 0 };
    }
  }, []);

  // ===============================
  // ADMIN
  // ===============================

  const getAdminRequests = useCallback(async (params = {}) => {
    if (!isAdmin && !isModerator) {
      toast.error('Нямате права за тази операция');
      return { success: false, requests: [], pagination: {} };
    }
    try {
      return await reActionService.getAdminRequests(params);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      toast.error('Грешка при зареждане на заявките');
      return { success: false, requests: [], pagination: {} };
    }
  }, [isAdmin, isModerator]);

  const getAdminRequestById = useCallback(async (id) => {
    try {
      return await reActionService.getAdminRequestById(id);
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  }, []);

  const updateRequest = useCallback(async (id, data) => {
    try {
      const response = await reActionService.updateRequest(id, data);
      toast.success('Заявката е обновена');
      return response;
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Грешка при обновяване на заявката');
      throw error;
    }
  }, []);

  const deleteRequest = useCallback(async (id) => {
    try {
      const response = await reActionService.deleteRequest(id);
      toast.success('Заявката е изтрита');
      return response;
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Грешка при изтриване на заявката');
      throw error;
    }
  }, []);

  const getCalendar = useCallback(async (params = {}) => {
    try {
      return await reActionService.getCalendar(params);
    } catch (error) {
      console.error('Error fetching calendar:', error);
      return { success: false, calendar: [] };
    }
  }, []);

  const getMentorsForDate = useCallback(async (date) => {
    try {
      return await reActionService.getMentorsForDate(date);
    } catch (error) {
      console.error('Error fetching mentors for date:', error);
      return { success: false, mentors: [] };
    }
  }, []);

  const getAdminStats = useCallback(async () => {
    try {
      return await reActionService.getAdminStats();
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { success: false };
    }
  }, []);

  const exportCSV = useCallback(async (params = {}) => {
    try {
      return await reActionService.exportCSV(params);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Грешка при експортиране');
      throw error;
    }
  }, []);

  const getAdminTestimonials = useCallback(async () => {
    try {
      return await reActionService.getAdminTestimonials();
    } catch (error) {
      console.error('Error fetching admin testimonials:', error);
      return { success: false, testimonials: [] };
    }
  }, []);

  const createTestimonial = useCallback(async (data) => {
    try {
      const response = await reActionService.createTestimonial(data);
      toast.success('Отзивът е създаден');
      return response;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast.error('Грешка при създаване на отзива');
      throw error;
    }
  }, []);

  const updateTestimonial = useCallback(async (id, data) => {
    try {
      const response = await reActionService.updateTestimonial(id, data);
      toast.success('Отзивът е обновен');
      return response;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Грешка при обновяване на отзива');
      throw error;
    }
  }, []);

  const deleteTestimonial = useCallback(async (id) => {
    try {
      const response = await reActionService.deleteTestimonial(id);
      toast.success('Отзивът е изтрит');
      return response;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Грешка при изтриване на отзива');
      throw error;
    }
  }, []);

  const sendEmail = useCallback(async (data) => {
    try {
      const response = await reActionService.sendEmail(data);
      toast.success('Имейлът е изпратен');
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Грешка при изпращане на имейла');
      throw error;
    }
  }, []);

  // ===============================
  // MENTOR
  // ===============================

  const getMentorAvailability = useCallback(async () => {
    try {
      return await reActionService.getMentorAvailability();
    } catch (error) {
      console.error('Error fetching mentor availability:', error);
      return { success: false, availability: [] };
    }
  }, []);

  const setMentorAvailability = useCallback(async (data) => {
    try {
      const response = await reActionService.setMentorAvailability(data);
      toast.success('Наличността е обновена');
      return response;
    } catch (error) {
      console.error('Error setting mentor availability:', error);
      toast.error('Грешка при обновяване на наличността');
      throw error;
    }
  }, []);

  const getMentorAssignments = useCallback(async () => {
    try {
      return await reActionService.getMentorAssignments();
    } catch (error) {
      console.error('Error fetching mentor assignments:', error);
      return { success: false, assignments: [] };
    }
  }, []);

  const confirmAssignment = useCallback(async (id) => {
    try {
      const response = await reActionService.confirmAssignment(id);
      toast.success('Назначението е потвърдено');
      return response;
    } catch (error) {
      console.error('Error confirming assignment:', error);
      toast.error('Грешка при потвърждаване на назначението');
      throw error;
    }
  }, []);

  const reportProblem = useCallback(async (id, data) => {
    try {
      const response = await reActionService.reportProblem(id, data);
      toast.success('Проблемът е докладван');
      return response;
    } catch (error) {
      console.error('Error reporting problem:', error);
      toast.error('Грешка при докладване на проблема');
      throw error;
    }
  }, []);

  const getMentorHistory = useCallback(async () => {
    try {
      return await reActionService.getMentorHistory();
    } catch (error) {
      console.error('Error fetching mentor history:', error);
      return { success: false, history: [] };
    }
  }, []);

  const submitFeedback = useCallback(async (data) => {
    try {
      const response = await reActionService.submitFeedback(data);
      toast.success('Обратната връзка е изпратена');
      return response;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Грешка при изпращане на обратната връзка');
      throw error;
    }
  }, []);

  const cancelByCode = useCallback(async (code, data = {}) => {
    try {
      const response = await reActionService.cancelByCode(code, data);
      toast.success('Заявката е отменена');
      return response;
    } catch (error) {
      console.error('Error cancelling request by code:', error);
      toast.error('Грешка при отмяна на заявката');
      throw error;
    }
  }, []);

  // ===============================
  // USER (My Requests)
  // ===============================

  const getMyRequests = useCallback(async () => {
    try {
      return await reActionService.getMyRequests();
    } catch (error) {
      console.error('Error fetching my requests:', error);
      return { success: false, requests: [], stats: {} };
    }
  }, []);

  const cancelMyRequest = useCallback(async (id, data = {}) => {
    try {
      const response = await reActionService.cancelMyRequest(id, data);
      toast.success('Заявката е отменена');
      return response;
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Грешка при отмяна на заявката');
      throw error;
    }
  }, []);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const contextValue = useMemo(() => ({
    isLoading,
    // Public
    getAvailability,
    submitRequest,
    trackRequest,
    getTestimonials,
    getPublicStats,
    // Admin
    getAdminRequests,
    getAdminRequestById,
    updateRequest,
    deleteRequest,
    getCalendar,
    getMentorsForDate,
    getAdminStats,
    exportCSV,
    getAdminTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    sendEmail,
    // Mentor
    getMentorAvailability,
    setMentorAvailability,
    getMentorAssignments,
    confirmAssignment,
    reportProblem,
    getMentorHistory,
    submitFeedback,
    cancelByCode,
    // User
    getMyRequests,
    cancelMyRequest,
  }), [isLoading]);

  return (
    <ReActionContext.Provider value={contextValue}>
      {children}
    </ReActionContext.Provider>
  );
};

export const useReAction = () => {
  const context = useContext(ReActionContext);
  if (!context) {
    throw new Error('useReAction must be used within ReActionProvider');
  }
  return context;
};
