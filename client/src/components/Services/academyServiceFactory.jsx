// src/services/academyService.js

import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const academyServiceFactory = () => {
  const requester = requestFactory();

  return {
    // ===============================
    // САМО ЗА LANDING PAGE
    // ===============================

    // Статистики за About секцията
    getStats: async () => {
      return requester.get(`${apiUrl}/academy/stats`);

      /* 
        BACKEND TODO:
        GET /api/academy/stats
        
        Response: {
          totalCourses: 15,
          activeMentors: 42,
          totalParticipants: 350,
          countries: 3,
          satisfactionRate: 4.8
        }
      */
    },

    // Featured отзиви за Testimonials секцията (3-5 отзива)
    getFeaturedTestimonials: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/testimonials/featured?limit=${limit}`);

      /* 
        BACKEND TODO:
        GET /api/academy/testimonials/featured?limit=5
        
        Response: {
          success: true,
          testimonials: [
            {
              id: 1,
              studentName: "Георги И.",
              studentAvatar: "https://...",
              mentorName: "Мария Петрова",
              text: "Отлична менторка! Научих много за кибер сигурността.",
              rating: 5,
              date: "2024-01-15",
              course: "Digital Security"
            }
          ]
        }
      */
    },

    // ===============================
    // MENTORS ENDPOINTS
    // ===============================

    // 1. Вземане на всички ментори с филтриране
    getAllMentors: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/academy/mentors?${queryString}`);

      /* 
        BACKEND TODO:
        GET /api/academy/mentors?page=1&limit=12&specialization=Digital%20Security&search=мария&availability=available
        
        Query Params:
        - page: number (default: 1)
        - limit: number (default: 12)
        - specialization: string (optional) - "Digital Security" | "Media Literacy" | "Online Banking" | etc.
        - search: string (optional) - search by name
        - availability: string (optional) - "available" | "busy"
        
        Response: {
          success: true,
          mentors: [
            {
              id: 1,
              name: "Мария Петрова",
              age: 24,
              avatar: "https://example.com/avatar.jpg",
              specialization: "Digital Security",
              bio: "Студент по киберсигурност с опит в обучение на възрастни хора",
              availability: "available",  // "available" | "busy"
              studentsCount: 8,
              rating: 5.0,
              experience: "2 години"
            }
          ],
          pagination: {
            page: 1,
            limit: 12,
            total: 42,
            totalPages: 4
          }
        }
      */
    },

    // 2. Вземане на индивидуален ментор
    getMentorById: async (mentorId) => {
      return requester.get(`${apiUrl}/academy/mentors/${mentorId}`);

      /*
        BACKEND TODO:
        GET /api/academy/mentors/:mentorId
        
        Response: {
          success: true,
          mentor: {
            id: 1,
            name: "Мария Петрова",
            age: 24,
            avatar: "https://example.com/avatar.jpg",
            email: "maria@example.com",
            phone: "+359888123456",
            specialization: "Digital Security",
            bio: "Студент по киберсигурност с опит в обучение на възрастни хора...",
            availability: "available",
            studentsCount: 8,
            rating: 5.0,
            experience: "2 години",
            languages: ["bg", "en"],
            education: "ВТУ - Информационна сигурност, Бакалавър 2023",
            certifications: [
              "Certified Ethical Hacker (CEH)",
              "CompTIA Security+"
            ],
            skills: [
              "Penetration Testing",
              "Network Security",
              "Cryptography"
            ],
            testimonials: [
              {
                id: 1,
                studentName: "Георги И.",
                text: "Отлична менторка!",
                rating: 5,
                date: "2024-01-15"
              }
            ],
            socialMedia: {
              linkedin: "https://linkedin.com/in/mariapetrova",
              twitter: "@mariapetrova"
            }
          }
        }
      */
    },

    // 3. Статистики за менторите
    getMentorsStats: async () => {
      return requester.get(`${apiUrl}/academy/mentors/stats`);

      /*
        BACKEND TODO:
        GET /api/academy/mentors/stats
        
        Response: {
          success: true,
          stats: {
            totalMentors: 42,
            availableMentors: 28,
            totalSpecializations: 6,
            averageRating: 4.8,
            totalStudents: 350
          }
        }
      */
    },

    // 4. Featured ментори (за DigiBridgeAcademy.jsx)
    getFeaturedMentors: async (limit = 3) => {
      return requester.get(`${apiUrl}/academy/mentors/featured?limit=${limit}`);

      /*
        BACKEND TODO:
        GET /api/academy/mentors/featured?limit=3
        
        Response: {
          success: true,
          mentors: [
            {
              id: 1,
              name: "Мария Петрова",
              age: 24,
              avatar: "https://example.com/avatar.jpg",
              specialization: "Digital Security",
              bio: "Студент по киберсигурност...",
              availability: "available",
              studentsCount: 8,
              rating: 5.0,
              experience: "2 години",
              featured: true
            }
          ]
        }
      */
    },

    // 5. Кандидатстване за ментор

    applyAsMentor: async (applicationData) => {
      /*
        BACKEND TODO:
        POST /api/academy/mentors/apply
        Content-Type: application/json
        
        Request Body:
        {
          name: string,
          email: string,
          phone: string,
          age: number,
          education: string,
          specialization: string,
          experience: string,
          motivation: string,
          availability: string,
          languages: string[],
          viber: string,
          facebook: string,
          linkedin: string,
          otherContact: string,
          photoUrl: string | null,
          cvUrl: string | null,
          cvOriginalName: string | null,
          cvStoragePath: string | null
        }
        
        Response: {
          success: true,
          message: "Кандидатурата е изпратена успешно!",
          applicationId: 123,
          status: "pending"
        }
      */

      // ✅ Изпращаме само JSON с Firebase URLs (не изпращаме файловете директно)
      const payload = {
        name: applicationData.name,
        email: applicationData.email,
        phone: applicationData.phone,
        age: applicationData.age,
        education: applicationData.education || '',
        specialization: applicationData.specialization || '',
        experience: applicationData.experience || '',
        motivation: applicationData.motivation || '',
        availability: applicationData.availability || '',
        languages: applicationData.languages || [],
        viber: applicationData.viber || '',
        facebook: applicationData.facebook || '',
        linkedin: applicationData.linkedin || '',
        otherContact: applicationData.otherContact || '',
        photoUrl: applicationData.photoUrl || null,
        cvUrl: applicationData.cvUrl || null,
        cvOriginalName: applicationData.cvOriginalName || null,
        cvStoragePath: applicationData.cvStoragePath || null,
      };

      return requester.post(`${apiUrl}/academy/mentors/apply`, payload);
    },
    // 6. Контактна форма към ментор
    contactMentor: async (mentorId, contactData) => {
      /*
        BACKEND TODO:
        POST /api/academy/mentors/:mentorId/contact
        Content-Type: application/json
        
        Request Body:
        {
          name: string,
          email: string,
          phone?: string,
          message: string,
          preferredTime?: string
        }
        
        Response: {
          success: true,
          message: "Съобщението е изпратено успешно!",
          messageId: 789
        }
        
        BACKEND: Изпраща email на ментора с контактната информация
      */
      return requester.post(`${apiUrl}/academy/mentors/${mentorId}/contact`, contactData);
    },

    // ===============================
    // ADMIN NOTIFICATIONS
    // ===============================

    createAdminNotification: async (notificationData) => {
      /*
        BACKEND TODO:
        POST /api/academy/admin/notifications
        Auth: Required (Admin only)
        
        Request Body:
        {
          type: string,  // 'mentor_application' | 'course_enrollment' | 'chat_request' | etc.
          title: string,
          message: string,
          data: object   // Допълнителни данни специфични за типа
        }
        
        Response: {
          success: true,
          notificationId: 456
        }
      */
      return requester.post(`${apiUrl}/academy/admin/notifications`, notificationData);
    },

    getAdminNotifications: async (params = {}) => {
      /*
        BACKEND TODO:
        GET /api/academy/admin/notifications?page=1&limit=20&read=false
        Auth: Required (Admin only)
        
        Query Params:
        - page: number (optional)
        - limit: number (optional)
        - read: boolean (optional) - filter by read status
        
        Response: {
          success: true,
          notifications: [
            {
              id: 456,
              type: 'mentor_application',
              title: 'Нова кандидатура за ментор',
              message: 'Мария Петрова кандидатства за ментор...',
              data: {
                applicationId: 123,
                mentorName: 'Мария Петрова'
              },
              read: false,
              createdAt: '2025-01-15T10:30:00Z'
            }
          ],
          unreadCount: 5,
          pagination: {
            page: 1,
            limit: 20,
            total: 50
          }
        }
      */
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/academy/admin/notifications?${queryString}`);
    },

    markNotificationAsRead: async (notificationId) => {
      /*
        BACKEND TODO:
        PUT /api/academy/admin/notifications/:notificationId/read
        Auth: Required (Admin only)
        
        Response: {
          success: true
        }
      */
      return requester.put(`${apiUrl}/academy/admin/notifications/${notificationId}/read`);
    },
// Маркира ВСИЧКИ нотификации като прочетени
markAllNotificationsAsRead: async () => {
  return requester.put(`${apiUrl}/academy/admin/notifications/mark-all-read`);
  
  /* 
    BACKEND TODO:
    PUT /api/academy/admin/notifications/mark-all-read
    Auth: Required (Admin only)
    
    Response: {
      success: true,
      markedCount: 15
    }
  */
},

// Изтрива нотификация
deleteNotification: async (notificationId) => {
  return requester.delete(`${apiUrl}/academy/admin/notifications/${notificationId}`);
  
  /* 
    BACKEND TODO:
    DELETE /api/academy/admin/notifications/:notificationId
    Auth: Required (Admin only)
    
    Response: {
      success: true
    }
  */
},
    // Вземане на pending кандидатури
    getPendingMentorApplications: async () => {
      return requester.get(`${apiUrl}/academy/mentors/applications/pending`);

      /* 
        BACKEND TODO:
        GET /api/academy/mentors/applications/pending
        Auth: Required (Admin only)
        
        Response: {
          success: true,
          applications: [
            {
              id: 101,
              name: "Даниела Стоянова",
              email: "daniela@example.com",
              phone: "+359888111222",
              age: 25,
              photoUrl: "https://...",
              specialization: "Digital Security",
              education: "ВТУ - Информационна сигурност",
              experience: "1 година опит",
              motivation: "...",
              availability: "Гъвкав график",
              languages: ["bg", "en"],
              viber: "+359888111222",
              facebook: "...",
              linkedin: "...",
              otherContact: "",
              cvUrl: "https://...",
              cvOriginalName: "CV.pdf",
              status: "pending",
              createdAt: "2025-01-28T09:30:00Z"
            }
          ],
          total: 15
        }
      */
    },

    // Отхвърляне на кандидатура
    rejectMentorApplication: async (applicationId, rejectionReason) => {
      return requester.post(`${apiUrl}/academy/mentors/applications/${applicationId}/reject`, {
        rejectionReason
      });

      /* 
        BACKEND TODO:
        POST /api/academy/mentors/applications/:applicationId/reject
        Auth: Required (Admin only)
        
        Request Body:
        {
          "rejectionReason": "Недостатъчен опит в областта"
        }
        
        Response: {
          success: true,
          message: "Кандидатурата беше отхвърлена",
          applicationId: 101
        }
        
        BACKEND ACTION:
        1. Обнови status на кандидатурата от "pending" → "rejected"
        2. Запази rejection reason
        3. Запази rejected_at timestamp
        4. (Опционално) Изпрати email до кандидата
      */
    },
    // ===============================
// MENTOR STATISTICS
// ===============================

/**
 * Взема подробна статистика за всички ментори
 */
getMentorStatistics: async (timeFilter = 'thisMonth') => {
  return requester.get(`${apiUrl}/academy/mentors/statistics?timeFilter=${timeFilter}`);
},

/**
 * Взема само обща статистика (overview)
 */
getMentorStatisticsOverview: async () => {
  return requester.get(`${apiUrl}/academy/mentors/statistics/overview`);
},

/**
 * Взема разпределение по специализация
 */
getMentorsBySpecialization: async () => {
  return requester.get(`${apiUrl}/academy/mentors/statistics/by-specialization`);
},

/**
 * Взема тренд на активност през времето
 */
getMentorActivityTrend: async (months = 6) => {
  return requester.get(`${apiUrl}/academy/mentors/statistics/activity-trend?months=${months}`);
},

/**
 * Взема детайлна статистика за конкретен ментор
 */
getMentorDetailedStatistics: async (mentorId) => {
  return requester.get(`${apiUrl}/academy/mentors/${mentorId}/detailed-statistics`);
},
  };
};

export default academyServiceFactory;