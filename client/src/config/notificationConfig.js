// src/config/notificationConfig.js

export const NOTIFICATION_TYPES = {
  // ===============================
  // ADMIN NOTIFICATIONS
  // ===============================
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
  COURSE_REVIEW: 'course_review',
  LECTURE_REVIEW: 'lecture_review',

  // Student Applications (Admin)
  STUDENT_APPLICATION: 'student_application',
  STUDENT_APPLICATION_APPROVED: 'student_application_approved',
  STUDENT_APPLICATION_REJECTED: 'student_application_rejected',
  STUDENT_APPLICATION_APPROVED_BY_ADMIN: 'student_application_approved_by_admin',
  STUDENT_APPLICATION_REJECTED_BY_ADMIN: 'student_application_rejected_by_admin',
  STUDENT_APPLICATION_REAPPROVED: 'student_application_reapproved',

  // Fact Check (Admin)
  FACT_CHECK_SIGNAL: 'fact_check_signal',

  // Student Management (Admin)
  STUDENT_UPDATED: 'student_updated',
  STUDENT_DELETED: 'student_deleted',
  STUDENT_STATUS_CHANGED: 'student_status_changed',
  STUDENT_MENTOR_ASSIGNED: 'student_mentor_assigned',
  ADMIN_NOTE_CREATED: 'admin_note_created',

  // ===============================
  // USER NOTIFICATIONS
  // ===============================
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
  REVIEW_DELETED: 'review_deleted',
  MENTOR_APPLICATION_APPROVED: 'mentor_application_approved',
  MENTOR_APPLICATION_REJECTED: 'mentor_application_rejected',

  // Student notifications (User)
  MENTOR_ASSIGNED: 'mentor_assigned',
  STATUS_CHANGED: 'status_changed',
  APPLICATION_REAPPROVED: 'application_reapproved',
};

export const notificationConfig = {
  // ===============================
  // ADMIN NOTIFICATIONS
  // ===============================
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
  [NOTIFICATION_TYPES.COURSE_REVIEW]: {
    icon: '⭐',
    color: '#ffa500',
    route: '/profile/reviews-management',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.LECTURE_REVIEW]: {
    icon: '⭐',
    color: '#ffa500',
    route: '/profile/reviews-management',
    priority: 'medium'
  },

  // ===============================
  // FACT CHECK (Admin)
  // ===============================
  [NOTIFICATION_TYPES.FACT_CHECK_SIGNAL]: {
    icon: '🔍',
    color: '#f78da7',
    route: '/admin/fact-check',
    priority: 'high'
  },

  // ===============================
  // STUDENT APPLICATIONS (Admin)
  // ===============================
  [NOTIFICATION_TYPES.STUDENT_APPLICATION]: {
    icon: '📋',
    color: '#3b82f6',
    route: '/profile/students-applications',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.STUDENT_APPLICATION_APPROVED]: {
    icon: '✅',
    color: '#10b981',
    route: '/profile/students-overview',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.STUDENT_APPLICATION_REJECTED]: {
    icon: '❌',
    color: '#ef4444',
    route: '/profile/students-applications',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.STUDENT_APPLICATION_APPROVED_BY_ADMIN]: {
    icon: '✅',
    color: '#10b981',
    route: '/profile/students-overview',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.STUDENT_APPLICATION_REJECTED_BY_ADMIN]: {
    icon: '❌',
    color: '#ef4444',
    route: '/profile/students-applications',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.STUDENT_APPLICATION_REAPPROVED]: {
    icon: '🔄',
    color: '#10b981',
    route: '/profile/students-overview',
    priority: 'medium'
  },

  // ===============================
  // STUDENT MANAGEMENT (Admin)
  // ===============================
  [NOTIFICATION_TYPES.STUDENT_UPDATED]: {
    icon: '✏️',
    color: '#6366f1',
    route: '/profile/students-overview',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.STUDENT_DELETED]: {
    icon: '🗑️',
    color: '#ef4444',
    route: '/profile/students-overview',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.STUDENT_STATUS_CHANGED]: {
    icon: '🔄',
    color: '#f59e0b',
    route: '/profile/students-overview',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.STUDENT_MENTOR_ASSIGNED]: {
    icon: '🤝',
    color: '#8b5cf6',
    route: '/profile/students-overview',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.ADMIN_NOTE_CREATED]: {
    icon: '📝',
    color: '#6b7280',
    route: '/profile/students-overview',
    priority: 'low'
  },

  // ===============================
  // USER NOTIFICATIONS
  // ===============================
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

  // ===============================
  // STUDENT NOTIFICATIONS (User)
  // ===============================
  [NOTIFICATION_TYPES.MENTOR_ASSIGNED]: {
    icon: '🤝',
    color: '#8b5cf6',
    route: '/student-panel',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.STATUS_CHANGED]: {
    icon: '🔄',
    color: '#f59e0b',
    route: '/student-panel',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.APPLICATION_REAPPROVED]: {
    icon: '🎉',
    color: '#10b981',
    route: '/student-panel',
    priority: 'high'
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

  // ✅ Review notifications - динамичен route
  if (
    notification.type === NOTIFICATION_TYPES.REVIEW_APPROVED ||
    notification.type === NOTIFICATION_TYPES.REVIEW_REJECTED ||
    notification.type === NOTIFICATION_TYPES.REVIEW_DELETED
  ) {
    const reviewType = notification.data?.reviewType;
    if (reviewType === 'mentor') return '/academy/mentors';
    if (reviewType === 'academy') return '/academy';
  }

  // ✅ Student application notifications (User) - винаги към student-panel
  if (
    notification.type === NOTIFICATION_TYPES.STUDENT_APPLICATION_APPROVED ||
    notification.type === NOTIFICATION_TYPES.STUDENT_APPLICATION_REJECTED ||
    notification.type === NOTIFICATION_TYPES.STUDENT_APPLICATION_REAPPROVED ||
    notification.type === NOTIFICATION_TYPES.APPLICATION_REAPPROVED ||
    notification.type === NOTIFICATION_TYPES.MENTOR_ASSIGNED ||
    notification.type === NOTIFICATION_TYPES.STATUS_CHANGED
  ) {
    // Ако е user notification (има userId), отиди на student-panel
    if (notification.userId) {
      return '/student-panel';
    }
  }

  return config.route;
};