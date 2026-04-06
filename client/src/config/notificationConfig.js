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

  // ReAction (Admin)
  REACTION_VISIT_REQUEST: 'reaction_visit_request',
  REACTION_REQUEST_CANCELLED: 'reaction_request_cancelled',
  REACTION_PROBLEM: 'reaction_problem',

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

  // Seminar notifications
  SEMINAR_REGISTERED: 'seminar_registered',
  SEMINAR_NEW_REGISTRATION: 'seminar_new_registration',
  SEMINAR_ATTENDED: 'seminar_attended',
  SEMINAR_ATTENDANCE_RECORDED: 'seminar_attendance_recorded',
  SEMINAR_MEDIA_UPLOADED: 'seminar_media_uploaded',
  SEMINAR_NEW_REVIEW: 'seminar_new_review',
  SEMINAR_REVIEW_APPROVED: 'seminar_review_approved',

  // ReAction notifications (User)
  REACTION_REQUEST_STATUS_CHANGED: 'reaction_request_status_changed',
  REACTION_MENTOR_ASSIGNED: 'reaction_mentor_assigned',
  REACTION_VISIT_CONFIRMED: 'reaction_visit_confirmed',
  REACTION_VISIT_REMINDER: 'reaction_visit_reminder',

  // Forum notifications
  FORUM_COMMENT: 'forum_comment',
  FORUM_REPLY: 'forum_reply',
  FORUM_MENTION: 'forum_mention',
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
  [NOTIFICATION_TYPES.SEMINAR_NEW_REVIEW]: {
    icon: '⭐',
    color: '#f59e0b',
    route: '/academy/admin/seminar-reviews',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.SEMINAR_NEW_REGISTRATION]: {
    icon: '👤',
    color: '#3b82f6',
    route: '/academy/admin/seminar-attendance',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.SEMINAR_REGISTERED]: {
    icon: '📋',
    color: '#10b981',
    route: '/academy/seminars',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.SEMINAR_ATTENDED]: {
    icon: '✅',
    color: '#10b981',
    route: '/academy/seminars',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.SEMINAR_ATTENDANCE_RECORDED]: {
    icon: '📝',
    color: '#00d2ff',
    route: '/academy/admin/seminar-attendance',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.SEMINAR_MEDIA_UPLOADED]: {
    icon: '📎',
    color: '#d4a853',
    route: '/academy/admin/seminars#library',
    priority: 'low'
  },
  [NOTIFICATION_TYPES.SEMINAR_REVIEW_APPROVED]: {
    icon: '⭐',
    color: '#10b981',
    route: '/academy/seminars',
    priority: 'low'
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
  // REACTION (Admin)
  // ===============================
  [NOTIFICATION_TYPES.REACTION_VISIT_REQUEST]: {
    icon: '📋',
    color: '#f78da7',
    route: '/admin/reaction',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.REACTION_REQUEST_CANCELLED]: {
    icon: '❌',
    color: '#dc2626',
    route: '/admin/reaction',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.REACTION_PROBLEM]: {
    icon: '🚨',
    color: '#dc2626',
    route: '/admin/reaction',
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

  // ===============================
  // REACTION NOTIFICATIONS (User)
  // ===============================
  [NOTIFICATION_TYPES.REACTION_REQUEST_STATUS_CHANGED]: {
    icon: '🔄',
    color: '#f59e0b',
    route: '/reaction/my',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.REACTION_MENTOR_ASSIGNED]: {
    icon: '🤝',
    color: '#8b5cf6',
    route: '/reaction/my',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.REACTION_VISIT_CONFIRMED]: {
    icon: '✅',
    color: '#10b981',
    route: '/reaction/my',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.REACTION_VISIT_REMINDER]: {
    icon: '⏰',
    color: '#3b82f6',
    route: '/reaction/my',
    priority: 'high'
  },

  // Forum
  [NOTIFICATION_TYPES.FORUM_COMMENT]: {
    icon: '💬',
    color: '#8b2040',
    route: '/academy/community',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.FORUM_REPLY]: {
    icon: '↩️',
    color: '#8b2040',
    route: '/academy/community',
    priority: 'medium'
  },
  [NOTIFICATION_TYPES.FORUM_MENTION]: {
    icon: '@',
    color: '#d4a853',
    route: '/academy/community',
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

  // ✅ ReAction notifications (User) - винаги към /reaction/my
  if (
    notification.type === NOTIFICATION_TYPES.REACTION_REQUEST_STATUS_CHANGED ||
    notification.type === NOTIFICATION_TYPES.REACTION_MENTOR_ASSIGNED ||
    notification.type === NOTIFICATION_TYPES.REACTION_VISIT_CONFIRMED ||
    notification.type === NOTIFICATION_TYPES.REACTION_VISIT_REMINDER
  ) {
    return '/reaction/my';
  }

  // ✅ ReAction admin notifications - директно към заявката
  if (
    notification.type === NOTIFICATION_TYPES.REACTION_VISIT_REQUEST ||
    notification.type === NOTIFICATION_TYPES.REACTION_REQUEST_CANCELLED ||
    notification.type === NOTIFICATION_TYPES.REACTION_PROBLEM
  ) {
    const requestId = notification.data?.requestId;
    if (requestId) {
      return `/admin/reaction?requestId=${requestId}`;
    }
    return '/admin/reaction';
  }

  // Forum notifications — link to post
  if (
    notification.type === NOTIFICATION_TYPES.FORUM_COMMENT ||
    notification.type === NOTIFICATION_TYPES.FORUM_REPLY ||
    notification.type === NOTIFICATION_TYPES.FORUM_MENTION
  ) {
    const postSlug = notification.data?.postSlug;
    if (postSlug) return `/academy/community/post/${postSlug}`;
    return '/academy/community';
  }

  // Seminar notifications
  if (notification.data?.url) {
    return notification.data.url;
  }

  if (notification.data?.slug) {
    return `/academy/seminars/${notification.data.slug}`;
  }

  return config.route;
};