// server/src/controllers/userManagementController.js
// Admin-only endpoints for user management:
//   - lookup user by email (for register/reset flows)
//   - invite new user (creates account + sends invitation email)
//   - send admin-initiated reset link (with optional SMS code)
//   - list audit log
//   - export audit log as PDF

const userManagementController = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const uuid = require('uuid');
const { Op } = require('sequelize');
const rateLimit = require('express-rate-limit');

const {
    user_account,
    user_details,
    user_ads,
    admin_user_action,
    admin_notification,
    student,
    mentor,
} = require('../sequelize/models');

const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

const {
    adminLookupSchema,
    adminInviteSchema,
    adminSendResetSchema,
    auditLogQuerySchema,
} = require('../schemas/adminUserManagement.schema');

const { sendGuestInvitationEmail, sendAdminInitiatedResetEmail } = require('../utils/zohoEmails');
const { sendPasswordResetSms } = require('../utils/smsService');
const { logAdminAction } = require('../utils/auditLog');

// =========================================================
// Helper: admin-only middleware (combines isAuth + role check)
// =========================================================
const adminOnly = [
    isAuth,
    (req, res, next) => {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }
        next();
    },
];

// =========================================================
// Rate limiting — protect against flood / abuse / compromised accounts
// 5 requests per minute, keyed by admin user ID (not IP — multiple admins
// behind NAT shouldn't share a bucket)
// =========================================================
const adminUserMgmtLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    keyGenerator: (req) => `admin-usermgmt-${req.user?.userId || req.ip}`,
    message: { message: 'Too many requests. Please wait a minute and try again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// =========================================================
// GET /api/admin/users/lookup?email=xxx
// Returns full profile if user exists, or { exists: false }
// =========================================================
userManagementController.get('/users/lookup', adminOnly, adminUserMgmtLimiter, async (req, res, next) => {
    try {
        const { email } = adminLookupSchema.parse({ email: req.query.email });

        const user = await user_account.findOne({
            where: { email },
            attributes: { exclude: ['password', 'reset_token', 'reset_sms_code_hash', 'invitation_token'] },
            include: [
                {
                    model: user_details,
                    as: 'details',
                    attributes: { exclude: ['userAccountsId'] },
                },
            ],
        });

        await logAdminAction({
            actionType: 'lookup_user',
            adminId: req.user.userId,
            targetUserId: user?.id || null,
            targetEmail: email,
            req,
            details: { found: !!user },
            success: true,
        });

        if (!user) {
            return res.status(200).json({ exists: false });
        }

        // Check if user is a mentor
        const mentorRecord = await mentor.findOne({
            where: { userId: user.id },
            attributes: ['id', 'status', 'name'],
        });

        // Check if user is a student
        const studentRecord = await student.findOne({
            where: { userId: user.id },
            attributes: ['id', 'status'],
        });

        return res.status(200).json({
            exists: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                finished: user.finished,
                isGoogleUser: user.isGoogleUser,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                details: user.details || null,
                isMentor: !!mentorRecord,
                mentorInfo: mentorRecord ? { id: mentorRecord.id, status: mentorRecord.status, name: mentorRecord.name } : null,
                isStudent: !!studentRecord,
                studentInfo: studentRecord ? { id: studentRecord.id, status: studentRecord.status } : null,
            },
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// POST /api/admin/users/invite
// Creates user_account + user_details + sends invitation email
// =========================================================
userManagementController.post('/users/invite', adminOnly, adminUserMgmtLimiter, async (req, res, next) => {
    try {
        const { email, firstName, lastName } = adminInviteSchema.parse(req.body);

        const existing = await user_account.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({
                message: 'User with this email already exists.',
                existingUserId: existing.id,
            });
        }

        const invitationToken = uuid.v4();
        const invitationExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const newUser = await user_account.create({
            email,
            password: null,
            role: 'user',
            finished: false,
            invitation_token: invitationToken,
            invitation_expiration: invitationExpiration,
        });

        await user_details.create({
            userAccountsId: newUser.id,
            firstName: firstName || null,
            lastName: lastName || null,
            workOptions: null,
            skills: null,
            interestOptions: null,
        });

        // Send invitation email (without seminar context)
        let emailSent = false;
        try {
            await sendGuestInvitationEmail({
                email,
                firstName: firstName || '',
                lastName: lastName || '',
                seminarTitle: null,
                invitationToken,
                expiresAt: invitationExpiration,
            });
            emailSent = true;
        } catch (emailErr) {
            console.error('[ADMIN INVITE] Failed to send email:', emailErr.message);
        }

        await logAdminAction({
            actionType: 'invite_user',
            adminId: req.user.userId,
            targetUserId: newUser.id,
            targetEmail: email,
            req,
            details: { firstName, lastName, emailSent },
            success: true,
        });

        // Notify other admins
        try {
            await admin_notification.create({
                type: 'admin_user_invited',
                title: 'Поканен нов потребител',
                message: `Администратор покани ${email} за регистрация в платформата`,
                data: { userId: newUser.id, email, invitedBy: req.user.userId },
            });
        } catch (notifErr) {
            console.error('[ADMIN INVITE] Failed to create notification:', notifErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Invitation sent successfully',
            userId: newUser.id,
            emailSent,
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// POST /api/admin/users/send-reset
// Generates reset_token + optional SMS code, sends email + SMS
// =========================================================
userManagementController.post('/users/send-reset', adminOnly, adminUserMgmtLimiter, async (req, res, next) => {
    try {
        const { email, phone, sendSms } = adminSendResetSchema.parse(req.body);

        const user = await user_account.findOne({
            where: { email },
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'phoneNumber'] }],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const resetToken = uuid.v4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.reset_token = resetToken;
        user.token_expiration = expiresAt;
        user.reset_sms_attempts = 0;
        // Mark this reset as admin-initiated (used by /auth/reset-password to decide
        // whether to write to audit log + which admin to attribute the action to)
        user.reset_initiated_by_admin_id = req.user.userId;

        let smsSent = false;
        let phoneUsed = null;
        let smsCode = null;

        if (sendSms) {
            // Resolve phone: prefer body, fallback to stored
            phoneUsed = phone || user.details?.phoneNumber || null;
            if (!phoneUsed) {
                return res.status(400).json({
                    message: 'No phone number available. Provide phone in request or disable SMS.',
                });
            }

            // Generate 6-digit code using cryptographically secure random
            // (crypto.randomInt is uniform and not predictable, unlike Math.random)
            smsCode = String(crypto.randomInt(100000, 1000000));
            user.reset_sms_code_hash = await bcrypt.hash(smsCode, 10);
        } else {
            user.reset_sms_code_hash = null;
        }

        await user.save();

        // Send SMS first (if requested), then email
        if (sendSms && smsCode) {
            try {
                const result = await sendPasswordResetSms(phoneUsed, smsCode);
                smsSent = !!result?.success;
            } catch (smsErr) {
                console.error('[ADMIN RESET] SMS failed:', smsErr.message);
            }
        }

        let emailSent = false;
        try {
            await sendAdminInitiatedResetEmail({
                email,
                firstName: user.details?.firstName || '',
                lastName: user.details?.lastName || '',
                resetToken,
                expiresAt,
                hasSmsCode: !!smsCode,
            });
            emailSent = true;
        } catch (emailErr) {
            console.error('[ADMIN RESET] Email failed:', emailErr.message);
        }

        await logAdminAction({
            actionType: 'send_reset_link',
            adminId: req.user.userId,
            targetUserId: user.id,
            targetEmail: email,
            req,
            details: {
                phoneUsed: phoneUsed ? `***${phoneUsed.slice(-4)}` : null, // mask phone
                smsRequested: sendSms,
                smsSent,
                emailSent,
            },
            success: emailSent,
        });

        // Notify other admins
        try {
            await admin_notification.create({
                type: 'admin_password_reset',
                title: 'Изпратен reset линк',
                message: `Администратор изпрати линк за смяна на парола на ${email}`,
                data: { userId: user.id, email, sentBy: req.user.userId, smsSent, emailSent },
            });
        } catch (notifErr) {
            console.error('[ADMIN RESET] Failed to create notification:', notifErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Reset link sent successfully',
            smsSent,
            emailSent,
            expiresAt,
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// GET /api/admin/user-actions
// List audit log with filters + pagination
// =========================================================
userManagementController.get('/user-actions', adminOnly, async (req, res, next) => {
    try {
        const params = auditLogQuerySchema.parse(req.query);
        const offset = (params.page - 1) * params.limit;

        const where = {};
        if (params.dateFrom || params.dateTo) {
            where.created_at = {};
            if (params.dateFrom) where.created_at[Op.gte] = new Date(params.dateFrom);
            if (params.dateTo) where.created_at[Op.lte] = new Date(params.dateTo);
        }
        if (params.adminId) where.admin_id = params.adminId;
        if (params.actionType) where.action_type = params.actionType;
        if (params.targetEmail) where.target_email = { [Op.iLike]: `%${params.targetEmail}%` };
        if (params.success !== undefined) where.success = params.success;

        // For adminEmail filter, we need to join via include
        const adminInclude = {
            model: user_account,
            as: 'admin',
            attributes: ['id', 'email'],
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'username'] }],
        };
        if (params.adminEmail) {
            adminInclude.where = { email: { [Op.iLike]: `%${params.adminEmail}%` } };
            adminInclude.required = true;
        }

        const { count, rows } = await admin_user_action.findAndCountAll({
            where,
            include: [adminInclude],
            order: [['created_at', 'DESC']],
            limit: params.limit,
            offset,
        });

        return res.status(200).json({
            data: rows,
            pagination: {
                page: params.page,
                limit: params.limit,
                total: count,
                totalPages: Math.ceil(count / params.limit),
            },
        });
    } catch (err) {
        next(err);
    }
});

// =========================================================
// GET /api/admin/user-actions/export?format=pdf&[filters]
// Export audit log as PDF (max 5000 records)
// =========================================================
userManagementController.get('/user-actions/export', adminOnly, async (req, res, next) => {
    try {
        const params = auditLogQuerySchema.parse({ ...req.query, page: 1, limit: 5000 });
        const PDFDocument = require('pdfkit');
        const path = require('path');
        const fs = require('fs');

        const where = {};
        if (params.dateFrom || params.dateTo) {
            where.created_at = {};
            if (params.dateFrom) where.created_at[Op.gte] = new Date(params.dateFrom);
            if (params.dateTo) where.created_at[Op.lte] = new Date(params.dateTo);
        }
        if (params.adminId) where.admin_id = params.adminId;
        if (params.actionType) where.action_type = params.actionType;
        if (params.targetEmail) where.target_email = { [Op.iLike]: `%${params.targetEmail}%` };
        if (params.success !== undefined) where.success = params.success;

        const adminInclude = {
            model: user_account,
            as: 'admin',
            attributes: ['id', 'email'],
        };
        if (params.adminEmail) {
            adminInclude.where = { email: { [Op.iLike]: `%${params.adminEmail}%` } };
            adminInclude.required = true;
        }

        const records = await admin_user_action.findAll({
            where,
            include: [adminInclude],
            order: [['created_at', 'DESC']],
            limit: 5000,
        });

        const doc = new PDFDocument({ size: 'A4', margin: 30, layout: 'landscape', bufferPages: true });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.pdf"`);
        doc.pipe(res);

        const fontPath = path.join(__dirname, '..', 'fonts', 'DejaVuSans.ttf');
        if (fs.existsSync(fontPath)) doc.registerFont('CyrFont', fontPath);
        const font = fs.existsSync(fontPath) ? 'CyrFont' : 'Helvetica';

        // Header
        doc.font(font).fontSize(14).fillColor('#1f2937');
        doc.text('Audit Log — Pensa Club Admin Actions', { align: 'center' });
        doc.moveDown(0.3);
        doc.font(font).fontSize(9).fillColor('#6b7280');
        const periodStr = `${params.dateFrom || 'начало'} — ${params.dateTo || 'днес'}`;
        doc.text(`Период: ${periodStr}    |    Общо записи: ${records.length}`, { align: 'center' });
        doc.moveDown(1);

        // Table headers
        const headers = ['Дата', 'Действие', 'Admin', 'Target Email', 'IP', 'Status'];
        const colWidths = [110, 90, 140, 180, 90, 50];
        const startX = 30;
        let y = doc.y;
        const rh = 18;

        // Header row
        doc.fontSize(8).font(font);
        let x = startX;
        headers.forEach((h, i) => {
            doc.rect(x, y, colWidths[i], rh).fillAndStroke('#8b2040', '#8b2040');
            doc.fillColor('#fff').text(h, x + 3, y + 5, { width: colWidths[i] - 6, height: rh - 4, ellipsis: true });
            x += colWidths[i];
        });
        y += rh;

        // Data rows
        doc.font(font).fontSize(7);
        records.forEach((rec, ri) => {
            if (y + rh > doc.page.height - 30) {
                doc.addPage({ size: 'A4', margin: 30, layout: 'landscape' });
                y = 30;
            }
            const r = rec.get({ plain: true });
            const dateStr = new Date(r.created_at).toLocaleString('bg-BG', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            const adminEmail = r.admin?.email || '—';
            const bg = ri % 2 === 0 ? '#ffffff' : '#f5f3f0';
            const vals = [dateStr, r.action_type, adminEmail, r.target_email, r.ip_address || '—', r.success ? 'OK' : 'FAIL'];
            x = startX;
            vals.forEach((v, ci) => {
                doc.rect(x, y, colWidths[ci], rh).fillAndStroke(bg, '#ddd');
                doc.fillColor('#222').text(String(v), x + 3, y + 5, { width: colWidths[ci] - 6, height: rh - 4, ellipsis: true });
                x += colWidths[ci];
            });
            y += rh;
        });

        doc.end();
    } catch (err) {
        console.error('[AUDIT EXPORT] Error:', err);
        next(err);
    }
});

module.exports = userManagementController;
