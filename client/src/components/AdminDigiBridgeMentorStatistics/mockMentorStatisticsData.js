// src/components/AdminDigiBridgeMentorStatistics/mockMentorStatisticsData.js

export const MOCK_MENTORS_DETAILED = [
  {
    id: 1,
    userId: "user_001",
    name: "Мария Петрова",
    email: "maria.petrova@example.com",
    phone: "+359888123456",
    age: 24,
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    specialization: "Digital Security",
    education: "СУ - Киберсигурност, Бакалавър 2023",
    experience: "2 години опит в обучение на възрастни хора",
    studentsCount: 15,
    rating: 4.9,
    sessionsCount: 58,
    isOnline: true,
    status: "approved",
    createdAt: "2025-01-10T10:00:00Z",
    approvedAt: "2025-01-11T14:30:00Z",
    lastActiveAt: "2025-01-28T11:00:00Z",
    
    courses: {
      completed: 11,
      active: 3,
      total: 14
    },
    
    onlineTime: {
      thisMonth: 45,
      total: 320,
      lastOnline: "2025-01-28T11:00:00Z"
    },
    
    activity: {
      activeDaysLast30: 22,
      sessionsThisMonth: 18,
      sessionsLastMonth: 15,
      averageSessionDuration: 50
    },
    
    quality: {
      completionRate: 96,
      canceledSessions: 2,
      responseTime: 10,
      studentRetentionRate: 92
    },
    
    reviews: {
      total: 48,
      rating: 4.9,
      recommendationRate: 98
    }
  },
  {
    id: 2,
    userId: "user_002",
    name: "Иван Георгиев",
    email: "ivan.georgiev@example.com",
    phone: "+359887654321",
    age: 28,
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    specialization: "Social Media",
    education: "НБУ - Комуникации и дигитални медии",
    experience: "3 години опит като социален мениджър",
    studentsCount: 10,
    rating: 4.7,
    sessionsCount: 38,
    isOnline: false,
    status: "approved",
    createdAt: "2025-01-12T09:00:00Z",
    approvedAt: "2025-01-13T16:00:00Z",
    lastActiveAt: "2025-01-27T18:30:00Z",
    
    courses: {
      completed: 8,
      active: 2,
      total: 10
    },
    
    onlineTime: {
      thisMonth: 32,
      total: 245,
      lastOnline: "2025-01-27T18:30:00Z"
    },
    
    activity: {
      activeDaysLast30: 18,
      sessionsThisMonth: 12,
      sessionsLastMonth: 14,
      averageSessionDuration: 45
    },
    
    quality: {
      completionRate: 94,
      canceledSessions: 3,
      responseTime: 15,
      studentRetentionRate: 85
    },
    
    reviews: {
      total: 35,
      rating: 4.7,
      recommendationRate: 94
    }
  },
  {
    id: 3,
    userId: "user_003",
    name: "Елена Димитрова",
    email: "elena.dimitrova@example.com",
    phone: "+359889999888",
    age: 26,
    photoUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    specialization: "Online Banking",
    education: "УНСС - Финанси и банкиране",
    experience: "4 години в банков сектор",
    studentsCount: 18,
    rating: 5.0,
    sessionsCount: 72,
    isOnline: true,
    status: "approved",
    createdAt: "2025-01-08T14:00:00Z",
    approvedAt: "2025-01-09T10:30:00Z",
    lastActiveAt: "2025-01-28T09:15:00Z",
    
    courses: {
      completed: 13,
      active: 4,
      total: 17
    },
    
    onlineTime: {
      thisMonth: 52,
      total: 410,
      lastOnline: "2025-01-28T09:15:00Z"
    },
    
    activity: {
      activeDaysLast30: 25,
      sessionsThisMonth: 22,
      sessionsLastMonth: 20,
      averageSessionDuration: 55
    },
    
    quality: {
      completionRate: 98,
      canceledSessions: 1,
      responseTime: 8,
      studentRetentionRate: 95
    },
    
    reviews: {
      total: 65,
      rating: 5.0,
      recommendationRate: 100
    }
  },
  {
    id: 4,
    userId: "user_004",
    name: "Петър Николов",
    email: "peter.nikolov@example.com",
    phone: "+359888777666",
    age: 32,
    photoUrl: "https://randomuser.me/api/portraits/men/52.jpg",
    specialization: "Media Literacy",
    education: "СУ - Журналистика",
    experience: "5 години в медиен сектор",
    studentsCount: 8,
    rating: 4.6,
    sessionsCount: 28,
    isOnline: true,
    status: "approved",
    createdAt: "2025-01-15T11:00:00Z",
    approvedAt: "2025-01-16T09:00:00Z",
    lastActiveAt: "2025-01-28T10:00:00Z",
    
    courses: {
      completed: 6,
      active: 2,
      total: 8
    },
    
    onlineTime: {
      thisMonth: 28,
      total: 180,
      lastOnline: "2025-01-28T10:00:00Z"
    },
    
    activity: {
      activeDaysLast30: 15,
      sessionsThisMonth: 10,
      sessionsLastMonth: 9,
      averageSessionDuration: 42
    },
    
    quality: {
      completionRate: 92,
      canceledSessions: 2,
      responseTime: 18,
      studentRetentionRate: 82
    },
    
    reviews: {
      total: 25,
      rating: 4.6,
      recommendationRate: 88
    }
  },
  {
    id: 5,
    userId: "user_005",
    name: "Анна Стоянова",
    email: "anna.stoyanova@example.com",
    phone: "+359887555444",
    age: 29,
    photoUrl: "https://randomuser.me/api/portraits/women/38.jpg",
    specialization: "E-Government",
    education: "УНСС - Публична администрация",
    experience: "3 години в администрация",
    studentsCount: 12,
    rating: 4.8,
    sessionsCount: 45,
    isOnline: false,
    status: "approved",
    createdAt: "2025-01-20T13:00:00Z",
    approvedAt: "2025-01-21T15:00:00Z",
    lastActiveAt: "2025-01-27T16:45:00Z",
    
    courses: {
      completed: 9,
      active: 3,
      total: 12
    },
    
    onlineTime: {
      thisMonth: 38,
      total: 280,
      lastOnline: "2025-01-27T16:45:00Z"
    },
    
    activity: {
      activeDaysLast30: 20,
      sessionsThisMonth: 15,
      sessionsLastMonth: 13,
      averageSessionDuration: 48
    },
    
    quality: {
      completionRate: 95,
      canceledSessions: 2,
      responseTime: 12,
      studentRetentionRate: 90
    },
    
    reviews: {
      total: 42,
      rating: 4.8,
      recommendationRate: 95
    }
  }
];

// Функция за изчисляване на обща статистика
export const calculateOverallStats = (mentors) => {
  const activeMentors = mentors.filter(m => m.isOnline).length;
  const totalStudents = mentors.reduce((sum, m) => sum + m.studentsCount, 0);
  const averageRating = (mentors.reduce((sum, m) => sum + m.rating, 0) / mentors.length).toFixed(1);
  const totalCoursesCompleted = mentors.reduce((sum, m) => sum + m.courses.completed, 0);
  const totalSessionsThisMonth = mentors.reduce((sum, m) => sum + m.activity.sessionsThisMonth, 0);
  const totalOnlineHours = mentors.reduce((sum, m) => sum + m.onlineTime.thisMonth, 0);
  const averageCompletionRate = (mentors.reduce((sum, m) => sum + m.quality.completionRate, 0) / mentors.length).toFixed(0);
  const totalReviews = mentors.reduce((sum, m) => sum + m.reviews.total, 0);

  return {
    activeMentors,
    totalMentors: mentors.length,
    totalStudents,
    averageRating: parseFloat(averageRating),
    totalCoursesCompleted,
    totalSessionsThisMonth,
    totalOnlineHours,
    averageCompletionRate: parseInt(averageCompletionRate),
    totalReviews
  };
};