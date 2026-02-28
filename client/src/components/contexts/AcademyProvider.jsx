import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import academyServiceFactory from '../Services/academyServiceFactory';
import clubServiceFactory from '../Services/clubServiceFactory';
import { toast } from 'react-toastify';
import { notify } from '../../utils/notify';

export const AcademyContext = createContext();

export const AcademyProvider = ({ children }) => {
  const { token, isAdmin, userEmail } = useAuthContext();
  const academyService = useMemo(() => academyServiceFactory(token), [token]);
  const clubService = useMemo(() => clubServiceFactory(token), [token]);

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
  const syncSession = useCallback(async (sessionId, mentorEmail) => {
    try {
      const data = await academyService.syncSession(sessionId, mentorEmail);
      return data;
    } catch (error) {
      console.error('Error syncing session:', error);
      return null;
    }
  }, []);
  // ===============================
  // ACADEMY REVIEWS
  // ===============================

  const createAcademyReview = useCallback(async (reviewData) => {
    setIsLoading(true);
    try {
      const response = await academyService.createAcademyReview(reviewData);
      toast.success('Благодарим за отзива! Ще бъде одобрен скоро.');
      return response;
    } catch (error) {
      console.error('Error creating academy review:', error);
      toast.error('Грешка при изпращане на отзив');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getApprovedAcademyReviews = useCallback(async () => {
    try {
      const data = await academyService.getApprovedAcademyReviews();
      return data;
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
      return { reviews: [] };
    }
  }, []);

  const checkUserAcademyReviewStatus = useCallback(async () => {
    try {
      const data = await academyService.checkUserAcademyReviewStatus();
      return data;
    } catch (error) {
      console.error('Error checking review status:', error);
      return { hasReview: false };
    }
  }, []);

  const createMentorReview = useCallback(async (mentorId, reviewData) => {
    setIsLoading(true);
    try {
      const response = await academyService.createMentorReview(mentorId, reviewData);
      toast.success('Благодарим за отзива за ментора! Ще бъде одобрен скоро.');
      return response;
    } catch (error) {
      console.error('Error creating mentor review:', error);

      // Handle specific errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Грешка при изпращане на отзив за ментора');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getApprovedMentorReviews = useCallback(async (mentorId, limit = 10) => {
    try {
      const data = await academyService.getApprovedMentorReviews(mentorId, limit);
      return data;
    } catch (error) {
      console.error('Error fetching approved mentor reviews:', error);
      return { reviews: [] };
    }
  }, []);

  const getMentorReviewStats = useCallback(async (mentorId) => {
    try {
      const data = await academyService.getMentorReviewStats(mentorId);
      return data;
    } catch (error) {
      console.error('Error fetching mentor review stats:', error);
      return {
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      };
    }
  }, []);
  const checkUserMentorReviewStatus = useCallback(async (mentorId) => {
    try {
      const data = await academyService.checkUserMentorReviewStatus(mentorId);
      return data;
    } catch (error) {
      console.error('Error checking mentor review status:', error);
      return { hasReview: false };
    }
  }, []);
  const getPendingReviews = useCallback(async (params = {}) => {
    try {
      const data = await academyService.getPendingReviews(params);
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }, []);

  const approveReview = useCallback(async (reviewId) => {
    try {
      const response = await academyService.approveReview(reviewId);
      toast.success('Ревюто е одобрено успешно');
      return response;
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Грешка при одобряване на ревю');
      throw error;
    }
  }, []);

  const rejectReview = useCallback(async (reviewId, rejectionReason) => {
    try {
      const response = await academyService.rejectReview(reviewId, rejectionReason);
      toast.success('Ревюто е отхвърлено');
      return response;
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Грешка при отхвърляне на ревю');
      throw error;
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      const response = await academyService.deleteReview(reviewId);
      toast.success('Ревюто е изтрито');
      return response;
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Грешка при изтриване на ревю');
      throw error;
    }
  }, []);
  //MENTOR PANEL
  const getMentorDashboardStats = useCallback(async () => {
    try {
      const data = await academyService.getMentorDashboardStats();
      return data;
    } catch (error) {
      console.error('Error fetching mentor dashboard stats:', error);
      return { success: false, stats: {} };
    }
  }, []);

  const getMentorRecentActivity = useCallback(async (limit = 10) => {
    try {
      const data = await academyService.getMentorRecentActivity(limit);
      return data;
    } catch (error) {
      console.error('Error fetching mentor recent activity:', error);
      return { success: false, activities: [] };
    }
  }, []);

  const getMentorUpcomingSessions = useCallback(async (limit = 10) => {
    try {
      const data = await academyService.getMentorUpcomingSessions(limit);
      return data;
    } catch (error) {
      console.error('Error fetching mentor upcoming sessions:', error);
      return { success: false, sessions: [] };
    }
  }, []);

  const getMentorStudents = useCallback(async () => {
    try {
      const data = await academyService.getMentorStudents();
      return data;
    } catch (error) {
      console.error('Error fetching mentor students:', error);
      return { success: false, students: [] };
    }
  }, []);

  const getMentorPerformanceData = useCallback(async () => {
    try {
      const data = await academyService.getMentorPerformanceData();
      return data;
    } catch (error) {
      console.error('Error fetching mentor performance data:', error);
      return { success: false, data: {} };
    }
  }, []);

  // MENTOR MEETINGS
  const getMentorMeetings = useCallback(async (status = null) => {
    try {
      const data = await academyService.getMentorMeetings(status);
      return data;
    } catch (error) {
      console.error('Error fetching mentor meetings:', error);
      return { success: false, meetings: [] };
    }
  }, []);

  const createMentorMeeting = useCallback(async (meetingData) => {
    try {
      const data = await academyService.createMentorMeeting(meetingData);
      return data;
    } catch (error) {
      console.error('Error creating mentor meeting:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const updateMentorMeeting = useCallback(async (meetingId, meetingData) => {
    try {
      const data = await academyService.updateMentorMeeting(meetingId, meetingData);
      return data;
    } catch (error) {
      console.error('Error updating mentor meeting:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const completeMentorMeeting = useCallback(async (meetingId, completionData) => {
    try {
      const data = await academyService.completeMentorMeeting(meetingId, completionData);
      return data;
    } catch (error) {
      console.error('Error completing mentor meeting:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const cancelMentorMeeting = useCallback(async (meetingId) => {
    try {
      const data = await academyService.cancelMentorMeeting(meetingId);
      return data;
    } catch (error) {
      console.error('Error canceling mentor meeting:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const deleteMentorMeeting = useCallback(async (meetingId) => {
    try {
      const data = await academyService.deleteMentorMeeting(meetingId);
      return data;
    } catch (error) {
      console.error('Error deleting mentor meeting:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // MENTOR PROFILE EDIT
  const getMentorProfile = useCallback(async () => {
    try {
      const data = await academyService.getMentorProfile();
      return data;
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const updateMentorProfile = useCallback(async (profileData) => {
    try {
      const data = await academyService.updateMentorProfile(profileData);
      return data;
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const getStudentDetails = useCallback(async (studentId) => {
    try {
      const data = await academyService.getStudentDetails(studentId);
      return data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // ============================================
  // STUDENT NOTES FUNCTIONS
  // ============================================

  const getStudentNotes = useCallback(async (studentId) => {
    try {
      const data = await academyService.getStudentNotes(studentId);
      return data;
    } catch (error) {
      console.error('Error fetching student notes:', error);
      return { success: false, message: error.message, notes: [] };
    }
  }, []);

  const createStudentNote = useCallback(async (studentId, noteData) => {
    try {
      const data = await academyService.createStudentNote(studentId, noteData);
      toast.success('Бележката е създадена успешно');
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Грешка при създаване на бележка');
      return { success: false, message: error.message };
    }
  }, []);

  const updateStudentNote = useCallback(async (noteId, noteData) => {
    try {
      const data = await academyService.updateStudentNote(noteId, noteData);
      toast.success('Бележката е обновена успешно');
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Грешка при обновяване на бележка');
      return { success: false, message: error.message };
    }
  }, []);

  const deleteStudentNote = useCallback(async (noteId) => {
    try {
      const data = await academyService.deleteStudentNote(noteId);
      toast.success('Бележката е изтрита успешно');
      return data;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Грешка при изтриване на бележка');
      return { success: false, message: error.message };
    }
  }, []);

  const acceptStudent = useCallback(async (studentId) => {
    try {
      const data = await academyService.acceptStudent(studentId);
      toast.success('Студентът е приет успешно');
      return data;
    } catch (error) {
      console.error('Error accepting student:', error);
      toast.error('Грешка при приемане на студент');
      return { success: false, message: error.message };
    }
  }, []);

  const removeStudent = useCallback(async (studentId) => {
    try {
      const data = await academyService.removeStudent(studentId);
      toast.success('Студентът е премахнат успешно');
      return data;
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Грешка при премахване на студент');
      return { success: false, message: error.message };
    }
  }, []);

  // ============================================
  // MENTOR OWN REVIEWS
  // ============================================

  const getMentorOwnReviews = useCallback(async (limit = 100) => {
    try {
      const data = await academyService.getMentorOwnReviews(limit);
      return data;
    } catch (error) {
      console.error('Error fetching own reviews:', error);
      return { success: false, reviews: [] };
    }
  }, []);

  const getMentorOwnReviewStats = useCallback(async () => {
    try {
      const data = await academyService.getMentorOwnReviewStats();
      return data;
    } catch (error) {
      console.error('Error fetching own review stats:', error);
      return {
        success: false,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      };
    }
  }, []);

  // ===============================
  // STUDENT APPLICATION TO MENTOR
  // ===============================

  const applyForMentor = useCallback(async (mentorId) => {
    setIsLoading(true);
    try {
      const response = await academyService.applyForMentor(mentorId);

      return {
        success: true,
        message: response.message || 'Заявката е изпратена успешно',
        application: response.application || response,
        id: response.application?.id || response.id
      };
    } catch (error) {
      console.error('Error applying for mentor:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===============================
  // MENTOR: MANAGE STUDENT APPLICATIONS (за следващ етап)
  // ===============================

  const getStudentApplications = useCallback(async () => {
    try {
      const data = await academyService.getStudentApplications();
      return data;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return { success: false, applications: [] };
    }
  }, []);

  const approveStudentApplication = useCallback(async (applicationId) => {
    try {
      const response = await academyService.approveStudentApplication(applicationId);
      if (response.userEmail) {
        const mentorName = response.student?.currentMentor?.name || 'вашият ментор';

        await sendPersonalEmail({
          from: 'info@pensa.club',
          to: response.userEmail,
          subject: '🎉 Вашата заявка за обучение е одобрена!',
          message: `Здравейте,

Радваме се да ви съобщим, че вашата заявка за обучение към ментор ${mentorName} беше одобрена!

Вече можете да започнете обучението си в DigiBridge Academy.

Влезте в профила си, за да видите повече информация и да се свържете с вашия ментор.

С уважение,
Екипът на DigiBridge Academy`
        });
      }
      toast.success('Заявката е одобрена успешно');
      return response;
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Грешка при одобряване на заявка');
      throw error;
    }
  }, [sendPersonalEmail]);

  const rejectStudentApplication = useCallback(async (applicationId, reason) => {
    try {
      const response = await academyService.rejectStudentApplication(applicationId, reason);
      if (response.userEmail) {
      await sendPersonalEmail({
        from: 'info@pensa.club',
        to: response.userEmail,
        subject: 'Информация относно вашата заявка за обучение',
        message: `Здравейте,

За съжаление, вашата заявка за обучение не беше одобрена.

${reason ? `Причина: ${reason}` : ''}

Можете да кандидатствате отново или да изберете друг ментор от нашата платформа.

С уважение,
Екипът на DigiBridge Academy`
      });
    }
      toast.success('Заявката е отхвърлена');
      return response;
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Грешка при отхвърляне на заявка');
      throw error;
    }
  }, [sendPersonalEmail]);

  const reapproveStudentApplication = useCallback(async (applicationId) => {
    try {
      const response = await academyService.reapproveStudentApplication(applicationId);
      if (response.userEmail) {
      const mentorName = response.student?.currentMentor?.name || 'вашият ментор';
      
      await sendPersonalEmail({
        from: 'info@pensa.club',
        to: response.userEmail,
        subject: '🎉 Вашата заявка за обучение е одобрена!',
        message: `Здравейте,

Радваме се да ви съобщим, че вашата заявка за обучение беше преразгледана и одобрена!

Вече можете да започнете обучението си в DigiBridge Academy с ментор ${mentorName}.

Влезте в профила си, за да видите повече информация и да се свържете с вашия ментор.

С уважение,
Екипът на DigiBridge Academy`
      });
    }
      toast.success('Заявката е одобрена успешно');
      return response;
    } catch (error) {
      console.error('Error re-approving application:', error);
      toast.error('Грешка при одобряване на заявка');
      throw error;
    }
  }, [sendPersonalEmail]);

  const deleteStudentApplication = useCallback(async (applicationId) => {
    try {
      const response = await academyService.deleteStudentApplication(applicationId);
      toast.success('Заявката е изтрита');
      return response;
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Грешка при изтриване на заявка');
      throw error;
    }
  }, []);
  // ===============================
  // ADMIN STUDENTS MANAGEMENT 📚 (С isAdmin ПРОВЕРКА)
  // ===============================

  const getAllStudents = useCallback(async (params = {}) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false, students: [], pagination: {} };
    }
    try {
      const data = await academyService.getAllStudents(params);
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Грешка при зареждане на студенти');
      throw error;
    }
  }, [isAdmin]);

  const getStudentById = useCallback(async (studentId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false, student: null };
    }
    try {
      const data = await academyService.getStudentById(studentId);
      return data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Грешка при зареждане на детайли');
      throw error;
    }
  }, [isAdmin]);

  const updateStudent = useCallback(async (studentId, data) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.updateStudent(studentId, data);
      toast.success('Студентът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Грешка при обновяване на студент');
      throw error;
    }
  }, [isAdmin]);

  const deleteStudent = useCallback(async (studentId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.deleteStudent(studentId);
      toast.success('Студентът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Грешка при изтриване на студент');
      throw error;
    }
  }, [isAdmin]);

  const updateStudentStatus = useCallback(async (studentId, status) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.updateStudentStatus(studentId, status);
      toast.success('Статусът е променен успешно');
      return response;
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Грешка при промяна на статус');
      throw error;
    }
  }, [isAdmin]);

  const assignMentorToStudent = useCallback(async (studentId, newMentorId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.assignMentorToStudent(studentId, newMentorId);
      toast.success('Менторът е присвоен успешно');
      return response;
    } catch (error) {
      console.error('Error assigning mentor to student:', error);
      toast.error('Грешка при присвояване на ментор');
      throw error;
    }
  }, [isAdmin]);

  const sendEmailToStudent = useCallback(async (studentId, emailData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    setIsLoading(true);
    try {
      const response = await academyService.sendEmailToStudent(studentId, emailData);
      toast.success('Имейлът е изпратен успешно');
      return response;
    } catch (error) {
      console.error('Error sending email to student:', error);
      toast.error('Грешка при изпращане на имейл');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // ===============================
  // ADMIN STUDENT NOTES 📝 (С isAdmin ПРОВЕРКА)
  // ===============================

  const getAdminStudentNotes = useCallback(async (studentId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false, notes: [] };
    }
    try {
      const data = await academyService.getAdminStudentNotes(studentId);
      return data;
    } catch (error) {
      console.error('Error fetching admin student notes:', error);
      return { success: false, notes: [] };
    }
  }, [isAdmin]);

  const createAdminStudentNote = useCallback(async (studentId, noteData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.createAdminStudentNote(studentId, noteData);
      toast.success('Бележката е създадена успешно');
      return response;
    } catch (error) {
      console.error('Error creating admin note:', error);
      toast.error('Грешка при създаване на бележка');
      throw error;
    }
  }, [isAdmin]);

  const updateAdminStudentNote = useCallback(async (studentId, noteId, noteData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.updateAdminStudentNote(studentId, noteId, noteData);
      toast.success('Бележката е обновена успешно');
      return response;
    } catch (error) {
      console.error('Error updating admin note:', error);
      toast.error('Грешка при обновяване на бележка');
      throw error;
    }
  }, [isAdmin]);

  const deleteAdminStudentNote = useCallback(async (studentId, noteId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.deleteAdminStudentNote(studentId, noteId);
      toast.success('Бележката е изтрита успешно');
      return response;
    } catch (error) {
      console.error('Error deleting admin note:', error);
      toast.error('Грешка при изтриване на бележка');
      throw error;
    }
  }, [isAdmin]);

  // ===============================
  // STUDENT STATISTICS 📊 (С isAdmin ПРОВЕРКА)
  // ===============================

  const getStudentStatisticsOverview = useCallback(async () => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false, stats: {} };
    }
    try {
      const data = await academyService.getStudentStatisticsOverview();
      return data;
    } catch (error) {
      console.error('Error fetching student statistics overview:', error);
      return { success: false, stats: {} };
    }
  }, [isAdmin]);

  const getStudentsByStatus = useCallback(async () => {
    if (!isAdmin) {
      return { success: false, statistics: [] };
    }
    try {
      const data = await academyService.getStudentsByStatus();
      return data;
    } catch (error) {
      console.error('Error fetching students by status:', error);
      return { success: false, statistics: [] };
    }
  }, [isAdmin]);

  const getStudentsByMentor = useCallback(async () => {
    if (!isAdmin) {
      return { success: false, statistics: [] };
    }
    try {
      const data = await academyService.getStudentsByMentor();
      return data;
    } catch (error) {
      console.error('Error fetching students by mentor:', error);
      return { success: false, statistics: [] };
    }
  }, [isAdmin]);

  const getStudentsCreditsDistribution = useCallback(async () => {
    if (!isAdmin) {
      return { success: false, distribution: {} };
    }
    try {
      const data = await academyService.getStudentsCreditsDistribution();
      return data;
    } catch (error) {
      console.error('Error fetching credits distribution:', error);
      return { success: false, distribution: {} };
    }
  }, [isAdmin]);

  const getStudentsAttendanceTrends = useCallback(async () => {
    if (!isAdmin) {
      return { success: false, trends: {} };
    }
    try {
      const data = await academyService.getStudentsAttendanceTrends();
      return data;
    } catch (error) {
      console.error('Error fetching attendance trends:', error);
      return { success: false, trends: {} };
    }
  }, [isAdmin]);

  const getTopPerformingStudents = useCallback(async (limit = 10) => {
    if (!isAdmin) {
      return { success: false, topPerformers: [] };
    }
    try {
      const data = await academyService.getTopPerformingStudents(limit);
      return data;
    } catch (error) {
      console.error('Error fetching top performing students:', error);
      return { success: false, topPerformers: [] };
    }
  }, [isAdmin]);

  const getStudentsEngagement = useCallback(async () => {
    if (!isAdmin) {
      return { success: false, engagement: {} };
    }
    try {
      const data = await academyService.getStudentsEngagement();
      return data;
    } catch (error) {
      console.error('Error fetching students engagement:', error);
      return { success: false, engagement: {} };
    }
  }, [isAdmin]);

  // ===============================
  // ADMIN: STUDENT APPLICATIONS MANAGEMENT 📋
  // ===============================

  const getAllStudentApplications = useCallback(async (params = {}) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false, applications: [] };
    }
    try {
      const data = await academyService.getAllStudentApplications(params);
      return data;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      toast.error('Грешка при зареждане на кандидатури');
      throw error;
    }
  }, [isAdmin]);

  const approveStudentApplicationByAdmin = useCallback(async (applicationId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.approveStudentApplicationByAdmin(applicationId);
       if (response.userEmail) {
      const mentorName = response.student?.currentMentor?.name || 'вашият ментор';
      
      await sendPersonalEmail({
        from: 'info@pensa.club',
        to: response.userEmail,
        subject: '🎉 Вашата заявка за обучение е одобрена!',
        message: `Здравейте,

Радваме се да ви съобщим, че вашата заявка за обучение към ментор ${mentorName} беше одобрена от администратор!

Вече можете да започнете обучението си в DigiBridge Academy.

Влезте в профила си, за да видите повече информация и да се свържете с вашия ментор.

С уважение,
Екипът на DigiBridge Academy`
      });
    }
      toast.success('Кандидатурата е одобрена успешно');
      return response;
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Грешка при одобряване на кандидатура');
      throw error;
    }
  }, [isAdmin,sendPersonalEmail]);

  const rejectStudentApplicationByAdmin = useCallback(async (applicationId, reason) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.rejectStudentApplicationByAdmin(applicationId, reason);
       if (response.userEmail) {
      await sendPersonalEmail({
        from: 'info@pensa.club',
        to: response.userEmail,
        subject: 'Информация относно вашата заявка за обучение',
        message: `Здравейте,

За съжаление, вашата заявка за обучение не беше одобрена от администратор.

${reason ? `Причина: ${reason}` : ''}

Можете да кандидатствате отново или да изберете друг ментор от нашата платформа.

С уважение,
Екипът на DigiBridge Academy`
      });
    }
      toast.success('Кандидатурата е отхвърлена');
      return response;
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Грешка при отхвърляне на кандидатура');
      throw error;
    }
  }, [isAdmin, sendPersonalEmail]);

  const reapproveStudentApplicationByAdmin = useCallback(async (applicationId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.reapproveStudentApplicationByAdmin(applicationId);
      if (response.userEmail) {
      const mentorName = response.student?.currentMentor?.name || 'вашият ментор';
      
      await sendPersonalEmail({
        from: 'info@pensa.club',
        to: response.userEmail,
        subject: '🎉 Вашата заявка за обучение е одобрена!',
        message: `Здравейте,

Радваме се да ви съобщим, че вашата заявка за обучение беше преразгледана и одобрена от администратор!

Вече можете да започнете обучението си в DigiBridge Academy с ментор ${mentorName}.

Влезте в профила си, за да видите повече информация и да се свържете с вашия ментор.

С уважение,
Екипът на DigiBridge Academy`
      });
    }
      toast.success('Кандидатурата е одобрена повторно');
      return response;
    } catch (error) {
      console.error('Error reapproving application:', error);
      toast.error('Грешка при повторно одобряване');
      throw error;
    }
  }, [isAdmin, sendPersonalEmail]);

  const deleteStudentApplicationByAdmin = useCallback(async (applicationId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await academyService.deleteStudentApplicationByAdmin(applicationId);
      toast.success('Кандидатурата е изтрита');
      return response;
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Грешка при изтриване на кандидатура');
      throw error;
    }
  }, [isAdmin]);
  // ===============================
  // CONTEXT VALUE
  // ===============================

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({
    // Data
    stats,
    featuredMentors,
    featuredTestimonials,
    isLoading,
    syncSession,
    // Functions
    fetchStats,
    fetchFeaturedMentors,
    fetchFeaturedTestimonials,

    // Email
    sendPersonalEmail,

    // Mentor Application
    applyAsMentor,
    // Mentor Management
    createMentor,
    getAllMentors,
    getMentorById,
    // Admin Notifications
    getAdminNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
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
    // Mentor Reviews:
    createMentorReview,
    getApprovedMentorReviews,
    getMentorReviewStats,
    checkUserMentorReviewStatus,
    // Academy Reviews
    createAcademyReview,
    getApprovedAcademyReviews,
    checkUserAcademyReviewStatus,
    getPendingReviews,
    approveReview,
    rejectReview,
    deleteReview,
    // Mentor Panel
    getMentorDashboardStats,
    getMentorRecentActivity,
    getMentorUpcomingSessions,
    getMentorStudents,
    getMentorPerformanceData,
    getMentorMeetings,
    createMentorMeeting,
    updateMentorMeeting,
    completeMentorMeeting,
    cancelMentorMeeting,
    deleteMentorMeeting,
    getMentorProfile,
    updateMentorProfile,
    getStudentDetails,
    // Student Notes
    getStudentNotes,
    createStudentNote,
    updateStudentNote,
    deleteStudentNote,
    acceptStudent,
    removeStudent,
    getMentorOwnReviews,
    getMentorOwnReviewStats,
    // Student Applications
    applyForMentor,
    getStudentApplications,
    approveStudentApplication,
    rejectStudentApplication,
    deleteStudentApplication,
    reapproveStudentApplication,

    // Admin Students Management 📚
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    updateStudentStatus,
    assignMentorToStudent,
    sendEmailToStudent,

    // Admin Student Notes 📝
    getAdminStudentNotes,
    createAdminStudentNote,
    updateAdminStudentNote,
    deleteAdminStudentNote,

    // Student Statistics 📊
    getStudentStatisticsOverview,
    getStudentsByStatus,
    getStudentsByMentor,
    getStudentsCreditsDistribution,
    getStudentsAttendanceTrends,
    getTopPerformingStudents,
    getStudentsEngagement,

    // Admin Student Applications 📋
    getAllStudentApplications,
    approveStudentApplicationByAdmin,
    rejectStudentApplicationByAdmin,
    deleteStudentApplicationByAdmin,
    reapproveStudentApplicationByAdmin,
  }), [stats, featuredMentors, featuredTestimonials, isLoading]);

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