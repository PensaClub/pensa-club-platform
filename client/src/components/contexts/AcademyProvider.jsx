import { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const [stats, setStats] = useState({
    totalCourses: 15,
    activeMentors: 12,
    totalParticipants: 250,
    countries: 3,
    satisfactionRate: 98
  });

  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ===============================
  // FETCH ФУНКЦИИ
  // ===============================

  const fetchStats = useCallback(async () => {
    try {
      const data = await academyService.getStats();
      setStats(data);
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return stats;
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
      // 1. Изпрати към backend
      const response = await academyService.applyAsMentor(applicationData);

      // 2. Изпрати email към info@pensa.club
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

      // 3. Създай нотификация за админ
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

    // Admin Notifications
    getAdminNotifications,
    markNotificationAsRead,
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