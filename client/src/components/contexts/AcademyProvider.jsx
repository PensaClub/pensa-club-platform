import { createContext, useContext, useState, useCallback } from 'react';
import { useAuthContext } from './UserContext';
import academyServiceFactory from '../Services/academyServiceFactory';
import clubServiceFactory from '../Services/clubServiceFactory';
import { toast } from 'react-toastify';
import { notify } from '../../utils/notify';

export const AcademyContext = createContext();

export const AcademyProvider = ({ children }) => {
  const { token } = useAuthContext();
  const academyService = academyServiceFactory(token);
  const clubService = clubServiceFactory(token);

  // State САМО за landing page данни
  const [stats, setStats] = useState(null);

  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ===============================
  // FETCH ФУНКЦИИ
  // ===============================

  const fetchStats = useCallback(async () => {
  try {
    const response = await academyService.getStats();

    if (response && response.success && response.stats) {
      setStats(response.stats); 
      return response.stats;    
    }
    
    console.warn('⚠️ Invalid response format');
    return null;
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return null;
  }
}, []);
  const fetchFeaturedMentors = useCallback(async (limit = 3) => {
    try {
      const data = await academyService.getFeaturedMentors(limit);
      setFeaturedMentors(data.mentors || data);
      return data;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      return [];
    }
  }, []);

  const fetchFeaturedTestimonials = useCallback(async (limit = 5) => {
    try {
      const data = await academyService.getFeaturedTestimonials(limit);
      setFeaturedTestimonials(data.testimonials || data);
      return data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }, []);

  // ===============================
  // SEND PERSONAL EMAIL
  // ===============================

  const sendPersonalEmail = async (personalInfo) => {
    try {
      setIsLoading(true);
      await clubService.personalEmail(personalInfo);
      notify('personal-email-sent');
      return true;
    } catch (e) {
      console.error('Грешка при изпращане на персонален имейл:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // MENTOR APPLICATION
  // ===============================

  const applyAsMentor = useCallback(async (applicationData) => {
    setIsLoading(true);
    try {
      const response = await academyService.applyAsMentor(applicationData);

      const emailMessage = `
🎓 НОВА КАНДИДАТУРА ЗА МЕНТОР

=== ЛИЧНА ИНФОРМАЦИЯ ===
Име: ${applicationData.name}
Email: ${applicationData.email}
Телефон: ${applicationData.phone}
Възраст: ${applicationData.age}

=== НАЧИНИ ЗА ВРЪЗКА ===
${applicationData.viber ? `Viber: ${applicationData.viber}` : ''}
${applicationData.facebook ? `Facebook: ${applicationData.facebook}` : ''}
${applicationData.linkedin ? `LinkedIn: ${applicationData.linkedin}` : ''}
${applicationData.otherContact ? `Друг контакт: ${applicationData.otherContact}` : ''}

=== ОБРАЗОВАНИЕ И ОПИТ ===
Образование: ${applicationData.education || 'Не е посочено'}
Специализация: ${applicationData.specialization || 'Не е посочена'}
Опит: ${applicationData.experience || 'Не е посочен'}

=== ГРАФИК И ЕЗИЦИ ===
График: ${applicationData.availability || 'Не е посочен'}
Езици: ${applicationData.languages && applicationData.languages.length > 0 ? applicationData.languages.join(', ') : 'Не са посочени'}

=== МОТИВАЦИЯ ===
${applicationData.motivation || 'Не е посочена'}

=== ФАЙЛОВЕ ===
${applicationData.photoUrl ? `✅ Снимка: ${applicationData.photoUrl}` : '❌ Снимка: Не е качена'}
${applicationData.cvUrl ? `✅ CV: ${applicationData.cvOriginalName || 'CV.pdf'}\nURL: ${applicationData.cvUrl}` : '❌ CV: Не е качено'}

---
Изпратено от DigiBridge Academy - Become Mentor Form
Дата: ${new Date().toLocaleString('bg-BG')}
Application ID: ${response.applicationId || response.id || 'N/A'}
      `.trim();

      await sendPersonalEmail({
        from: applicationData.email,
        to: 'info@pensa.club',
        subject: `🎓 Нова кандидатура за ментор: ${applicationData.name}`,
        message: emailMessage
      });

      await academyService.createAdminNotification({
        type: 'mentor_application',
        title: 'Нова кандидатура за ментор',
        message: `${applicationData.name} кандидатства за ментор${applicationData.specialization ? ` - ${applicationData.specialization}` : ''}`,
        data: {
          applicantName: applicationData.name,
          applicantEmail: applicationData.email,
          applicantPhone: applicationData.phone,
          specialization: applicationData.specialization || null,
          photoUrl: applicationData.photoUrl || null,
          cvUrl: applicationData.cvUrl || null,
          cvOriginalName: applicationData.cvOriginalName || null,
          applicationId: response.applicationId || response.id
        }
      });

      toast.success('Кандидатурата е изпратена успешно!');
      return response;

    } catch (error) {
      console.error('Error applying as mentor:', error);
      toast.error('Грешка при изпращане на кандидатурата');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sendPersonalEmail]);

  const createMentor = useCallback(async (mentorData) => {
    setIsLoading(true);
    try {

      const response = await academyService.createMentor(mentorData);

      toast.success('Менторът беше създаден успешно!');
      return response;
    } catch (error) {
      console.error('Error creating mentor:', error);
      toast.error('Грешка при създаване на ментор');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllMentors = useCallback(async (params = {}) => {
    try {
      const data = await academyService.getAllMentors(params);
      return data;
    } catch (error) {
      console.error('Error fetching all mentors:', error);
      throw error;
    }
  }, []);

  const getMentorById = useCallback(async (mentorId) => {
    try {
      const data = await academyService.getMentorById(mentorId);
      return data.mentor || data;
    } catch (error) {
      console.error('Error fetching mentor details:', error);
      throw error;
    }
  }, []);
  // ===============================
  // ADMIN NOTIFICATIONS
  // ===============================

  const getAdminNotifications = useCallback(async () => {
    try {
      const data = await academyService.getAdminNotifications();
      return data;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      return [];
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await academyService.markNotificationAsRead(notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const response = await academyService.markAllNotificationsAsRead();
      toast.success('Всички нотификации са маркирани като прочетени');
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Грешка при маркиране на нотификации');
      throw error;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await academyService.deleteNotification(notificationId);
      toast.success('Нотификацията е изтрита');
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Грешка при изтриване на нотификация');
      throw error;
    }
  }, []);
  // ===============================
  // ADMIN MENTOR MANAGEMENT
  // ===============================

  const getApprovedMentors = useCallback(async () => {
    try {
      const data = await academyService.getApprovedMentors();
      return data.mentors || data;
    } catch (error) {
      console.error('Error fetching approved mentors:', error);
      throw error;
    }
  }, []);

  const getRejectedMentorApplications = useCallback(async () => {
    try {
      const data = await academyService.getRejectedMentorApplications();
      return data.applications || data;
    } catch (error) {
      console.error('Error fetching rejected applications:', error);
      throw error;
    }
  }, []);

  const updateMentor = useCallback(async (mentorId, data) => {
    try {
      const response = await academyService.updateMentor(mentorId, data);
      toast.success('Менторът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating mentor:', error);
      toast.error('Грешка при обновяване на ментор');
      throw error;
    }
  }, []);

  const activateMentor = useCallback(async (mentorId) => {
  try {
    const response = await academyService.activateMentor(mentorId);
    toast.success('Менторът беше активиран');
    return response;
  } catch (error) {
    console.error('Error activating mentor:', error);
    throw error;
  }
}, []);

  const deactivateMentor = useCallback(async (mentorId) => {
    try {
      const response = await academyService.deactivateMentor(mentorId);
      return response;
    } catch (error) {
      console.error('Error deactivating mentor:', error);
      throw error;
    }
  }, []);

  const deleteMentor = useCallback(async (mentorId) => {
    try {
      const response = await academyService.deleteMentor(mentorId);
      return response;
    } catch (error) {
      console.error('Error deleting mentor:', error);
      throw error;
    }
  }, []);

  const approveMentor = useCallback(async (applicationId) => {
  try {
    const response = await academyService.approveMentor(applicationId);
    
    // ✅ СЪЗДАЙ НОТИФИКАЦИЯ
    await academyService.createAdminNotification({
      type: 'mentor_approved',
      title: 'Ментор одобрен',
      message: `Кандидатурата беше одобрена успешно`,
      data: {
        applicationId,
        mentorId: response.mentor?.id
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error approving mentor:', error);
    throw error;
  }
}, []);

  const bulkDeleteMentors = useCallback(async (mentorIds) => {
    try {
      const response = await academyService.bulkDeleteMentors(mentorIds);
      return response;
    } catch (error) {
      console.error('Error bulk deleting mentors:', error);
      throw error;
    }
  }, []);

  const updateMentorAdminNotes = useCallback(async (mentorId, notes) => {
    try {
      const response = await academyService.updateMentorAdminNotes(mentorId, notes);
      toast.success('Бележките са обновени успешно');
      return response;
    } catch (error) {
      console.error('Error updating admin notes:', error);
      toast.error('Грешка при обновяване на бележки');
      throw error;
    }
  }, []);

  const updateMentorPriorityContact = useCallback(async (mentorId, priorityContact) => {
    try {
      const response = await academyService.updateMentorPriorityContact(mentorId, priorityContact);
      toast.success('Приоритетният контакт е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating priority contact:', error);
      toast.error('Грешка при обновяване на приоритетен контакт');
      throw error;
    }
  }, []);
  // ===============================
  // ADMIN MENTOR APPLICATIONS (ДОБАВИ ТОВА)
  // ===============================

  const getPendingMentorApplications = useCallback(async () => {
    try {
      const data = await academyService.getPendingMentorApplications();
      return data.applications || data;
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      throw error;
    }
  }, []);

 const rejectMentorApplication = useCallback(async (applicationId, rejectionReason) => {
  try {
    const response = await academyService.rejectMentorApplication(applicationId, rejectionReason);
    
    // ✅ СЪЗДАЙ НОТИФИКАЦИЯ
    await academyService.createAdminNotification({
      type: 'mentor_rejected',
      title: 'Кандидатура отхвърлена',
      message: `Кандидатурата беше отхвърлена: ${rejectionReason}`,
      data: {
        applicationId,
        rejectionReason
      }
    });
    
    toast.success('Кандидатурата беше отхвърлена');
    return response;
  } catch (error) {
    console.error('Error rejecting application:', error);
    toast.error('Грешка при отхвърляне на кандидатурата');
    throw error;
  }
}, []);

  // ===============================
  // MENTOR STATISTICS
  // ===============================

  const getMentorStatistics = useCallback(async (timeFilter = 'thisMonth') => {
    try {
      const data = await academyService.getMentorStatistics(timeFilter);
      return data;
    } catch (error) {
      console.error('Error fetching mentor statistics:', error);
      throw error;
    }
  }, []);

  const getMentorStatisticsOverview = useCallback(async () => {
    try {
      const data = await academyService.getMentorStatisticsOverview();
      return data;
    } catch (error) {
      console.error('Error fetching statistics overview:', error);
      throw error;
    }
  }, []);

  const getMentorsBySpecialization = useCallback(async () => {
  try {
    const response = await academyService.getMentorsBySpecialization();

    if (response.success && response.specializations) {
      return {
        success: true,
        specializations: response.specializations
      };
    }
    
    return { success: false, specializations: [] };
  } catch (error) {
    console.error('Error fetching mentors by specialization:', error);
    return { success: false, specializations: [] };
  }
}, []);

  const getMentorActivityTrend = useCallback(async (months = 6) => {
    try {
      const data = await academyService.getMentorActivityTrend(months);
      return data.trend || data;
    } catch (error) {
      console.error('Error fetching activity trend:', error);
      throw error;
    }
  }, []);

  const getMentorDetailedStatistics = useCallback(async (mentorId) => {
    try {
      const data = await academyService.getMentorDetailedStatistics(mentorId);
      return data;
    } catch (error) {
      console.error('Error fetching detailed statistics:', error);
      throw error;
    }
  }, []);
// ===============================
// FIREBASE STATISTICS - ФАЗА 2 🔥
// ===============================

const getAllMentorsWithStats = useCallback(async () => {
  try {
    const data = await academyService.getAllMentorsWithStats();
    return data;
  } catch (error) {
    console.error('Error fetching mentors with stats:', error);
    throw error;
  }
}, []);

const getMentorFirebaseStats = useCallback(async (mentorId) => {
  try {
    const data = await academyService.getMentorFirebaseStats(mentorId);
    return data;
  } catch (error) {
    console.error('Error fetching mentor Firebase stats:', error);
    throw error;
  }
}, []);

const getAllMentorsWithStatsFiltered = useCallback(async (timeFilter) => {
  try {
    const data = await academyService.getAllMentorsWithStatsFiltered(timeFilter);
    return data;
  } catch (error) {
    console.error('Error fetching filtered mentors with stats:', error);
    throw error;
  }
}, []);

const refreshMentorStats = useCallback(async (mentorId) => {
  try {
    const response = await academyService.refreshMentorStats(mentorId);
    toast.success('Статистиките са обновени успешно');
    return response;
  } catch (error) {
    console.error('Error refreshing mentor stats:', error);
    toast.error('Грешка при обновяване на статистики');
    throw error;
  }
}, []);

const getFirebaseOverviewStats = useCallback(async () => {
  try {
    const data = await academyService.getFirebaseOverviewStats();
    return data;
  } catch (error) {
    console.error('Error fetching Firebase overview stats:', error);
    throw error;
  }
}, []);

const getTopMentorsByOnlineTime = useCallback(async (limit = 5) => {
  try {
    const data = await academyService.getTopMentorsByOnlineTime(limit);
    return data;
  } catch (error) {
    console.error('Error fetching top mentors by online time:', error);
    throw error;
  }
}, []);

const getResponseTimesStats = useCallback(async () => {
  try {
    const data = await academyService.getResponseTimesStats();
    return data;
  } catch (error) {
    console.error('Error fetching response times stats:', error);
    throw error;
  }
}, []);

const getActivityTrendData = useCallback(async (months = 6) => {
  try {
    const data = await academyService.getActivityTrend(months);
    return data;
  } catch (error) {
    console.error('Error fetching activity trend:', error);
    throw error;
  }
}, []);

const getSessionQualityData = useCallback(async () => {
  try {
    const data = await academyService.getSessionQuality();
    return data;
  } catch (error) {
    console.error('Error fetching session quality:', error);
    throw error;
  }
}, []);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const contextValue = {
    // Data
    stats,
    featuredMentors,
    featuredTestimonials,
    isLoading,

    // Functions
    fetchStats,
    fetchFeaturedMentors,
    fetchFeaturedTestimonials,

    // Email
    sendPersonalEmail,

    // Mentor Application
    applyAsMentor,
    // Mentor Management (✅ ДОБАВЕНИ)
    createMentor,
    getAllMentors,
    getMentorById,
    // Admin Notifications
    getAdminNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,     // ✅ ДОБАВИ
    deleteNotification,

    // Admin Mentor Management
    getApprovedMentors,
    getRejectedMentorApplications,
    updateMentor,
    activateMentor,
    deactivateMentor,
    deleteMentor,
    approveMentor,
    bulkDeleteMentors,
    updateMentorAdminNotes,
    updateMentorPriorityContact,
    // Mentor Statistics
    getMentorStatistics,
    getMentorStatisticsOverview,
    getMentorsBySpecialization,
    getMentorActivityTrend,
    getMentorDetailedStatistics,
    getAllMentorsWithStatsFiltered,
    // Admin Applications 
    getPendingMentorApplications,
    rejectMentorApplication,
      // Firebase Statistics 
  getAllMentorsWithStats,
  getMentorFirebaseStats,
  refreshMentorStats,
  getFirebaseOverviewStats,
    // Activity Tracking & Charts 📊
  getTopMentorsByOnlineTime,
  getResponseTimesStats,
  getActivityTrendData,
  getSessionQualityData,
  };

  return (
    <AcademyContext.Provider value={contextValue}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within AcademyProvider');
  }
  return context;
};