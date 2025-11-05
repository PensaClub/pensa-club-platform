// src/config/notificationConfig.js

export const NOTIFICATION_TYPES = {
  MENTOR_APPLICATION: 'mentor_application',
  MENTOR_APPROVED: 'mentor_approved',
  MENTOR_REJECTED: 'mentor_rejected',
  CHAT_REQUEST: 'chat_request',
  COURSE_ENROLLMENT: 'course_enrollment',
  SYSTEM_ALERT: 'system_alert',
  USER_REPORT: 'user_report',
  ARTICLE_PENDING: 'article_pending',
  ACADEMY_REVIEW: 'academy_review', 
};

export const notificationConfig = {
  [NOTIFICATION_TYPES.MENTOR_APPLICATION]: {
    icon: '🎓',
    color: '#8b5cf6',
    route: '/profile/mentors-applications',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.MENTOR_APPROVED]: {
    icon: '✅',
    color: '#10b981',
    route: '/profile/mentors-overview',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.MENTOR_REJECTED]: {
    icon: '❌',
    color: '#ef4444',
    route: '/profile/mentors-applications',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.CHAT_REQUEST]: {
    icon: '💬',
    color: '#0ea5e9',
    route: '/profile/chat-requests',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.COURSE_ENROLLMENT]: {
    icon: '📚',
    color: '#f59e0b',
    route: '/profile/courses',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: {
    icon: '⚠️',
    color: '#f97316',
    route: '/profile/settings',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.USER_REPORT]: {
    icon: '🚨',
    color: '#dc2626',
    route: '/profile/reports',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.ARTICLE_PENDING]: {
    icon: '📝',
    color: '#6366f1',
    route: '/profile/articles',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.ACADEMY_REVIEW]: { 
    icon: '⭐',
    color: '#ffa500',
    route: '/profile/reviews-management',
    priority: 'medium'
  },
};

// Helper функция за вземане на config
export const getNotificationConfig = (type) => {
  return notificationConfig[type] || {
    icon: '🔔',
    color: '#6b7280',
    route: '/profile',
    priority: 'low'
  };
};