import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const academyServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===============================
    // САМО ЗА LANDING PAGE
    // ===============================

    // Статистики за About секцията
    getStats: async () => {
      return requester.get(`${apiUrl}/academy/stats`);
      // Response: { totalCourses, activeMentors, totalParticipants, countries, satisfactionRate }
    },
    // Featured отзиви за Testimonials секцията (3-5 отзива)
    getFeaturedTestimonials: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/testimonials/featured?limit=${limit}`);
    },
// ===============================
// MENTORS ENDPOINTS
// ===============================

// 1. Вземане на всички ментори с филтриране
getAllMentors: async (params = {}) => {
  // params: { page, limit, specialization, search, availability }
  const queryString = new URLSearchParams(params).toString();
  return requester.get(`${apiUrl}/academy/mentors?${queryString}`);
  
  /* 
    RESPONSE EXAMPLE:
    {
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
        },
        {
          id: 2,
          name: "Иван Георгиев",
          age: 28,
          avatar: "https://example.com/avatar2.jpg",
          specialization: "Media Literacy",
          bio: "Журналист с над 5 години опит в медийна грамотност",
          availability: "busy",
          studentsCount: 12,
          rating: 4.8,
          experience: "3 години"
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
    RESPONSE EXAMPLE:
    {
      success: true,
      mentor: {
        id: 1,
        name: "Мария Петрова",
        age: 24,
        avatar: "https://example.com/avatar.jpg",
        email: "maria@example.com",  // За контакт
        phone: "+359888123456",       // Опционално
        specialization: "Digital Security",
        bio: "Студент по киберсигурност с опит в обучение на възрастни хора. Завършила специалност Информационна сигурност във ВТУ.",
        availability: "available",
        studentsCount: 8,
        rating: 5.0,
        experience: "2 години",
        languages: ["bg", "en"],      // Езици които говори
        education: "ВТУ - Информационна сигурност, Бакалавър 2023",
        certifications: [             // Сертификати
          "Certified Ethical Hacker (CEH)",
          "CompTIA Security+"
        ],
        skills: [                     // Умения
          "Penetration Testing",
          "Network Security",
          "Cryptography"
        ],
        testimonials: [               // Отзиви от ученици
          {
            id: 1,
            studentName: "Георги И.",
            text: "Отлична менторка! Научих много за кибер сигурността.",
            rating: 5,
            date: "2024-01-15"
          }
        ],
        socialMedia: {                // Социални мрежи (опционално)
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
    RESPONSE EXAMPLE:
    {
      success: true,
      stats: {
        totalMentors: 42,           // Общо ментори
        availableMentors: 28,       // Свободни ментори
        totalSpecializations: 6,    // Брой специализации
        averageRating: 4.8,         // Средна оценка
        totalStudents: 350          // Общо ученици
      }
    }
  */
},

// 4. Featured ментори (за DigiBridgeAcademy.jsx)
getFeaturedMentors: async (limit = 3) => {
  return requester.get(`${apiUrl}/academy/mentors/featured?limit=${limit}`);
  
  /*
    RESPONSE EXAMPLE:
    {
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
          featured: true  // Маркирани като featured
        }
      ]
    }
  */
},

// 5. Кандидатстване за ментор
applyAsMentor: async (applicationData) => {
  /*
    REQUEST BODY:
    {
      name: "Иван Иванов",
      email: "ivan@example.com",
      phone: "+359888123456",
      age: 25,
      education: "СУ - Информатика, Магистър 2023",
      specialization: "Digital Security",
      experience: "3 години опит в...",
      motivation: "Искам да помагам на...",
      availability: "Уикенди и вечери",
      languages: ["bg", "en"],
      cv: File  // Опционално - CV файл
    }
  */
  return requester.post(`${apiUrl}/academy/mentors/apply`, applicationData);
  
  /*
    RESPONSE EXAMPLE:
    {
      success: true,
      message: "Кандидатурата е изпратена успешно! Ще се свържем с теб до 5 работни дни.",
      applicationId: 123,
      status: "pending"  // "pending" | "approved" | "rejected"
    }
  */
},

// 6. Контактна форма към ментор
contactMentor: async (mentorId, contactData) => {
  /*
    REQUEST BODY:
    {
      name: "Георги Петров",
      email: "georgi@example.com",
      phone: "+359888987654",  // Опционално
      message: "Здравейте, искам да се запиша за...",
      preferredTime: "Вечерно време след 18:00"  // Опционално
    }
  */
  return requester.post(`${apiUrl}/academy/mentors/${mentorId}/contact`, contactData);
  
  /*
    RESPONSE EXAMPLE:
    {
      success: true,
      message: "Съобщението е изпратено успешно! Менторът ще ти отговори скоро.",
      messageId: 456
    }
  */
},
  };
};

export default academyServiceFactory;