const reActionController = require('express').Router();
const { Op, fn, col, literal } = require('sequelize');

const {
  club_visit_request,
  mentor_availability,
  visit_feedback,
  visit_testimonial,
  reaction_gallery_item,
  mentor,
  user_account,
  admin_notification,
  user_notification,
  sequelize,
} = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const {
  createVisitRequestSchema,
  updateVisitRequestSchema,
  setAvailabilitySchema,
  createFeedbackSchema,
  createTestimonialSchema,
  submitTestimonialSchema,
  createGalleryItemSchema,
  updateGalleryItemSchema,
  reorderGallerySchema,
} = require('../schemas/reAction.schema');
const { handlePersonalEmail } = require('../utils/clubUtils');
const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
const emailTemplates = require('../utils/reActionEmailTemplates');

// Branded ReAction email sender (uses HTML templates with logos)
const sendReActionEmail = async (to, template) => {
  try {
    await forwardEmailsViaZoho({
      userEmail: 'info@pensa.club',
      subject: template.subject,
      body: '',
      toAddresses: to,
      formattedBody: template.html,
    });
    return { emailSent: true };
  } catch (error) {
    console.error(`Failed to send ReAction email to ${to}:`, error);
    return { emailSent: false };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-SPAM — visit request submissions
// ═══════════════════════════════════════════════════════════════════════════

// In-memory rate limiter: max 3 requests per hour per IP
const requestRateStore = new Map();
const REQUEST_RATE_LIMIT = 3;
const REQUEST_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestRateStore) {
    if (now - record.windowStart > REQUEST_RATE_WINDOW) {
      requestRateStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = requestRateStore.get(ip);

  if (!record || (now - record.windowStart) > REQUEST_RATE_WINDOW) {
    return { blocked: false };
  }

  if (record.count < REQUEST_RATE_LIMIT) {
    return { blocked: false };
  }

  const remainingMs = REQUEST_RATE_WINDOW - (now - record.windowStart);
  const remainingMinutes = Math.ceil(remainingMs / 60000);
  return { blocked: true, remainingMinutes };
};

const recordSuccessfulRequest = (ip) => {
  const now = Date.now();
  const record = requestRateStore.get(ip);

  if (!record || (now - record.windowStart) > REQUEST_RATE_WINDOW) {
    requestRateStore.set(ip, { count: 1, windowStart: now });
  } else {
    record.count++;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-SPAM — testimonial submissions
// ═══════════════════════════════════════════════════════════════════════════

// 1 testimonial per IP per 24 hours
const testimonialIpStore = new Map();
// 1 testimonial per registered user (by userId) — persistent in memory
const testimonialUserStore = new Set();
const TESTIMONIAL_RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
const TESTIMONIAL_MIN_FILL_TIME = 3000; // 3 seconds minimum to fill the form

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamp] of testimonialIpStore) {
    if (now - timestamp > TESTIMONIAL_RATE_WINDOW) {
      testimonialIpStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const generateTrackingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const topicLabels = {
  fake_news: 'Фалшиви новини',
  voter_rights: 'Права на избирателите',
  election_process: 'Изборен процес',
  other: 'Друго',
};

const statusLabels = {
  new: 'Нова',
  reviewing: 'В преглед',
  mentor_assigned: 'Назначен ментор',
  confirmed: 'Потвърдена',
  completed: 'Завършена',
  cancelled: 'Отказана',
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/reaction/availability — available dates for next 60 days
reActionController.get('/availability', async (req, res, next) => {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 60);

    const todayStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Count available mentors per date (only active mentors)
    const availabilities = await mentor_availability.findAll({
      where: {
        date: { [Op.between]: [todayStr, endDateStr] },
        isAvailable: true,
      },
      include: [{
        model: mentor,
        as: 'mentor',
        attributes: ['id'],
        where: { status: 'active' },
        required: true,
      }],
      attributes: ['date'],
      raw: true,
    });

    // Count assigned requests per date in that range
    const assignedRequests = await club_visit_request.findAll({
      where: {
        preferredDate: { [Op.between]: [todayStr, endDateStr] },
        status: { [Op.in]: ['mentor_assigned', 'confirmed'] },
      },
      attributes: ['preferredDate'],
      raw: true,
    });

    // Build date → available mentors count
    const availableByDate = {};
    for (const a of availabilities) {
      const date = a.date;
      availableByDate[date] = (availableByDate[date] || 0) + 1;
    }

    // Build date → assigned requests count
    const assignedByDate = {};
    for (const r of assignedRequests) {
      const date = r.preferredDate;
      assignedByDate[date] = (assignedByDate[date] || 0) + 1;
    }

    // Return dates with slots > 0
    const dates = [];
    for (const [date, mentorCount] of Object.entries(availableByDate)) {
      const assigned = assignedByDate[date] || 0;
      const slots = mentorCount - assigned;
      if (slots > 0) {
        dates.push({ date, availableSlots: slots });
      }
    }

    dates.sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ success: true, availability: dates });
  } catch (error) {
    next(error);
  }
});

// POST /api/reaction/requests — submit a booking request
reActionController.post('/requests', isAuth.allowGuest, async (req, res, next) => {
  try {
    // Honeypot check — bots fill hidden fields, humans don't
    if (req.body._hp) {
      return res.status(201).json({ success: true, message: 'Request received successfully.' });
    }

    // Timestamp check — reject if form was submitted in under 5 seconds
    if (req.body._t) {
      const elapsed = Date.now() - Number(req.body._t);
      if (elapsed < 5000) {
        return res.status(201).json({ success: true, message: 'Request received successfully.' });
      }
    }

    // Rate limit check (only counts successful submissions)
    const rateCheck = checkRateLimit(req.ip);
    if (rateCheck.blocked) {
      return res.status(429).json({
        message: 'Too many requests submitted. Please try again later.',
        statusCode: 429,
        remainingMinutes: rateCheck.remainingMinutes,
      });
    }

    const validated = createVisitRequestSchema.parse(req.body);

    // Validate preferredDate is in the future
    const preferredDate = new Date(validated.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (preferredDate < today) {
      return res.status(400).json({ message: 'Preferred date must be in the future.' });
    }

    // Clean empty strings to null
    if (validated.topicOther === '') validated.topicOther = null;
    if (validated.notes === '') validated.notes = null;

    // Duplicate request check — prevent spam from same user/email/phone
    const activeStatuses = ['new', 'reviewing', 'mentor_assigned', 'confirmed'];
    let existingRequest = null;

    // 1. Check by userId (logged-in user)
    if (req.user?.userId) {
      existingRequest = await club_visit_request.findOne({
        where: { userId: req.user.userId, status: { [Op.in]: activeStatuses } },
      });
    }

    // 2. If no match by userId, check by email
    if (!existingRequest && validated.contactEmail) {
      existingRequest = await club_visit_request.findOne({
        where: { contactEmail: validated.contactEmail, status: { [Op.in]: activeStatuses } },
      });
    }

    // 3. If no match by email, check by phone
    if (!existingRequest && validated.contactPhone) {
      existingRequest = await club_visit_request.findOne({
        where: { contactPhone: validated.contactPhone, status: { [Op.in]: activeStatuses } },
      });
    }

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        error: 'duplicateRequest',
        trackingCode: existingRequest.trackingCode,
      });
    }

    // Generate unique tracking code
    let trackingCode;
    let isUnique = false;
    while (!isUnique) {
      trackingCode = generateTrackingCode();
      const existing = await club_visit_request.findOne({ where: { trackingCode } });
      if (!existing) isUnique = true;
    }

    const request = await club_visit_request.create({
      ...validated,
      trackingCode,
      userId: req.user?.userId || null,
      ipAddress: req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || null,
      userAgent: req.headers['user-agent'] || null,
    });

    // Record successful submission for rate limiting
    recordSuccessfulRequest(req.ip);

    // Create admin notification
    try {
      await admin_notification.create({
        type: 'reaction_visit_request',
        title: 'Нова заявка за посещение на клуб',
        message: `Подадена е нова заявка от клуб "${validated.clubName}" в ${validated.city} за ${validated.preferredDate}.`,
        data: {
          requestId: request.id,
          clubName: validated.clubName,
          city: validated.city,
          preferredDate: validated.preferredDate,
          topic: validated.topic,
        },
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Send confirmation email to club contact
    await sendReActionEmail(validated.contactEmail, emailTemplates.requestConfirmation({
      contactName: validated.contactName, clubName: validated.clubName, city: validated.city,
      topic: validated.topic, topicOther: validated.topicOther, preferredDate: validated.preferredDate, trackingCode,
    }));

    // Send notification email to admin
    await sendReActionEmail('pensa.club@gmail.com', emailTemplates.requestAdminNotification({
      clubName: validated.clubName, city: validated.city, participantsCount: validated.participantsCount,
      topic: validated.topic, topicOther: validated.topicOther, preferredDate: validated.preferredDate,
      contactName: validated.contactName, contactPhone: validated.contactPhone, contactEmail: validated.contactEmail,
      notes: validated.notes, trackingCode,
    }));

    return res.status(201).json({
      success: true,
      message: 'Request received successfully.',
      trackingCode,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/track/:code — public tracking
reActionController.get('/track/:code', async (req, res, next) => {
  try {
    const request = await club_visit_request.findOne({
      where: { trackingCode: req.params.code.toUpperCase() },
      attributes: ['status', 'preferredDate', 'clubName', 'topic', 'createdAt'],
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reaction/track/:code/cancel — public cancel by tracking code
reActionController.patch('/track/:code/cancel', async (req, res, next) => {
  try {
    const request = await club_visit_request.findOne({
      where: {
        trackingCode: req.params.code.toUpperCase(),
        status: { [Op.in]: ['new', 'reviewing', 'mentor_assigned'] },
      },
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['id', 'name', 'email'],
        required: false,
      }],
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or cannot be cancelled.' });
    }

    const { cancelReason } = req.body || {};

    await request.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: cancelReason || null,
    });

    // Admin notification
    try {
      await admin_notification.create({
        type: 'reaction_request_cancelled',
        title: 'Потребител отмени заявка',
        message: `Потребител отмени заявка за клуб "${request.clubName}" в ${request.city}.${cancelReason ? ` Причина: ${cancelReason}` : ''}`,
        data: {
          requestId: request.id,
          clubName: request.clubName,
          city: request.city,
          cancelReason,
        },
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // User notification if linked to account
    if (request.userId) {
      try {
        await user_notification.create({
          userId: request.userId,
          type: 'reaction_request_status_changed',
          title: 'Заявката ви е отменена',
          message: `Заявката за клуб "${request.clubName}" беше отменена.`,
          data: { requestId: request.id, status: 'cancelled' },
        });
      } catch (notifError) {
        console.error('Failed to create user notification:', notifError);
      }
    }

    // Email to contact
    await sendReActionEmail(request.contactEmail, emailTemplates.userCancelledClub({
      contactName: request.contactName, clubName: request.clubName, city: request.city,
      preferredDate: request.preferredDate, cancelReason,
    }));

    // Email to mentor if assigned
    if (request.assignedMentor) {
      await sendReActionEmail(request.assignedMentor.email, emailTemplates.visitCancelledMentor({
        mentorName: request.assignedMentor.name, clubName: request.clubName, city: request.city,
        preferredDate: request.preferredDate, cancelReason, cancelledByUser: true,
      }));
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/testimonials — approved testimonials
reActionController.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await visit_testimonial.findAll({
      where: { isApproved: true },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'clubName', 'city', 'quote', 'authorName', 'createdAt'],
    });

    return res.json({ success: true, testimonials });
  } catch (error) {
    next(error);
  }
});

// POST /api/reaction/testimonials — public submit testimonial (always unapproved)
reActionController.post('/testimonials', isAuth.allowGuest, async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const userId = req.user?.userId || null;

    // Anti-bot: minimum fill time check (3 seconds)
    const { formOpenedAt } = req.body;
    if (formOpenedAt) {
      const elapsed = Date.now() - formOpenedAt;
      if (elapsed < TESTIMONIAL_MIN_FILL_TIME) {
        return res.status(429).json({
          message: 'Моля, попълнете формата внимателно.',
          code: 'TOO_FAST',
        });
      }
    }

    if (userId) {
      // Registered user: only 1 testimonial allowed (by userId, NOT IP)
      if (testimonialUserStore.has(userId)) {
        return res.status(429).json({
          message: 'Вече сте изпратили отзив. Можете да изпратите само един.',
          code: 'ALREADY_SUBMITTED',
        });
      }
    } else {
      // Guest user: IP rate limit — 1 per 24 hours
      const lastSubmission = testimonialIpStore.get(ip);
      if (lastSubmission && (Date.now() - lastSubmission) < TESTIMONIAL_RATE_WINDOW) {
        const remainingMs = TESTIMONIAL_RATE_WINDOW - (Date.now() - lastSubmission);
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        return res.status(429).json({
          message: `Можете да изпратите нов отзив след ${remainingHours} ч.`,
          code: 'RATE_LIMITED',
          remainingHours,
        });
      }
    }

    const validated = submitTestimonialSchema.parse(req.body);
    const { formOpenedAt: _discard, ...testimonialData } = validated;

    // Sanitize authorName empty string to null
    if (testimonialData.authorName === '') {
      testimonialData.authorName = null;
    }

    const testimonial = await visit_testimonial.create({
      ...testimonialData,
      isApproved: false,
    });

    // Record submission
    if (userId) {
      testimonialUserStore.add(userId);
    } else {
      testimonialIpStore.set(ip, Date.now());
    }

    return res.status(201).json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/stats — public statistics
reActionController.get('/stats', async (req, res, next) => {
  try {
    const completedVisits = await club_visit_request.count({
      where: { status: 'completed' },
    });

    const distinctCities = await club_visit_request.count({
      where: { status: 'completed' },
      distinct: true,
      col: 'city',
    });

    const distinctClubs = await club_visit_request.count({
      where: { status: 'completed' },
      distinct: true,
      col: 'club_name',
    });

    return res.json({
      success: true,
      stats: {
        visitsCompleted: completedVisits,
        citiesCovered: distinctCities,
        clubsReached: distinctClubs,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/reaction/admin/requests — paginated, filterable
reActionController.get('/admin/requests', isAuth, rbac.checkPermission('reactionRequest', 'read'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, city, mentorId, dateFrom, dateTo, topic, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (mentorId) where.assignedMentorId = parseInt(mentorId);
    if (topic) where.topic = topic;
    if (dateFrom && dateTo) {
      where.preferredDate = { [Op.between]: [dateFrom, dateTo] };
    } else if (dateFrom) {
      where.preferredDate = { [Op.gte]: dateFrom };
    } else if (dateTo) {
      where.preferredDate = { [Op.lte]: dateTo };
    }
    if (search) {
      where[Op.or] = [
        { clubName: { [Op.iLike]: `%${search}%` } },
        { contactName: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { trackingCode: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: requests } = await club_visit_request.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: mentor,
          as: 'assignedMentor',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false,
        },
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          required: false,
        },
      ],
    });

    return res.json({
      success: true,
      requests,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/admin/requests/:id — full detail
reActionController.get('/admin/requests/:id', isAuth, rbac.checkPermission('reactionRequest', 'read'), async (req, res, next) => {
  try {
    const request = await club_visit_request.findByPk(req.params.id, {
      include: [
        {
          model: mentor,
          as: 'assignedMentor',
          attributes: ['id', 'name', 'email', 'phone', 'country'],
          required: false,
        },
        {
          model: visit_feedback,
          as: 'feedback',
          required: false,
        },
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          required: false,
        },
      ],
    });

    if (!request) return res.status(404).json({ message: 'Request not found.' });

    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reaction/admin/requests/:id — update status/mentor/notes
reActionController.patch('/admin/requests/:id', isAuth, rbac.checkPermission('reactionRequest', 'update'), async (req, res, next) => {
  try {
    const validated = updateVisitRequestSchema.parse(req.body);
    const request = await club_visit_request.findByPk(req.params.id, {
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['id', 'name', 'email'],
        required: false,
      }],
    });

    if (!request) return res.status(404).json({ message: 'Request not found.' });

    // Clean empty strings to null
    if (validated.adminNotes === '') validated.adminNotes = null;
    if (validated.cancelReason === '') validated.cancelReason = null;

    // Track status changes for email notifications
    const oldStatus = request.status;
    const oldMentorId = request.assignedMentorId;

    // Set status timestamps
    if (validated.status === 'confirmed' && oldStatus !== 'confirmed') {
      validated.confirmedAt = new Date();
    }
    if (validated.status === 'completed' && oldStatus !== 'completed') {
      validated.completedAt = new Date();
    }
    if (validated.status === 'cancelled' && oldStatus !== 'cancelled') {
      validated.cancelledAt = new Date();
    }

    await request.update(validated);

    // Reload with mentor info
    await request.reload({
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['id', 'name', 'email'],
        required: false,
      }],
    });

    // Email: old mentor removed (reassignment)
    if (validated.assignedMentorId && oldMentorId && validated.assignedMentorId !== oldMentorId) {
      const oldMentor = await mentor.findByPk(oldMentorId, {
        attributes: ['id', 'name', 'email'],
      });
      if (oldMentor) {
        await sendReActionEmail(oldMentor.email, emailTemplates.mentorReassigned({
          mentorName: oldMentor.name, clubName: request.clubName, city: request.city, preferredDate: request.preferredDate,
        }));
      }
    }

    // Email: mentor assigned
    if (validated.assignedMentorId && validated.assignedMentorId !== oldMentorId) {
      const assignedMentor = await mentor.findByPk(validated.assignedMentorId, {
        attributes: ['id', 'name', 'email'],
      });

      if (assignedMentor) {
        // Email to mentor
        await sendReActionEmail(assignedMentor.email, emailTemplates.mentorAssigned({
          mentorName: assignedMentor.name, clubName: request.clubName, city: request.city,
          preferredDate: request.preferredDate, topic: request.topic, topicOther: request.topicOther,
          participantsCount: request.participantsCount, contactName: request.contactName, contactPhone: request.contactPhone,
        }));

        // Email to club
        await sendReActionEmail(request.contactEmail, emailTemplates.mentorAssignedClub({
          contactName: request.contactName, clubName: request.clubName,
          mentorName: assignedMentor.name, preferredDate: request.preferredDate, trackingCode: request.trackingCode,
        }));
      }
    }

    // Email: confirmed
    if (validated.status === 'confirmed' && oldStatus !== 'confirmed') {
      await sendReActionEmail(request.contactEmail, emailTemplates.visitConfirmed({
        contactName: request.contactName, clubName: request.clubName,
        preferredDate: request.preferredDate, topic: request.topic, topicOther: request.topicOther,
      }));
    }

    // Email: cancelled
    if (validated.status === 'cancelled' && oldStatus !== 'cancelled') {
      await sendReActionEmail(request.contactEmail, emailTemplates.visitCancelledClub({
        contactName: request.contactName, clubName: request.clubName,
        preferredDate: request.preferredDate, cancelReason: validated.cancelReason,
      }));

      if (request.assignedMentor) {
        await sendReActionEmail(request.assignedMentor.email, emailTemplates.visitCancelledMentor({
          mentorName: request.assignedMentor.name, clubName: request.clubName, city: request.city,
          preferredDate: request.preferredDate, cancelReason: validated.cancelReason,
        }));
      }
    }

    // User notification (if request has userId)
    if (request.userId) {
      try {
        // Notify on status change
        if (validated.status && validated.status !== oldStatus) {
          await user_notification.create({
            userId: request.userId,
            type: 'reaction_request_status_changed',
            title: 'Промяна в статуса на заявка',
            message: `Статусът на заявката за клуб "${request.clubName}" е променен на "${statusLabels[validated.status] || validated.status}".`,
            data: {
              requestId: request.id,
              trackingCode: request.trackingCode,
              oldStatus,
              newStatus: validated.status,
            },
          });
        }

        // Notify on mentor assignment
        if (validated.assignedMentorId && validated.assignedMentorId !== oldMentorId) {
          await user_notification.create({
            userId: request.userId,
            type: 'reaction_mentor_assigned',
            title: 'Назначен ментор за вашата заявка',
            message: `Ментор е назначен за посещението на клуб "${request.clubName}" на ${request.preferredDate}.`,
            data: {
              requestId: request.id,
              trackingCode: request.trackingCode,
            },
          });
        }
      } catch (notifError) {
        console.error('Failed to create user notification:', notifError);
      }
    }

    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/admin/calendar — month range with requests + availabilities
reActionController.get('/admin/calendar', isAuth, rbac.checkPermission('reactionRequest', 'read'), async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ message: 'dateFrom and dateTo are required.' });
    }

    const requests = await club_visit_request.findAll({
      where: {
        preferredDate: { [Op.between]: [dateFrom, dateTo] },
        status: { [Op.notIn]: ['cancelled'] },
      },
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['id', 'name'],
        required: false,
      }],
      attributes: ['id', 'clubName', 'city', 'preferredDate', 'status', 'topic', 'assignedMentorId'],
      order: [['preferredDate', 'ASC']],
    });

    const availabilities = await mentor_availability.findAll({
      where: {
        date: { [Op.between]: [dateFrom, dateTo] },
        isAvailable: true,
      },
      include: [{
        model: mentor,
        as: 'mentor',
        attributes: ['id', 'name'],
        where: { status: 'active' },
        required: true,
      }],
      attributes: ['id', 'date', 'mentorId'],
    });

    return res.json({ success: true, requests, availabilities });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/admin/mentors-for-date/:date — available mentors for a specific date
reActionController.get('/admin/mentors-for-date/:date', isAuth, rbac.checkPermission('reactionRequest', 'read'), async (req, res, next) => {
  try {
    const { date } = req.params;
    const { city } = req.query;

    // Find mentors who marked themselves available on this date
    const availableMentors = await mentor_availability.findAll({
      where: {
        date,
        isAvailable: true,
      },
      include: [{
        model: mentor,
        as: 'mentor',
        attributes: ['id', 'name', 'email', 'phone', 'country'],
        where: { status: 'active' },
        required: true,
      }],
    });

    // Find mentors already assigned to visits on this date
    const assignedOnDate = await club_visit_request.findAll({
      where: {
        preferredDate: date,
        status: { [Op.in]: ['mentor_assigned', 'confirmed'] },
        assignedMentorId: { [Op.not]: null },
      },
      attributes: ['assignedMentorId'],
      raw: true,
    });

    const assignedMentorIds = new Set(assignedOnDate.map((r) => r.assignedMentorId));

    // Filter out already assigned mentors
    const mentors = availableMentors
      .filter((a) => !assignedMentorIds.has(a.mentor.id))
      .map((a) => ({
        id: a.mentor.id,
        name: a.mentor.name,
        email: a.mentor.email,
        phone: a.mentor.phone,
        country: a.mentor.country,
      }));

    return res.json({ success: true, mentors });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/admin/stats — detailed statistics
reActionController.get('/admin/stats', isAuth, rbac.checkPermission('reactionRequest', 'read'), async (req, res, next) => {
  try {
    // By status
    const byStatus = await club_visit_request.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // By month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const byMonth = await club_visit_request.findAll({
      where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
      attributes: [
        [fn('to_char', col('created_at'), 'YYYY-MM'), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('to_char', col('created_at'), 'YYYY-MM')],
      order: [[fn('to_char', col('created_at'), 'YYYY-MM'), 'ASC']],
      raw: true,
    });

    // By city
    const byCity = await club_visit_request.findAll({
      attributes: ['city', [fn('COUNT', col('id')), 'count']],
      group: ['city'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    });

    // By topic
    const byTopic = await club_visit_request.findAll({
      attributes: ['topic', [fn('COUNT', col('id')), 'count']],
      group: ['topic'],
      raw: true,
    });

    const totalRequests = await club_visit_request.count();
    const completedVisits = await club_visit_request.count({ where: { status: 'completed' } });
    const pendingRequests = await club_visit_request.count({
      where: { status: { [Op.in]: ['new', 'reviewing', 'mentor_assigned', 'confirmed'] } },
    });
    const activeMentors = await mentor.count({ where: { status: 'active' } });

    // Convert byStatus array to object for frontend
    const byStatusObj = {};
    for (const row of byStatus) {
      byStatusObj[row.status] = parseInt(row.count);
    }

    return res.json({
      success: true,
      stats: {
        totalRequests,
        completedVisits,
        pendingRequests,
        activeMentors,
        byStatus: byStatusObj,
        byMonth: byMonth.map((r) => ({ month: r.month, count: parseInt(r.count) })),
        topCities: byCity.map((r) => ({ city: r.city, count: parseInt(r.count) })),
        topTopics: byTopic.map((r) => ({ topic: r.topic, count: parseInt(r.count) })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/admin/export — CSV export
reActionController.get('/admin/export', isAuth, rbac.checkPermission('reactionRequest', 'export'), async (req, res, next) => {
  try {
    const requests = await club_visit_request.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['name', 'email'],
        required: false,
      }],
      raw: true,
      nest: true,
    });

    // CSV header
    const headers = [
      'ID', 'Код', 'Клуб', 'Град', 'Брой участници', 'Тема', 'Тема (друго)',
      'Предпочитана дата', 'Контакт', 'Телефон', 'Имейл', 'Забележки',
      'Статус', 'Ментор', 'Имейл на ментор', 'Админ бележки', 'Причина за отказ',
      'Създадена', 'Потвърдена', 'Завършена', 'Отказана',
    ];

    const escCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = requests.map((r) => [
      r.id,
      r.trackingCode,
      r.clubName,
      r.city,
      r.participantsCount,
      topicLabels[r.topic] || r.topic,
      r.topicOther,
      r.preferredDate,
      r.contactName,
      r.contactPhone,
      r.contactEmail,
      r.notes,
      statusLabels[r.status] || r.status,
      r.assignedMentor?.name,
      r.assignedMentor?.email,
      r.adminNotes,
      r.cancelReason,
      r.createdAt,
      r.confirmedAt,
      r.completedAt,
      r.cancelledAt,
    ].map(escCsv).join(','));

    // UTF-8 BOM for Excel compatibility with Bulgarian text
    const bom = '\uFEFF';
    const csv = bom + headers.join(',') + '\n' + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reaction-requests.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reaction/admin/requests/:id — delete request
reActionController.delete('/admin/requests/:id', isAuth, rbac.checkPermission('reactionRequest', 'delete'), async (req, res, next) => {
  try {
    const request = await club_visit_request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    // Delete related feedbacks and testimonials first
    await visit_feedback.destroy({ where: { visitRequestId: request.id } });
    await visit_testimonial.destroy({ where: { visitRequestId: request.id } });
    await request.destroy();

    return res.json({ success: true, message: 'Request deleted.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/admin/testimonials — list all testimonials (including unapproved)
reActionController.get('/admin/testimonials', isAuth, rbac.checkPermission('reactionTestimonial', 'read'), async (req, res, next) => {
  try {
    const testimonials = await visit_testimonial.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({ success: true, testimonials });
  } catch (error) {
    next(error);
  }
});

// POST /api/reaction/admin/testimonials — create testimonial
reActionController.post('/admin/testimonials', isAuth, rbac.checkPermission('reactionTestimonial', 'create'), async (req, res, next) => {
  try {
    const validated = createTestimonialSchema.parse(req.body);

    // Clean empty strings to null
    if (validated.authorName === '') validated.authorName = null;

    const testimonial = await visit_testimonial.create(validated);

    return res.status(201).json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reaction/admin/testimonials/:id — update testimonial
reActionController.patch('/admin/testimonials/:id', isAuth, rbac.checkPermission('reactionTestimonial', 'update'), async (req, res, next) => {
  try {
    const testimonial = await visit_testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found.' });

    const validated = createTestimonialSchema.partial().parse(req.body);

    if (validated.authorName === '') validated.authorName = null;

    await testimonial.update(validated);

    return res.json({ success: true, testimonial });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reaction/admin/testimonials/:id — delete testimonial
reActionController.delete('/admin/testimonials/:id', isAuth, rbac.checkPermission('reactionTestimonial', 'delete'), async (req, res, next) => {
  try {
    const testimonial = await visit_testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found.' });

    await testimonial.destroy();

    return res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/reaction/admin/send-email — custom email
reActionController.post('/admin/send-email', isAuth, rbac.checkPermission('reactionRequest', 'update'), async (req, res, next) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'to, subject, and message are required.' });
    }

    await sendReActionEmail(to, emailTemplates.customEmail({ subject, message }));

    return res.json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MENTOR ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Helper: find mentor by userId
const findMentorByUserId = async (userId) => {
  return mentor.findOne({ where: { userId } });
};

// GET /api/reaction/mentor/availability — own availability
reActionController.get('/mentor/availability', isAuth, rbac.checkPermission('reactionMentor', 'readOwn'), async (req, res, next) => {
  try {
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    const availabilities = await mentor_availability.findAll({
      where: { mentorId: mentorRecord.id },
      order: [['date', 'ASC']],
    });

    return res.json({ success: true, availabilities });
  } catch (error) {
    next(error);
  }
});

// PUT /api/reaction/mentor/availability — bulk upsert dates
reActionController.put('/mentor/availability', isAuth, rbac.checkPermission('reactionMentor', 'updateOwn'), async (req, res, next) => {
  try {
    const validated = setAvailabilitySchema.parse(req.body);
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    const results = [];

    for (const date of validated.dates) {
      const [availability] = await mentor_availability.upsert(
        {
          mentorId: mentorRecord.id,
          date,
          isAvailable: validated.isAvailable,
        },
        {
          conflictFields: ['mentor_id', 'date'],
        }
      );
      results.push(availability);
    }

    return res.json({ success: true, availabilities: results });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/mentor/assignments — assigned visits
reActionController.get('/mentor/assignments', isAuth, rbac.checkPermission('reactionMentor', 'readOwn'), async (req, res, next) => {
  try {
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    const assignments = await club_visit_request.findAll({
      where: {
        assignedMentorId: mentorRecord.id,
        status: { [Op.in]: ['mentor_assigned', 'confirmed'] },
      },
      order: [['preferredDate', 'ASC']],
      attributes: [
        'id', 'trackingCode', 'clubName', 'city', 'participantsCount',
        'topic', 'topicOther', 'preferredDate', 'contactName', 'contactPhone',
        'contactEmail', 'notes', 'status', 'createdAt',
      ],
    });

    return res.json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reaction/mentor/assignments/:id/confirm — mentor confirms
reActionController.patch('/mentor/assignments/:id/confirm', isAuth, rbac.checkPermission('reactionMentor', 'updateOwn'), async (req, res, next) => {
  try {
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    const request = await club_visit_request.findOne({
      where: {
        id: req.params.id,
        assignedMentorId: mentorRecord.id,
        status: 'mentor_assigned',
      },
    });

    if (!request) return res.status(404).json({ message: 'Assignment not found or cannot be confirmed.' });

    await request.update({
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    // Email to club
    await sendReActionEmail(request.contactEmail, emailTemplates.visitConfirmed({
      contactName: request.contactName, clubName: request.clubName,
      preferredDate: request.preferredDate, topic: request.topic, topicOther: request.topicOther,
    }));

    // User notification (if request has userId)
    if (request.userId) {
      try {
        await user_notification.create({
          userId: request.userId,
          type: 'reaction_visit_confirmed',
          title: 'Потвърдено посещение',
          message: `Менторът потвърди посещението на клуб "${request.clubName}" на ${request.preferredDate}.`,
          data: {
            requestId: request.id,
            trackingCode: request.trackingCode,
          },
        });
      } catch (notifError) {
        console.error('Failed to create user notification:', notifError);
      }
    }

    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reaction/mentor/assignments/:id/report-problem — notify admin
reActionController.patch('/mentor/assignments/:id/report-problem', isAuth, rbac.checkPermission('reactionMentor', 'updateOwn'), async (req, res, next) => {
  try {
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    const { message: problemMessage } = req.body;
    if (!problemMessage) return res.status(400).json({ message: 'Message is required.' });

    const request = await club_visit_request.findOne({
      where: {
        id: req.params.id,
        assignedMentorId: mentorRecord.id,
        status: { [Op.in]: ['mentor_assigned', 'confirmed'] },
      },
    });

    if (!request) return res.status(404).json({ message: 'Assignment not found.' });

    // Save problem on the request record
    await request.update({
      reportedProblem: problemMessage,
      reportedProblemAt: new Date(),
    });

    // Notify admin
    try {
      await admin_notification.create({
        type: 'reaction_problem',
        title: 'Проблем с посещение — Програма ReАкция',
        message: `Ментор ${mentorRecord.name} докладва проблем с посещение на клуб "${request.clubName}": ${problemMessage}`,
        data: {
          requestId: request.id,
          mentorId: mentorRecord.id,
          mentorName: mentorRecord.name,
          clubName: request.clubName,
          problemMessage,
        },
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Email admin
    await sendReActionEmail('pensa.club@gmail.com', emailTemplates.problemReport({
      mentorName: mentorRecord.name, mentorEmail: mentorRecord.email,
      clubName: request.clubName, city: request.city, preferredDate: request.preferredDate, problemMessage,
    }));

    return res.json({ success: true, message: 'Problem reported successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/reaction/mentor/history — completed visits with feedback
reActionController.get('/mentor/history', isAuth, rbac.checkPermission('reactionMentor', 'readOwn'), async (req, res, next) => {
  try {
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    const history = await club_visit_request.findAll({
      where: {
        assignedMentorId: mentorRecord.id,
        status: 'completed',
      },
      order: [['completedAt', 'DESC']],
      include: [{
        model: visit_feedback,
        as: 'feedback',
        required: false,
      }],
    });

    return res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
});

// POST /api/reaction/mentor/feedback — submit feedback
reActionController.post('/mentor/feedback', isAuth, rbac.checkPermission('reactionMentor', 'updateOwn'), async (req, res, next) => {
  try {
    const validated = createFeedbackSchema.parse(req.body);
    const mentorRecord = await findMentorByUserId(req.user.userId);
    if (!mentorRecord) return res.status(404).json({ message: 'Mentor profile not found.' });

    // Verify mentor is assigned and visit is completed
    const request = await club_visit_request.findOne({
      where: {
        id: validated.visitRequestId,
        assignedMentorId: mentorRecord.id,
        status: 'completed',
      },
    });

    if (!request) {
      return res.status(400).json({ message: 'Visit not found or not eligible for feedback.' });
    }

    // Check for existing feedback
    const existingFeedback = await visit_feedback.findOne({
      where: {
        visitRequestId: validated.visitRequestId,
        mentorId: mentorRecord.id,
      },
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this visit.' });
    }

    // Clean empty strings to null
    if (validated.topicsCovered === '') validated.topicsCovered = null;
    if (validated.challenges === '') validated.challenges = null;
    if (validated.highlights === '') validated.highlights = null;
    if (validated.recommendations === '') validated.recommendations = null;

    const feedback = await visit_feedback.create({
      ...validated,
      mentorId: mentorRecord.id,
    });

    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// USER ENDPOINTS (My Requests)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/reaction/my — user's own requests
reActionController.get('/my', isAuth, async (req, res, next) => {
  try {
    const requests = await club_visit_request.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['id', 'name'],
        required: false,
      }],
    });

    // Stats
    const total = requests.length;
    const completed = requests.filter((r) => r.status === 'completed').length;
    const cancelled = requests.filter((r) => r.status === 'cancelled').length;
    const active = requests.filter((r) => ['new', 'reviewing', 'mentor_assigned', 'confirmed'].includes(r.status)).length;

    return res.json({
      success: true,
      requests,
      stats: { total, completed, cancelled, active },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reaction/my/:id/cancel — cancel own request
reActionController.patch('/my/:id/cancel', isAuth, async (req, res, next) => {
  try {
    const request = await club_visit_request.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId,
        status: { [Op.in]: ['new', 'reviewing', 'mentor_assigned'] },
      },
      include: [{
        model: mentor,
        as: 'assignedMentor',
        attributes: ['id', 'name', 'email'],
        required: false,
      }],
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or cannot be cancelled.' });
    }

    const { cancelReason } = req.body || {};

    await request.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: cancelReason || null,
    });

    // Admin notification
    try {
      await admin_notification.create({
        type: 'reaction_request_cancelled',
        title: 'Потребител отмени заявка',
        message: `Потребител отмени заявка за клуб "${request.clubName}" в ${request.city}.${cancelReason ? ` Причина: ${cancelReason}` : ''}`,
        data: {
          requestId: request.id,
          clubName: request.clubName,
          city: request.city,
          cancelReason,
        },
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Email to mentor if assigned
    if (request.assignedMentor) {
      await sendReActionEmail(request.assignedMentor.email, emailTemplates.visitCancelledMentor({
        mentorName: request.assignedMentor.name, clubName: request.clubName, city: request.city,
        preferredDate: request.preferredDate, cancelReason, cancelledByUser: true,
      }));
    }

    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY — PUBLIC
// ═══════════════════════════════════════════════════════════════════════════

reActionController.get('/gallery', async (req, res, next) => {
  try {
    const items = await reaction_gallery_item.findAll({
      where: { isPublished: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      attributes: ['id', 'mediaType', 'mediaUrl', 'thumbnailUrl', 'title', 'description'],
    });

    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY — ADMIN
// ═══════════════════════════════════════════════════════════════════════════

reActionController.get('/admin/gallery', isAuth, rbac.checkPermission('reactionRequest', 'read'), async (req, res, next) => {
  try {
    const items = await reaction_gallery_item.findAll({
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      include: [
        {
          model: user_account,
          as: 'uploader',
          attributes: ['id', 'email'],
        },
      ],
    });

    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

reActionController.post('/admin/gallery', isAuth, rbac.checkPermission('reactionRequest', 'update'), async (req, res, next) => {
  try {
    const parsed = createGalleryItemSchema.parse(req.body);

    const maxOrder = await reaction_gallery_item.max('sortOrder') || 0;

    const item = await reaction_gallery_item.create({
      ...parsed,
      sortOrder: maxOrder + 1,
      uploadedBy: req.user.userId,
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
});

reActionController.patch('/admin/gallery/reorder', isAuth, rbac.checkPermission('reactionRequest', 'update'), async (req, res, next) => {
  try {
    const { items } = reorderGallerySchema.parse(req.body);

    await sequelize.transaction(async (t) => {
      for (const { id, sortOrder } of items) {
        await reaction_gallery_item.update({ sortOrder }, { where: { id }, transaction: t });
      }
    });

    return res.json({ success: true });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
});

reActionController.patch('/admin/gallery/:id', isAuth, rbac.checkPermission('reactionRequest', 'update'), async (req, res, next) => {
  try {
    const item = await reaction_gallery_item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Елементът не е намерен.' });
    }

    const parsed = updateGalleryItemSchema.parse(req.body);
    await item.update(parsed);

    return res.json({ success: true, item });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
});

reActionController.delete('/admin/gallery/:id', isAuth, rbac.checkPermission('reactionRequest', 'delete'), async (req, res, next) => {
  try {
    const item = await reaction_gallery_item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Елементът не е намерен.' });
    }

    const { mediaUrl, thumbnailUrl } = item;
    await item.destroy();

    return res.json({ success: true, mediaUrl, thumbnailUrl });
  } catch (error) {
    next(error);
  }
});

module.exports = reActionController;
