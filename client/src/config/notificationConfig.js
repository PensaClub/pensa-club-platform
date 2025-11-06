// src/config/notificationConfig.js

export const NOTIFICATION_TYPES = {
  // ADMIN NOTIFICATIONS
  MENTOR_APPLICATION: 'mentor_application',
  MENTOR_APPROVED: 'mentor_approved',
  MENTOR_REJECTED: 'mentor_rejected',
  CHAT_REQUEST: 'chat_request',
  COURSE_ENROLLMENT: 'course_enrollment',
  SYSTEM_ALERT: 'system_alert',
  USER_REPORT: 'user_report',
  ARTICLE_PENDING: 'article_pending',
  ACADEMY_REVIEW: 'academy_review',
  MENTOR_REVIEW: 'mentor_review',

  // USER NOTIFICATIONS
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
  REVIEW_DELETED: 'review_deleted',
  MENTOR_APPLICATION_APPROVED: 'mentor_application_approved',
  MENTOR_APPLICATION_REJECTED: 'mentor_application_rejected',
};

export const notificationConfig = {
  // ADMIN NOTIFICATIONS
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
  [NOTIFICATION_TYPES.MENTOR_REVIEW]: {
    icon: '⭐',
    color: '#ffa500',
    route: '/profile/reviews-management',
    priority: 'medium'
  },

  // USER NOTIFICATIONS
  [NOTIFICATION_TYPES.REVIEW_APPROVED]: {
    icon: '✅',
    color: '#10b981',
    route: '/academy',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.REVIEW_REJECTED]: {
    icon: '❌',
    color: '#ef4444',
    route: '/academy',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.REVIEW_DELETED]: {
    icon: '🗑️',
    color: '#6b7280',
    route: '/academy',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.MENTOR_APPLICATION_APPROVED]: {
    icon: '🎉',
    color: '#10b981',
    route: '/academy/mentors',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.MENTOR_APPLICATION_REJECTED]: {
    icon: '❌',
    color: '#ef4444',
    route: '/profile',
    priority: 'medium'
  },
};

export const getNotificationConfig = (type) => {
  return notificationConfig[type] || {
    icon: '🔔',
    color: '#6b7280',
    route: '/profile',
    priority: 'low'
  };
};

export const getNotificationRoute = (notification) => {
  const config = getNotificationConfig(notification.type);

  if (
    notification.type === NOTIFICATION_TYPES.REVIEW_APPROVED ||
    notification.type === NOTIFICATION_TYPES.REVIEW_REJECTED ||
    notification.type === NOTIFICATION_TYPES.REVIEW_DELETED
  ) {
    const reviewType = notification.data?.reviewType;

    if (reviewType === 'mentor') {
      return '/academy/mentors';
    } else if (reviewType === 'academy') {
      return '/academy';
    }
  }

  return config.route;
};