// server/src/controllers/mentorDashboardController.js

const mentorDashboardController = require('express').Router();

const { mentor } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const { getMentorCombinedStats } = require('../services/mentorActivityService');

// ===============================
// HELPER: Get mentor ID from logged user
// ===============================
const getMentorIdFromUser = async (userId) => {
  const mentorRecord = await mentor.findOne({
    where: { userId },
    attributes: ['id']
  });

  if (!mentorRecord) {
    throw new Error('You are not registered as a mentor');
  }

  return mentorRecord.id;
};

// ===============================
// GET /api/mentors/dashboard/stats
// Dashboard Overview Stats
// ===============================
mentorDashboardController.get(
  '/stats',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      // ✅ 1. Вземи mentor ID от logged-in user
      const userId = req.user.userId;

      const mentorId = await getMentorIdFromUser(userId);
      // ✅ 2. Вземи combined stats
      const combinedStats = await getMentorCombinedStats(mentorId);

      // ✅ 3. Format response за frontend
      const dashboardStats = {
        totalStudents: combinedStats.studentsCount || 0,
        activeSessions: combinedStats.firebaseStats.activeSessions || 0,
        completedSessions: combinedStats.firebaseStats.completedSessions || 0,
        totalOnlineHours: combinedStats.firebaseStats.totalOnlineHours || 0,
        averageRating: combinedStats.reviewsAvgRating || 0,
        totalReviews: combinedStats.reviewsCount || 0,
        totalMessages: combinedStats.firebaseStats.totalMessages || 0,
        averageResponseTime: combinedStats.firebaseStats.averageResponseTime || 0
      };

      res.status(200).json({
        success: true,
        stats: dashboardStats
      });

    } catch (err) {
      console.error('❌ [GET MENTOR DASHBOARD STATS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// GET /api/mentors/dashboard/recent-activity
// Recent Activity (REAL DATA)
// ===============================
mentorDashboardController.get(
  '/recent-activity',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      const userId = req.user.userId;

      const mentorId = await getMentorIdFromUser(userId);

      // ✅ ВЗЕМИ МЕНТОР DATA ЗА EMAIL
      const { user_account, review } = require('../sequelize/models/index');
      const { getFirebaseDb } = require('../firebase/firebaseAdmin');

      const mentorData = await mentor.findByPk(mentorId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['email']
          }
        ]
      });

      if (!mentorData) {
        throw new Error('Mentor not found');
      }

      const activities = [];
      const db = getFirebaseDb();
      const mentorEmail = mentorData.user.email;
      const firebaseMentorId = mentorEmail
        .replace(/\./g, '_dot_')
        .replace(/@/g, '_at_');

      // ✅ 1. COMPLETED SESSIONS от Firebase
      try {
        const sessionsRef = db.ref(`mentor_sessions/${firebaseMentorId}`);
        const sessionsSnapshot = await sessionsRef
          .orderByChild('endTime')
          .limitToLast(5)
          .once('value');

        const sessions = sessionsSnapshot.val() || {};

        Object.entries(sessions).forEach(([sessionId, session]) => {
          if (session.endTime && session.startTime) {
            const durationMinutes = Math.floor((session.endTime - session.startTime) / 60000);

            activities.push({
              id: `session_${sessionId}`,
              type: 'session_completed',
              title: 'Завършена сесия',
              description: `Проведохте ${durationMinutes} минутна сесия`,
              timestamp: new Date(session.endTime).toISOString(),
              icon: 'check-circle'
            });
          }
        });
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }

      // ✅ 2. RECEIVED REVIEWS от PostgreSQL
      try {
        const reviews = await review.findAll({
          where: {
            reviewType: 'mentor',
            targetId: mentorId,
            status: 'approved'
          },
          order: [['approvedAt', 'DESC']],
          limit: 5,
          attributes: ['id', 'rating', 'name', 'approvedAt']
        });

        reviews.forEach(rev => {
          activities.push({
            id: `review_${rev.id}`,
            type: 'review_received',
            title: 'Получено ревю',
            description: `${rev.name} ви даде ${rev.rating} ${rev.rating === 1 ? 'звезда' : 'звезди'}`,
            timestamp: rev.approvedAt.toISOString(),
            icon: 'star'
          });
        });
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }

      // ✅ 3. NEW STUDENTS от Firebase conversations
      try {
        const conversationsRef = db.ref('chat_conversations');
        const conversationsSnapshot = await conversationsRef
          .orderByChild('mentorId')
          .equalTo(firebaseMentorId)
          .once('value');

        const conversations = conversationsSnapshot.val() || {};
        const conversationsList = Object.entries(conversations)
          .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
          .slice(0, 5);

        conversationsList.forEach(([convId, conv]) => {
          if (conv.createdAt) {
            activities.push({
              id: `student_${convId}`,
              type: 'new_student',
              title: 'Нов ученик',
              description: `${conv.userName || 'Нов потребител'} започна консултация с вас`,
              timestamp: new Date(conv.createdAt).toISOString(),
              icon: 'user-plus'
            });
          }
        });
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }

      // ✅ СОРТИРАЙ ПО TIMESTAMP (най-новите първи)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // ✅ ОГРАНИЧИ ДО LIMIT
      const limitedActivities = activities.slice(0, parseInt(limit));

      res.status(200).json({
        success: true,
        activities: limitedActivities,
        total: limitedActivities.length
      });

    } catch (err) {
      console.error('❌ [GET RECENT ACTIVITY] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// GET /api/mentors/dashboard/upcoming-sessions
// Вземи предстоящи срещи
// ===============================
mentorDashboardController.get(
  '/upcoming-sessions',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { limit = 10 } = req.query;

      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_meeting, student, user_account, user_details } = require('../sequelize/models/index');
      const { Op } = require('sequelize');

      // Вземи предстоящи meetings
      const meetings = await mentor_meeting.findAll({
        where: {
          mentorId: mentorId,
          status: 'scheduled',
          meetingDate: {
            [Op.gte]: new Date().toISOString().split('T')[0]
          }
        },
        include: [
          {
            model: student,
            as: 'student',
            attributes: ['id', 'avatar', 'userId'],
            include: [
              {
                model: user_account,
                as: 'user',
                attributes: ['email'],
                include: [
                  {
                    model: user_details,
                    as: 'details',
                    attributes: ['username', 'firstName', 'lastName']
                  }
                ]
              }
            ]
          }
        ],
        order: [['meetingDate', 'ASC'], ['meetingTime', 'ASC']],
        limit: parseInt(limit)
      });

      // Форматирай резултата
      const sessions = meetings.map(m => {
        const meeting = m.get({ plain: true });
        const studentName = meeting.student?.user?.details?.username ||
          `${meeting.student?.user?.details?.firstName || ''} ${meeting.student?.user?.details?.lastName || ''}`.trim() ||
          meeting.student?.user?.email?.split('@')[0] ||
          'Unknown';

        return {
          id: meeting.id,
          studentName: studentName,
          studentAvatar: meeting.student?.avatar || null,
          topic: meeting.title,
          dateTime: `${meeting.meetingDate}T${meeting.meetingTime}`,
          duration: meeting.duration,
          notes: meeting.notes,
          status: meeting.status
        };
      });

      res.status(200).json({
        success: true,
        sessions: sessions
      });

    } catch (err) {
      console.error('❌ [GET UPCOMING SESSIONS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// GET /api/mentors/dashboard/students
// Вземи всички студенти на ментора
// ===============================
mentorDashboardController.get(
  '/students',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);

      const { student, user_account, user_details } = require('../sequelize/models/index');

      // ✅ Вземи студентите С IMAGEURL
      const students = await student.findAll({
        where: {
          currentMentorId: mentorId,
          status: 'active'
        },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['email'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName', 'phoneNumber', 'imageURL']  
              }
            ]
          }
        ],
        order: [['mentorAssignedDate', 'DESC']]
      });

      // ✅ Форматирай резултата
      const formattedStudents = students.map(s => {
        const studentData = s.get({ plain: true });
        const name = studentData.user?.details?.username ||
          `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
          studentData.user?.email?.split('@')[0] ||
          'Unknown';

        return {
          id: studentData.id,
          name: name,
          email: studentData.user?.email,
          avatar: studentData.avatar || studentData.user?.details?.imageURL || null,  // ✅ ФИКСИРАН AVATAR
          phone: studentData.phone || studentData.user?.details?.phoneNumber || null,  // ✅ ДОБАВЕН ТЕЛЕФОН
          registrationDate: studentData.registrationDate,  // ✅ ДОБАВЕНА ДАТА НА РЕГИСТРАЦИЯ
          totalCredits: studentData.totalCreditsEarned,
          attendance: studentData.attendedSessions,
          lastActive: studentData.lastActiveAt,
          status: studentData.status
        };
      });

      res.status(200).json({
        success: true,
        students: formattedStudents
      });

    } catch (err) {
      console.error('❌ [GET MENTOR STUDENTS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// GET /api/mentors/dashboard/performance
// Вземи performance данни за последните 7 дни
// ===============================
mentorDashboardController.get(
  '/performance',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_activity_snapshot } = require('../sequelize/models/index');
      const { Op } = require('sequelize');

      // Вземи последните 7 дни
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // -6 за да включи днес = 7 дни

      // Query snapshots за последните 7 дни
      const snapshots = await mentor_activity_snapshot.findAll({
        where: {
          mentorId: mentorId,
          snapshotDate: {
            [Op.gte]: sevenDaysAgo.toISOString().split('T')[0],
            [Op.lte]: today.toISOString().split('T')[0]
          }
        },
        order: [['snapshotDate', 'ASC']],
        raw: true
      });

      // Създай map от датите
      const dataMap = new Map();
      snapshots.forEach(snapshot => {
        dataMap.set(snapshot.snapshotDate, snapshot);
      });

      // Генерирай labels и data за последните 7 дни (дори ако няма данни)
      const daysOfWeek = ['Нед', 'Пон', 'Вт', 'Ср', 'Четв', 'Пет', 'Съб'];
      const labels = [];
      const sessionsData = [];
      const messagesData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = daysOfWeek[date.getDay()];

        labels.push(dayName);

        const snapshot = dataMap.get(dateStr);
        sessionsData.push(snapshot ? (snapshot.totalSessions || 0) : 0);
        messagesData.push(snapshot ? (snapshot.firebaseMessagesCount || 0) : 0);
      }

      const performanceData = {
        labels: labels,
        datasets: [
          {
            label: 'Сесии',
            data: sessionsData
          },
          {
            label: 'Съобщения',
            data: messagesData
          }
        ]
      };

      res.status(200).json({
        success: true,
        data: performanceData,
        hasData: snapshots.length > 0
      });

    } catch (err) {
      console.error('❌ [GET PERFORMANCE] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// GET /api/mentors/dashboard/meetings
// Вземи meetings на ментора
// ===============================
mentorDashboardController.get(
  '/meetings',
  isAuth,
  rbac.checkPermission('meeting', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { status } = req.query;

      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_meeting, student, user_account, user_details } = require('../sequelize/models/index');

      // Build where clause
      const where = { mentorId: mentorId };
      if (status && status !== 'all') {
        where.status = status;
      }

      // Вземи meetings
      const meetings = await mentor_meeting.findAll({
        where,
        include: [
          {
            model: student,
            as: 'student',
            attributes: ['id', 'avatar', 'userId'],
            include: [
              {
                model: user_account,
                as: 'user',
                attributes: ['email'],
                include: [
                  {
                    model: user_details,
                    as: 'details',
                    attributes: ['username', 'firstName', 'lastName']
                  }
                ]
              }
            ]
          }
        ],
        order: [['meetingDate', 'DESC'], ['meetingTime', 'DESC']]
      });

      // Форматирай резултата
      const formattedMeetings = meetings.map(m => {
        const meeting = m.get({ plain: true });
        const studentName = meeting.student?.user?.details?.username ||
          `${meeting.student?.user?.details?.firstName || ''} ${meeting.student?.user?.details?.lastName || ''}`.trim() ||
          meeting.student?.user?.email?.split('@')[0] ||
          'Unknown';

        return {
          id: meeting.id,
          studentId: meeting.studentId,
          studentName: studentName,
          studentAvatar: meeting.student?.avatar || null,
          title: meeting.title,
          scheduledDate: meeting.meetingDate,
          scheduledTime: meeting.meetingTime,
          meetingDate: meeting.meetingDate,
          meetingTime: meeting.meetingTime,
          duration: meeting.duration,
          plannedDuration: meeting.duration,
          notes: meeting.notes,
          status: meeting.status,
          meetingType: meeting.meetingType,
          completedAt: meeting.completedAt,
          cancelledAt: meeting.cancelledAt,
          createdAt: meeting.createdAt,
          updatedAt: meeting.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        meetings: formattedMeetings,
        total: formattedMeetings.length
      });

    } catch (err) {
      console.error('❌ [GET MEETINGS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// POST /api/mentors/dashboard/meetings
// Създай ново meeting
// ===============================
mentorDashboardController.post(
  '/meetings',
  isAuth,
  rbac.checkPermission('meeting', 'create'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);

      const { createMeetingSchema } = require('../schemas/meetings.schema');
      const { mentor_meeting, student } = require('../sequelize/models/index');

      // Валидация
      const validationResult = createMeetingSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      // ✅ Провери дали студентът съществува САМО АКО е подаден
      if (validationResult.data.studentId) {
        const studentData = await student.findByPk(validationResult.data.studentId);

        if (!studentData) {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }

        // Update student scheduled meetings count
        await studentData.update({
          scheduledMeetings: studentData.scheduledMeetings + 1
        });
      }

      // Създай meeting
      const newMeeting = await mentor_meeting.create({
        mentorId: mentorId,
        ...validationResult.data
      });

      res.status(201).json({
        success: true,
        message: 'Meeting created successfully',
        meeting: newMeeting
      });

    } catch (err) {
      console.error('❌ [CREATE MEETING] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// PATCH /api/mentors/dashboard/meetings/:id
// Редактирай meeting
// ===============================
mentorDashboardController.patch(
  '/meetings/:id',
  isAuth,
  rbac.checkPermission('meeting', 'update'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const meetingId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { updateMeetingSchema } = require('../schemas/meetings.schema');
      const { mentor_meeting } = require('../sequelize/models/index');

      // Валидация
      const validationResult = updateMeetingSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      // Намери meeting
      const meeting = await mentor_meeting.findOne({
        where: {
          id: meetingId,
          mentorId: mentorId
        }
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Update meeting
      await meeting.update(validationResult.data);

      res.status(200).json({
        success: true,
        message: 'Meeting updated successfully',
        meeting: meeting
      });

    } catch (err) {
      console.error('❌ [UPDATE MEETING] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// POST /api/mentors/dashboard/meetings/:id/complete
// Завърши meeting
// ===============================
mentorDashboardController.post(
  '/meetings/:id/complete',
  isAuth,
  rbac.checkPermission('meeting', 'update'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const meetingId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { completeMeetingSchema } = require('../schemas/meetings.schema');
      const { mentor_meeting, student } = require('../sequelize/models/index');

      // Валидация
      const validationResult = completeMeetingSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      // Намери meeting
      const meeting = await mentor_meeting.findOne({
        where: {
          id: meetingId,
          mentorId: mentorId
        }
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      if (meeting.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Meeting is already completed'
        });
      }

      // Update meeting
      await meeting.update({
        status: 'completed',
        completedAt: new Date(),
        notes: validationResult.data.notes || meeting.notes
      });

      // Update student stats
      const studentData = await student.findByPk(meeting.studentId);
      if (studentData) {
        await studentData.update({
          completedMeetings: studentData.completedMeetings + 1,
          scheduledMeetings: Math.max(0, studentData.scheduledMeetings - 1)
        });
      }

      res.status(200).json({
        success: true,
        message: 'Meeting completed successfully',
        meeting: meeting
      });

    } catch (err) {
      console.error('❌ [COMPLETE MEETING] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// PATCH /api/mentors/dashboard/meetings/:id/cancel
// Откажи meeting
// ===============================
mentorDashboardController.patch(
  '/meetings/:id/cancel',
  isAuth,
  rbac.checkPermission('meeting', 'update'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const meetingId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_meeting, student } = require('../sequelize/models/index');

      // Намери meeting
      const meeting = await mentor_meeting.findOne({
        where: {
          id: meetingId,
          mentorId: mentorId
        }
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      if (meeting.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Meeting is already cancelled'
        });
      }

      // Update meeting
      await meeting.update({
        status: 'cancelled',
        cancelledAt: new Date()
      });

      // Update student stats
      const studentData = await student.findByPk(meeting.studentId);
      if (studentData && meeting.status === 'scheduled') {
        await studentData.update({
          scheduledMeetings: Math.max(0, studentData.scheduledMeetings - 1)
        });
      }

      res.status(200).json({
        success: true,
        message: 'Meeting cancelled successfully',
        meeting: meeting
      });

    } catch (err) {
      console.error('❌ [CANCEL MEETING] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// DELETE /api/mentors/dashboard/meetings/:id
// Изтрий meeting
// ===============================
mentorDashboardController.delete(
  '/meetings/:id',
  isAuth,
  rbac.checkPermission('meeting', 'delete'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const meetingId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_meeting, student } = require('../sequelize/models/index');

      // Намери meeting
      const meeting = await mentor_meeting.findOne({
        where: {
          id: meetingId,
          mentorId: mentorId
        }
      });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      const studentId = meeting.studentId;
      const wasScheduled = meeting.status === 'scheduled';

      // Изтрий meeting
      await meeting.destroy();

      // Update student stats
      if (wasScheduled) {
        const studentData = await student.findByPk(studentId);
        if (studentData) {
          await studentData.update({
            scheduledMeetings: Math.max(0, studentData.scheduledMeetings - 1)
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Meeting deleted successfully'
      });

    } catch (err) {
      console.error('❌ [DELETE MEETING] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// GET /api/mentors/dashboard/my-profile

// ===============================
mentorDashboardController.get(
  '/my-profile',
  isAuth,
  rbac.checkPermission('mentor', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);

      const { user_account } = require('../sequelize/models/index');

      const mentorData = await mentor.findByPk(mentorId, {
        attributes: { 
          exclude: [
            'accumulatedCompletedSessions',
            'accumulatedMessagesCount',
            'accumulatedOnlineMinutes',
            'accumulatedResponseCount',
            'accumulatedResponseTimeSum',
            'adminNotes',
            'lastSessionSyncedAt',
            'lastActiveAt'
          ]
        },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }
        ]
      });

      if (!mentorData) {
        return res.status(404).json({
          success: false,
          message: 'Mentor profile not found'
        });
      }

      res.status(200).json({
        success: true,
        mentor: mentorData
      });

    } catch (err) {
      console.error('❌ [GET MY PROFILE] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// PATCH /api/mentors/dashboard/my-profile
// Редактирай собствения профил (ОГРАНИЧЕНО)
// ===============================
mentorDashboardController.patch(
  '/my-profile',
  isAuth,
  rbac.checkPermission('mentor', 'updateOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);
      const updates = req.body;

      const mentorData = await mentor.findByPk(mentorId);

      if (!mentorData) {
        return res.status(404).json({
          success: false,
          message: 'Mentor profile not found'
        });
      }

      // ✅ Allowed fields (БЕЗ photoUrl, name, age, adminNotes, status)
      const allowedFields = [
        'email',
        'phone',
        'country',
        'specialization',
        'education',
        'experience',
        'motivation',
        'availability',
        'languages',
        'viber',
        'facebook',
        'linkedin',
        'otherContact',
        'priorityContact',
        'cvUrl',
        'cvOriginalName',
        'isOnline'
      ];

      // Filter only allowed fields
      const filteredUpdates = {};
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      // Ако няма нищо за update
      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      // Update mentor
      await mentorData.update(filteredUpdates);

      // Върни ФИЛТРИРАН response
      const updatedMentor = await mentor.findByPk(mentorId, {
        attributes: { 
          exclude: [
            'accumulatedCompletedSessions',
            'accumulatedMessagesCount',
            'accumulatedOnlineMinutes',
            'accumulatedResponseCount',
            'accumulatedResponseTimeSum',
            'adminNotes',
            'lastSessionSyncedAt',
            'lastActiveAt',
            'userId'
          ]
        }
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        mentor: updatedMentor
      });

    } catch (err) {
      console.error('❌ [UPDATE MY PROFILE] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// STUDENT MANAGEMENT ENDPOINTS
// ===============================

mentorDashboardController.get(
  '/students/:studentId/details',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const studentId = parseInt(req.params.studentId);
      const mentorId = await getMentorIdFromUser(userId);

      const { 
        student, 
        user_account, 
        user_details,
        student_course,
        course,
        student_lecture,
        lecture,
        student_seminar,
        seminar,
        student_presentation,
        presentation,
        mentor_history
      } = require('../sequelize/models/index');

      // ✅ ВЗЕМИ СТУДЕНТА С ПЪЛНИ ВКЛЮЧЕНИ ДАННИ
      const studentData = await student.findOne({
        where: {
          id: studentId,
          currentMentorId: mentorId 
        },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            required: true,
            include: [
              {
                model: user_details,
                as: 'details',
                required: false,
                attributes: ['username', 'firstName', 'lastName', 'phoneNumber', 'imageURL', 'birthDate', 'region']
              }
            ]
          },
          {
            model: mentor,
            as: 'currentMentor',
            required: false,
            attributes: ['id', 'name', 'email', 'photoUrl']
          },
          {
            model: student_course,
            as: 'courses',
            required: false,
            include: [
              {
                model: course,
                as: 'course',
                required: false,
                attributes: ['id', 'name', 'category', 'thumbnailUrl']
              }
            ]
          },
          {
            model: student_lecture,
            as: 'lectures',
            required: false,
            include: [
              {
                model: lecture,
                as: 'lecture',
                required: false,
                attributes: ['id', 'title', 'scheduledDate', 'durationMinutes']
              }
            ]
          },
          {
            model: student_seminar,
            as: 'seminars',
            required: false,
            include: [
              {
                model: seminar,
                as: 'seminar',
                required: false,
                attributes: ['id', 'title', 'scheduledDate', 'durationMinutes']
              }
            ]
          },
          {
            model: student_presentation,
            as: 'presentations',
            required: false,
            include: [
              {
                model: presentation,
                as: 'presentation',
                required: false,
                attributes: ['id', 'title', 'dueDate', 'maxCredits']
              }
            ]
          },
          {
            model: mentor_history,
            as: 'mentorHistory',
            required: false,
            include: [
              {
                model: mentor,
                as: 'mentor',
                required: false,
                attributes: ['id', 'name', 'photoUrl']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found or not assigned to you'
        });
      }

      // ✅ ПРЕОБРАЗУВАЙ В PLAIN OBJECT
      const studentObj = studentData.get({ plain: true });

      // ✅ ИЗЧИСЛИ ATTENDANCE RATE
      const attendanceRate = studentObj.totalScheduledSessions > 0
        ? Math.round((studentObj.attendedSessions / studentObj.totalScheduledSessions) * 100)
        : 0;

      // ✅ ИЗВЛЕЧИ ИМЕ ОТ USER DETAILS
      const studentName = studentObj.user?.details?.username ||
        `${studentObj.user?.details?.firstName || ''} ${studentObj.user?.details?.lastName || ''}`.trim() ||
        studentObj.user?.email?.split('@')[0] ||
        'Unknown';

      // ✅ ФОРМАТИРАЙ COURSES
      const formattedCourses = (studentObj.courses || []).map(sc => ({
        id: sc.id,
        courseId: sc.courseId,
        courseName: sc.course?.name || 'Unknown Course',
        category: sc.course?.category || null,
        thumbnailUrl: sc.course?.thumbnailUrl || null,
        status: sc.status,
        progress: sc.progress,
        completedLessons: sc.completedLessons,
        totalLessons: sc.totalLessons,
        earnedCredits: sc.earnedCredits,
        maxCredits: sc.maxCredits,
        startDate: sc.startDate,
        endDate: sc.endDate
      }));

      // ✅ ФОРМАТИРАЙ LECTURES
      const formattedLectures = (studentObj.lectures || []).map(sl => ({
        id: sl.id,
        lectureId: sl.lectureId,
        title: sl.lecture?.title || 'Unknown Lecture',
        date: sl.lecture?.scheduledDate || null,
        duration: sl.lecture?.durationMinutes || 0,
        attended: sl.attended,
        attendedAt: sl.attendedAt,
        earnedCredits: sl.earnedCredits
      }));

      // ✅ ФОРМАТИРАЙ SEMINARS
      const formattedSeminars = (studentObj.seminars || []).map(ss => ({
        id: ss.id,
        seminarId: ss.seminarId,
        title: ss.seminar?.title || 'Unknown Seminar',
        date: ss.seminar?.scheduledDate || null,
        duration: ss.seminar?.durationMinutes || 0,
        attended: ss.attended,
        attendedAt: ss.attendedAt,
        earnedCredits: ss.earnedCredits
      }));

      // ✅ ФОРМАТИРАЙ PRESENTATIONS
      const formattedPresentations = (studentObj.presentations || []).map(sp => ({
        id: sp.id,
        presentationId: sp.presentationId,
        title: sp.presentation?.title || 'Unknown Presentation',
        dueDate: sp.presentation?.dueDate || null,
        status: sp.status,
        submittedAt: sp.submittedAt,
        gradedAt: sp.gradedAt,
        earnedCredits: sp.earnedCredits,
        maxCredits: sp.presentation?.maxCredits || 0
      }));

      // ✅ ФОРМАТИРАЙ MENTOR HISTORY
      const formattedMentorHistory = (studentObj.mentorHistory || []).map(mh => ({
        id: mh.id,
        mentorId: mh.mentorId,
        mentorName: mh.mentorName,
        mentorPhoto: mh.mentor?.photoUrl || null,
        periodStart: mh.periodStart,
        periodEnd: mh.periodEnd,
        reason: mh.reason
      }));

      // ✅ ФОРМАТИРАН RESPONSE
      const formattedStudent = {
        // Basic Info
        id: studentObj.id,
        name: studentName,
        avatar: studentObj.avatar || studentObj.user?.details?.imageURL || null,
        status: studentObj.status,
        registrationDate: studentObj.registrationDate,
        
        // User Info
        user: {
          id: studentObj.user.id,
          email: studentObj.user.email,
          phone: studentObj.phone || studentObj.user?.details?.phoneNumber || null,
          details: studentObj.user.details ? {
            username: studentObj.user.details.username,
            firstName: studentObj.user.details.firstName,
            lastName: studentObj.user.details.lastName,
            birthDate: studentObj.user.details.birthDate,
            region: studentObj.user.details.region
          } : null
        },
        
        // Credits
        credits: {
          totalEarned: studentObj.totalCreditsEarned,
          totalPossible: studentObj.totalCreditsPossible,
          breakdown: {
            fromCourses: studentObj.creditsFromCourses,
            fromLectures: studentObj.creditsFromLectures,
            fromSeminars: studentObj.creditsFromSeminars,
            fromPresentations: studentObj.creditsFromPresentations
          }
        },
        
        // Current Mentor
        currentMentor: studentObj.currentMentor ? {
          id: studentObj.currentMentor.id,
          name: studentObj.currentMentor.name,
          email: studentObj.currentMentor.email,
          photoUrl: studentObj.currentMentor.photoUrl,
          assignedDate: studentObj.mentorAssignedDate
        } : null,
        
        // Attendance
        attendance: {
          totalScheduledSessions: studentObj.totalScheduledSessions,
          attendedSessions: studentObj.attendedSessions,
          missedSessions: studentObj.missedSessions,
          attendanceRate: attendanceRate
        },
        
        // Mentor Help
        mentorHelp: {
          totalChatSessions: studentObj.totalChatSessions,
          totalChatHours: parseFloat(studentObj.totalChatHours),
          lastChatDate: studentObj.lastChatDate,
          scheduledMeetings: studentObj.scheduledMeetings,
          completedMeetings: studentObj.completedMeetings
        },
        
        // ✅ РЕАЛНИ ДАННИ!
        courses: formattedCourses,
        lectures: formattedLectures,
        seminars: formattedSeminars,
        presentations: formattedPresentations,
        mentorHistory: formattedMentorHistory
      };

      res.status(200).json({
        success: true,
        student: formattedStudent
      });

    } catch (err) {
      console.error('❌ [GET STUDENT DETAILS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// GET /api/mentors/dashboard/students/:studentId/details
// Вземи детайли за студент
// ===============================
mentorDashboardController.get(
  '/students/:studentId/details',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const studentId = parseInt(req.params.studentId);
      const mentorId = await getMentorIdFromUser(userId);

      const { 
        student, 
        user_account, 
        user_details,
        student_course,
        course,
        student_lecture,
        lecture,
        student_seminar,
        seminar,
        student_presentation,
        presentation,
        mentor_history
      } = require('../sequelize/models/index');

      // ✅ ВЗЕМИ СТУДЕНТА С ПЪЛНИ ВКЛЮЧЕНИ ДАННИ
      const studentData = await student.findOne({
        where: {
          id: studentId,
          currentMentorId: mentorId 
        },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            required: true,
            include: [
              {
                model: user_details,
                as: 'details',
                required: false,
                attributes: ['username', 'firstName', 'lastName', 'phoneNumber', 'imageURL', 'birthDate', 'region']
              }
            ]
          },
          {
            model: mentor,
            as: 'currentMentor',
            required: false,
            attributes: ['id', 'name', 'email', 'photoUrl']
          },
          {
            model: student_course,
            as: 'courses',
            required: false,
            include: [
              {
                model: course,
                as: 'course',
                required: false,
                attributes: ['id', 'name', 'category', 'thumbnailUrl']
              }
            ]
          },
          {
            model: student_lecture,
            as: 'lectures',
            required: false,
            include: [
              {
                model: lecture,
                as: 'lecture',
                required: false,
                attributes: ['id', 'title', 'scheduledDate', 'durationMinutes']
              }
            ]
          },
          {
            model: student_seminar,
            as: 'seminars',
            required: false,
            include: [
              {
                model: seminar,
                as: 'seminar',
                required: false,
                attributes: ['id', 'title', 'scheduledDate', 'durationMinutes']
              }
            ]
          },
          {
            model: student_presentation,
            as: 'presentations',
            required: false,
            include: [
              {
                model: presentation,
                as: 'presentation',
                required: false,
                attributes: ['id', 'title', 'dueDate', 'maxCredits']
              }
            ]
          },
          {
            model: mentor_history,
            as: 'mentorHistory',
            required: false,
            include: [
              {
                model: mentor,
                as: 'mentor',
                required: false,
                attributes: ['id', 'name', 'photoUrl']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found or not assigned to you'
        });
      }

      // ✅ ПРЕОБРАЗУВАЙ В PLAIN OBJECT
      const studentObj = studentData.get({ plain: true });

      // ✅ ИЗЧИСЛИ ATTENDANCE RATE
      const attendanceRate = studentObj.totalScheduledSessions > 0
        ? Math.round((studentObj.attendedSessions / studentObj.totalScheduledSessions) * 100)
        : 0;

      // ✅ ИЗВЛЕЧИ ИМЕ ОТ USER DETAILS
      const studentName = studentObj.user?.details?.username ||
        `${studentObj.user?.details?.firstName || ''} ${studentObj.user?.details?.lastName || ''}`.trim() ||
        studentObj.user?.email?.split('@')[0] ||
        'Unknown';

      // ✅ ФОРМАТИРАЙ COURSES
      const formattedCourses = (studentObj.courses || []).map(sc => ({
        id: sc.id,
        courseId: sc.courseId,
        courseName: sc.course?.name || 'Unknown Course',
        category: sc.course?.category || null,
        thumbnailUrl: sc.course?.thumbnailUrl || null,
        status: sc.status,
        progress: sc.progress,
        completedLessons: sc.completedLessons,
        totalLessons: sc.totalLessons,
        earnedCredits: sc.earnedCredits,
        maxCredits: sc.maxCredits,
        startDate: sc.startDate,
        endDate: sc.endDate
      }));

      // ✅ ФОРМАТИРАЙ LECTURES
      const formattedLectures = (studentObj.lectures || []).map(sl => ({
        id: sl.id,
        lectureId: sl.lectureId,
        title: sl.lecture?.title || 'Unknown Lecture',
        date: sl.lecture?.scheduledDate || null,
        duration: sl.lecture?.durationMinutes || 0,
        attended: sl.attended,
        attendedAt: sl.attendedAt,
        earnedCredits: sl.earnedCredits
      }));

      // ✅ ФОРМАТИРАЙ SEMINARS
      const formattedSeminars = (studentObj.seminars || []).map(ss => ({
        id: ss.id,
        seminarId: ss.seminarId,
        title: ss.seminar?.title || 'Unknown Seminar',
        date: ss.seminar?.scheduledDate || null,
        duration: ss.seminar?.durationMinutes || 0,
        attended: ss.attended,
        attendedAt: ss.attendedAt,
        earnedCredits: ss.earnedCredits
      }));

      // ✅ ФОРМАТИРАЙ PRESENTATIONS
      const formattedPresentations = (studentObj.presentations || []).map(sp => ({
        id: sp.id,
        presentationId: sp.presentationId,
        title: sp.presentation?.title || 'Unknown Presentation',
        dueDate: sp.presentation?.dueDate || null,
        status: sp.status,
        submittedAt: sp.submittedAt,
        gradedAt: sp.gradedAt,
        earnedCredits: sp.earnedCredits,
        maxCredits: sp.presentation?.maxCredits || 0
      }));

      // ✅ ФОРМАТИРАЙ MENTOR HISTORY
      const formattedMentorHistory = (studentObj.mentorHistory || []).map(mh => ({
        id: mh.id,
        mentorId: mh.mentorId,
        mentorName: mh.mentorName,
        mentorPhoto: mh.mentor?.photoUrl || null,
        periodStart: mh.periodStart,
        periodEnd: mh.periodEnd,
        reason: mh.reason
      }));

      // ✅ ФОРМАТИРАН RESPONSE
      const formattedStudent = {
        // Basic Info
        id: studentObj.id,
        name: studentName,
        avatar: studentObj.avatar || studentObj.user?.details?.imageURL || null,
        status: studentObj.status,
        registrationDate: studentObj.registrationDate,
        
        // User Info
        user: {
          id: studentObj.user.id,
          email: studentObj.user.email,
          phone: studentObj.phone || studentObj.user?.details?.phoneNumber || null,
          details: studentObj.user.details ? {
            username: studentObj.user.details.username,
            firstName: studentObj.user.details.firstName,
            lastName: studentObj.user.details.lastName,
            birthDate: studentObj.user.details.birthDate,
            region: studentObj.user.details.region
          } : null
        },
        
        // Credits
        credits: {
          totalEarned: studentObj.totalCreditsEarned,
          totalPossible: studentObj.totalCreditsPossible,
          breakdown: {
            fromCourses: studentObj.creditsFromCourses,
            fromLectures: studentObj.creditsFromLectures,
            fromSeminars: studentObj.creditsFromSeminars,
            fromPresentations: studentObj.creditsFromPresentations
          }
        },
        
        // Current Mentor
        currentMentor: studentObj.currentMentor ? {
          id: studentObj.currentMentor.id,
          name: studentObj.currentMentor.name,
          email: studentObj.currentMentor.email,
          photoUrl: studentObj.currentMentor.photoUrl,
          assignedDate: studentObj.mentorAssignedDate
        } : null,
        
        // Attendance
        attendance: {
          totalScheduledSessions: studentObj.totalScheduledSessions,
          attendedSessions: studentObj.attendedSessions,
          missedSessions: studentObj.missedSessions,
          attendanceRate: attendanceRate
        },
        
        // Mentor Help
        mentorHelp: {
          totalChatSessions: studentObj.totalChatSessions,
          totalChatHours: parseFloat(studentObj.totalChatHours),
          lastChatDate: studentObj.lastChatDate,
          scheduledMeetings: studentObj.scheduledMeetings,
          completedMeetings: studentObj.completedMeetings
        },
        
        // ✅ РЕАЛНИ ДАННИ!
        courses: formattedCourses,
        lectures: formattedLectures,
        seminars: formattedSeminars,
        presentations: formattedPresentations,
        mentorHistory: formattedMentorHistory
      };

      res.status(200).json({
        success: true,
        student: formattedStudent
      });

    } catch (err) {
      console.error('❌ [GET STUDENT DETAILS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// POST /api/mentors/dashboard/students/:studentId/accept
// Приеми студент (премахни от друг ментор ако е нужно)
// ===============================
mentorDashboardController.post(
  '/students/:studentId/accept',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const studentId = parseInt(req.params.studentId);
      const mentorId = await getMentorIdFromUser(userId);

      const { student } = require('../sequelize/models/index');

      const studentData = await student.findByPk(studentId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      if (studentData.currentMentorId === mentorId) {
        return res.status(400).json({
          success: false,
          message: 'Student is already assigned to you'
        });
      }

      if (studentData.currentMentorId) {
        const previousMentorId = studentData.currentMentorId;

        const previousMentor = await mentor.findByPk(previousMentorId);
        if (previousMentor) {
          await previousMentor.update({
            studentsCount: Math.max(0, previousMentor.studentsCount - 1)
          });
        }
      }

      await studentData.update({
        currentMentorId: mentorId,
        mentorAssignedDate: new Date()
      });

      const mentorData = await mentor.findByPk(mentorId);
      await mentorData.update({
        studentsCount: mentorData.studentsCount + 1
      });

      res.status(200).json({
        success: true,
        message: 'Student accepted successfully',
        student: studentData
      });

    } catch (err) {
      console.error('❌ [ACCEPT STUDENT] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// POST /api/mentors/dashboard/students/:studentId/remove
// Откажи се от студент
// ===============================
mentorDashboardController.post(
  '/students/:studentId/remove',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const studentId = parseInt(req.params.studentId);
      const mentorId = await getMentorIdFromUser(userId);

      const { student } = require('../sequelize/models/index');

      // Вземи студента
      const studentData = await student.findOne({
        where: {
          id: studentId,
          currentMentorId: mentorId 
        }
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found or not assigned to you'
        });
      }

      // ✅ Премахни студента
      await studentData.update({
        currentMentorId: null
        // mentorAssignedDate остава за история
      });

      const mentorData = await mentor.findByPk(mentorId);
      await mentorData.update({
        studentsCount: Math.max(0, mentorData.studentsCount - 1)
      });

      res.status(200).json({
        success: true,
        message: 'Student removed successfully'
      });

    } catch (err) {
      console.error('❌ [REMOVE STUDENT] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// NOTES ENDPOINTS
// ===============================

// ===============================
// GET /api/mentors/dashboard/students/:studentId/notes
// Вземи всички бележки за студент
// ===============================
mentorDashboardController.get(
  '/students/:studentId/notes',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const studentId = parseInt(req.params.studentId);
      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_note, student } = require('../sequelize/models/index');

      const studentData = await student.findOne({
        where: {
          id: studentId,
          currentMentorId: mentorId
        }
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found or not assigned to you'
        });
      }

      const notes = await mentor_note.findAll({
        where: {
          studentId: studentId,
          mentorId: mentorId
        },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        notes: notes
      });

    } catch (err) {
      console.error('❌ [GET STUDENT NOTES] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// POST /api/mentors/dashboard/students/:studentId/notes
// Създай бележка за студент
// ===============================
mentorDashboardController.post(
  '/students/:studentId/notes',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const studentId = parseInt(req.params.studentId);
      const mentorId = await getMentorIdFromUser(userId);

      const { createNoteSchema } = require('../schemas/mentorNotes.schema');
      const { mentor_note, student } = require('../sequelize/models/index');

      const validationResult = createNoteSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      const studentData = await student.findOne({
        where: {
          id: studentId,
          currentMentorId: mentorId
        }
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found or not assigned to you'
        });
      }

      const newNote = await mentor_note.create({
        mentorId: mentorId,
        studentId: studentId,
        text: validationResult.data.text,
        category: validationResult.data.category  // ← ДОБАВЕНО
      });

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        note: newNote
      });

    } catch (err) {
      console.error('❌ [CREATE NOTE] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// PATCH /api/mentors/dashboard/notes/:noteId
// Редактирай бележка
// ===============================
mentorDashboardController.patch(
  '/notes/:noteId',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const noteId = parseInt(req.params.noteId);
      const mentorId = await getMentorIdFromUser(userId);

      const { updateNoteSchema } = require('../schemas/mentorNotes.schema');
      const { mentor_note } = require('../sequelize/models/index');

      const validationResult = updateNoteSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      const note = await mentor_note.findOne({
        where: {
          id: noteId,
          mentorId: mentorId
        }
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or not yours'
        });
      }

      // Build update object
      const updateData = {};
      if (validationResult.data.text) updateData.text = validationResult.data.text;
      if (validationResult.data.category) updateData.category = validationResult.data.category;

      await note.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Note updated successfully',
        note: note
      });

    } catch (err) {
      console.error('❌ [UPDATE NOTE] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// DELETE /api/mentors/dashboard/notes/:noteId
// Изтрий бележка
// ===============================
mentorDashboardController.delete(
  '/notes/:noteId',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const noteId = parseInt(req.params.noteId);
      const mentorId = await getMentorIdFromUser(userId);

      const { mentor_note } = require('../sequelize/models/index');

      const note = await mentor_note.findOne({
        where: {
          id: noteId,
          mentorId: mentorId
        }
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or not yours'
        });
      }

      await note.destroy();

      res.status(200).json({
        success: true,
        message: 'Note deleted successfully'
      });

    } catch (err) {
      console.error('❌ [DELETE NOTE] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// GET /api/mentors/dashboard/my-reviews
// Вземи reviews за текущия ментор
// ===============================
mentorDashboardController.get(
  '/my-reviews',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { limit = 100 } = req.query;
      const mentorId = await getMentorIdFromUser(userId);

      const { review } = require('../sequelize/models/index');

      // ✅ ИЗПОЛЗВАЙ camelCase БЕЗ attributes
      const reviews = await review.findAll({
        where: {
          reviewType: 'mentor',
          targetId: mentorId,
          status: 'approved'
        },
        order: [['approvedAt', 'DESC']],
        limit: parseInt(limit)
        // ✅ БЕЗ attributes - Sequelize взима всички полета и прави автоматична конверсия
      });

      // ✅ Map to JSON (вече са camelCase)
      const formattedReviews = reviews.map(r => {
        const reviewData = r.toJSON();
        return {
          id: reviewData.id,
          rating: reviewData.rating,
          text: reviewData.text,
          name: reviewData.name,
          role: reviewData.role,
          createdAt: reviewData.createdAt,
          approvedAt: reviewData.approvedAt
        };
      });

      res.status(200).json({
        success: true,
        reviews: formattedReviews
      });

    } catch (err) {
      console.error('❌ [GET MY REVIEWS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// GET /api/mentors/dashboard/my-reviews/stats
// Вземи review статистики за текущия ментор
// ===============================
mentorDashboardController.get(
  '/my-reviews/stats',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);

      const { review } = require('../sequelize/models/index');

      const reviews = await review.findAll({
        where: {
          review_type: 'mentor',
          target_id: mentorId,
          status: 'approved'
        },
        attributes: ['rating'],
        raw: true
      });

      const totalReviews = reviews.length;
      const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : 0;

      // Rating distribution
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(r => {
        ratingDistribution[r.rating]++;
      });

      res.status(200).json({
        success: true,
        stats: {
          totalReviews: totalReviews,
          averageRating: parseFloat(averageRating),
          ratingDistribution: ratingDistribution
        }
      });

    } catch (err) {
      console.error('❌ [GET MY REVIEW STATS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// GET /api/mentors/dashboard/student-applications
// Вземи всички заявки за текущия ментор
// ===============================
mentorDashboardController.get(
  '/student-applications',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const mentorId = await getMentorIdFromUser(userId);

      const { student_mentor_application, user_account, user_details } = require('../sequelize/models/index');

      // Вземи всички заявки
      const applications = await student_mentor_application.findAll({
        where: {
          mentorId: mentorId
        },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName', 'imageURL', 'phoneNumber']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Форматирай резултата
      const formattedApplications = applications.map(app => {
        const appData = app.get({ plain: true });
        const userName = appData.user?.details?.username ||
          `${appData.user?.details?.firstName || ''} ${appData.user?.details?.lastName || ''}`.trim() ||
          appData.user?.email?.split('@')[0] ||
          'Unknown';

        return {
          id: appData.id,
          userId: appData.userId,
          userName: userName,
          userEmail: appData.user?.email,
          userAvatar: appData.user?.details?.imageURL,
          userPhone: appData.user?.details?.phoneNumber,
          status: appData.status,
          rejectionReason: appData.rejectionReason,
          approvedAt: appData.approvedAt,
          rejectedAt: appData.rejectedAt,
          createdAt: appData.createdAt,
          updatedAt: appData.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        applications: formattedApplications,
        total: formattedApplications.length
      });

    } catch (err) {
      console.error('❌ [GET STUDENT APPLICATIONS] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);

// ===============================
// POST /api/mentors/dashboard/student-applications/:id/approve
// ===============================
mentorDashboardController.post(
  '/student-applications/:id/approve',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const applicationId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { 
        student_mentor_application, 
        student, 
        user_account,
        user_details,
        mentor,
        mentor_history,
        admin_notification,
        user_notification
      } = require('../sequelize/models/index');
      const { tokenGenerator } = require('../utils/jwt');
      const { refreshToken } = require('../sequelize/models/index');

      const application = await student_mentor_application.findOne({
        where: {
          id: applicationId,
          mentorId: mentorId
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or not yours'
        });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Application is already processed'
        });
      }

      const user = await user_account.findByPk(application.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let userDetailsData = await user_details.findOne({
        where: { userAccountsId: application.userId }
      });

      if (!userDetailsData) {
        userDetailsData = await user_details.create({
          userAccountsId: application.userId,
          username: user.email.split('@')[0],
          workOptions: [],
          skills: [],
          interestOptions: []
        });
      }

      if (user.role !== 'student') {
        await user.update({ role: 'student' });

        const { token } = tokenGenerator('access', user.dataValues);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user.dataValues);

        await refreshToken.destroy({ where: { userId: user.id } });
        await refreshToken.create({ 
          userId: user.id, 
          token: refreshTokenId, 
          expiryDate 
        });
      }

      let studentData = await student.findOne({
        where: { userId: application.userId }
      });

      const isNewStudent = !studentData;
      const oldMentorId = studentData?.currentMentorId || null;

      if (studentData) {
        if (studentData.currentMentorId) {
          const oldMentor = await mentor.findByPk(studentData.currentMentorId);
          if (oldMentor) {
            await oldMentor.update({
              studentsCount: Math.max(0, oldMentor.studentsCount - 1)
            });
          }
        }

        await studentData.update({
          currentMentorId: mentorId,
          mentorAssignedDate: new Date(),
          status: 'active'
        });

      } else {
        studentData = await student.create({
          userId: application.userId,
          currentMentorId: mentorId,
          mentorAssignedDate: new Date(),
          status: 'active',
          country: 'BG'
        });
      }

      const mentorData = await mentor.findByPk(mentorId);
      await mentorData.update({
        studentsCount: mentorData.studentsCount + 1
      });

      if (!isNewStudent && oldMentorId && oldMentorId !== mentorId) {
        const oldHistory = await mentor_history.findOne({
          where: {
            studentId: studentData.id,
            periodEnd: null
          },
          order: [['periodStart', 'DESC']]
        });

        if (oldHistory) {
          await oldHistory.update({
            periodEnd: new Date(),
            reason: 'Reassigned to new mentor'
          });
        }
      }

      await mentor_history.create({
        studentId: studentData.id,
        mentorId: mentorId,
        mentorName: mentorData.name,
        periodStart: new Date(),
        periodEnd: null,
        reason: isNewStudent ? 'Initial assignment' : 'Reassigned from another mentor'
      });

      await application.update({
        status: 'approved',
        approvedAt: new Date()
      });

      await admin_notification.create({
        type: 'student_application_approved',
        title: 'Заявка за студент одобрена',
        message: `Заявката за студент е одобрена от ментор ${mentorData.name}`,
        data: {
          applicationId: application.id,
          userId: application.userId,
          mentorId: mentorId,
          studentId: studentData.id
        },
        isRead: false
      });

      // ✅ USER NOTIFICATION
      await user_notification.create({
        userId: application.userId,
        type: 'student_application_approved',
        title: 'Вашата заявка е одобрена! 🎉',
        message: `Менторът ${mentorData.name} одобри вашата заявка. Вече можете да започнете обучението си!`,
        data: {
          applicationId: application.id,
          mentorId: mentorId,
          mentorName: mentorData.name,
          mentorEmail: mentorData.email,
          mentorPhoto: mentorData.photoUrl,
          studentId: studentData.id
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Application approved successfully',
        application: application,
        student: studentData,
        userEmail: user.email
      });

    } catch (err) {
      console.error('❌ [APPROVE APPLICATION] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);;

// ===============================
// POST /api/mentors/dashboard/student-applications/:id/reject
// ===============================
mentorDashboardController.post(
  '/student-applications/:id/reject',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const applicationId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { rejectApplicationSchema } = require('../schemas/studentMentorApplication.schema');
      const { student_mentor_application, mentor, admin_notification, user_notification } = require('../sequelize/models/index');

      const validationResult = rejectApplicationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      const application = await student_mentor_application.findOne({
        where: {
          id: applicationId,
          mentorId: mentorId
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or not yours'
        });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Application is already processed'
        });
      }

      await application.update({
        status: 'rejected',
        rejectionReason: validationResult.data.rejectionReason,
        rejectedAt: new Date()
      });

      const mentorData = await mentor.findByPk(mentorId);

      await admin_notification.create({
        type: 'student_application_rejected',
        title: 'Заявка за студент отхвърлена',
        message: `Заявката за студент е отхвърлена от ментор ${mentorData.name}`,
        data: {
          applicationId: application.id,
          userId: application.userId,
          mentorId: mentorId,
          rejectionReason: validationResult.data.rejectionReason
        },
        isRead: false
      });

      // ✅ USER NOTIFICATION
      await user_notification.create({
        userId: application.userId,
        type: 'student_application_rejected',
        title: 'Вашата заявка не беше одобрена',
        message: `За съжаление, менторът ${mentorData.name} не одобри вашата заявка.`,
        data: {
          applicationId: application.id,
          mentorId: mentorId,
          mentorName: mentorData.name,
          mentorPhoto: mentorData.photoUrl,
          rejectionReason: validationResult.data.rejectionReason
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Application rejected successfully',
        application: application,
        userEmail: user?.email || null
      });

    } catch (err) {
      console.error('❌ [REJECT APPLICATION] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
// ===============================
// DELETE /api/mentors/dashboard/student-applications/:id
// Изтрий заявка (Admin only)
// ===============================
mentorDashboardController.delete(
  '/student-applications/:id',
  isAuth,
  rbac.checkPermission('studentApplication', 'delete'),
  async (req, res, next) => {
    try {
      const applicationId = parseInt(req.params.id);

      const { student_mentor_application } = require('../sequelize/models/index');

      // Намери application
      const application = await student_mentor_application.findByPk(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Изтрий application
      await application.destroy();

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
        userEmail: user.email
      });

    } catch (err) {
      console.error('❌ [DELETE APPLICATION] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/mentors/dashboard/student-applications/:id/reapprove
// ===============================
mentorDashboardController.post(
  '/student-applications/:id/reapprove',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const applicationId = parseInt(req.params.id);
      const mentorId = await getMentorIdFromUser(userId);

      const { 
        student_mentor_application, 
        student, 
        user_account,
        user_details,
        mentor,
        mentor_history,
        admin_notification,
        user_notification
      } = require('../sequelize/models/index');
      const { tokenGenerator } = require('../utils/jwt');
      const { refreshToken } = require('../sequelize/models/index');

      const application = await student_mentor_application.findOne({
        where: {
          id: applicationId,
          mentorId: mentorId
        }
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or not yours'
        });
      }

      if (application.status !== 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Only rejected applications can be re-approved'
        });
      }

      const user = await user_account.findByPk(application.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let userDetailsData = await user_details.findOne({
        where: { userAccountsId: application.userId }
      });

      if (!userDetailsData) {
        userDetailsData = await user_details.create({
          userAccountsId: application.userId,
          username: user.email.split('@')[0],
          workOptions: [],
          skills: [],
          interestOptions: []
        });
      }

      if (user.role !== 'student') {
        await user.update({ role: 'student' });

        const { token } = tokenGenerator('access', user.dataValues);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user.dataValues);

        await refreshToken.destroy({ where: { userId: user.id } });
        await refreshToken.create({ 
          userId: user.id, 
          token: refreshTokenId, 
          expiryDate 
        });
      }

      let studentData = await student.findOne({
        where: { userId: application.userId }
      });

      const isNewStudent = !studentData;
      const oldMentorId = studentData?.currentMentorId || null;

      if (studentData) {
        if (studentData.currentMentorId) {
          const oldMentor = await mentor.findByPk(studentData.currentMentorId);
          if (oldMentor) {
            await oldMentor.update({
              studentsCount: Math.max(0, oldMentor.studentsCount - 1)
            });
          }
        }

        await studentData.update({
          currentMentorId: mentorId,
          mentorAssignedDate: new Date(),
          status: 'active'
        });

      } else {
        studentData = await student.create({
          userId: application.userId,
          currentMentorId: mentorId,
          mentorAssignedDate: new Date(),
          status: 'active',
          country: 'BG'
        });
      }

      const mentorData = await mentor.findByPk(mentorId);
      await mentorData.update({
        studentsCount: mentorData.studentsCount + 1
      });

      if (!isNewStudent && oldMentorId && oldMentorId !== mentorId) {
        const oldHistory = await mentor_history.findOne({
          where: {
            studentId: studentData.id,
            periodEnd: null
          },
          order: [['periodStart', 'DESC']]
        });

        if (oldHistory) {
          await oldHistory.update({
            periodEnd: new Date(),
            reason: 'Reassigned to new mentor'
          });
        }
      }

      await mentor_history.create({
        studentId: studentData.id,
        mentorId: mentorId,
        mentorName: mentorData.name,
        periodStart: new Date(),
        periodEnd: null,
        reason: isNewStudent ? 'Initial assignment' : 'Reassigned from another mentor'
      });

      await application.update({
        status: 'approved',
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedAt: null
      });

      await admin_notification.create({
        type: 'student_application_reapproved',
        title: 'Отхвърлена заявка е одобрена отново',
        message: `Менторът ${mentorData.name} преразгледа и одобри отхвърлена заявка за студент`,
        data: {
          applicationId: application.id,
          userId: application.userId,
          mentorId: mentorId,
          studentId: studentData.id
        },
        isRead: false
      });

      // ✅ USER NOTIFICATION
      await user_notification.create({
        userId: application.userId,
        type: 'student_application_reapproved',
        title: 'Вашата заявка е одобрена! 🎉',
        message: `Менторът ${mentorData.name} преразгледа и одобри вашата заявка. Вече можете да започнете обучението си!`,
        data: {
          applicationId: application.id,
          mentorId: mentorId,
          mentorName: mentorData.name,
          mentorEmail: mentorData.email,
          mentorPhoto: mentorData.photoUrl,
          studentId: studentData.id
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Application re-approved successfully',
        application: application,
        student: studentData,
        userEmail: user.email
      });

    } catch (err) {
      console.error('❌ [REAPPROVE APPLICATION] Error:', err);

      if (err.message === 'You are not registered as a mentor') {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as a mentor'
        });
      }

      next(err);
    }
  }
);
module.exports = mentorDashboardController;