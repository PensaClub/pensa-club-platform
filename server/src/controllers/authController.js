const authController = require('express').Router();

const bcrypt = require('bcrypt');
const { tokenVerification, tokenGenerator } = require('../utils/jwt');

const { where } = require('sequelize');
const { user_account, user_details, user_ads, refreshToken } = require('../sequelize/models/index');
const uuid = require('uuid');

const isAuth = require('../middlewares/isAuth');
const { sendResetEmail } = require('../utils/zohoEmails');
const ageCalculate = require('../utils/ageCalculate');

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Convert guest seminar attendance to student credits upon registration
const convertGuestAttendance = async (userId, email) => {
    try {
        const { seminar_guest_attendance, seminar: seminarModel, student, student_seminar, user_credits, user_credits_history } = require('../sequelize/models/index');

        const guestRecords = await seminar_guest_attendance.findAll({
            where: { guestEmail: email, convertedToUserId: null },
        });

        if (guestRecords.length === 0) return;

        const userAccount = await user_account.findByPk(userId);
        const privilegedRoles = ['admin', 'moderator', 'mentor'];
        if (privilegedRoles.includes(userAccount?.role)) return;

        // Change role to student
        if (['user', 'guest'].includes(userAccount?.role)) {
            await userAccount.update({ role: 'student' });
        }

        // Create student record
        const [studentRecord] = await student.findOrCreate({
            where: { userId },
            defaults: { userId, status: 'active' },
        });

        let totalCreditsAwarded = 0;

        for (const guestRec of guestRecords) {
            const sem = await seminarModel.findByPk(guestRec.seminarId, {
                attributes: ['id', 'title', 'creditsForAttendance'],
            });
            if (!sem) continue;

            const existing = await student_seminar.findOne({
                where: { studentId: studentRecord.id, seminarId: sem.id },
            });
            if (existing) {
                await guestRec.update({ convertedToUserId: userId });
                continue;
            }

            const credits = sem.creditsForAttendance > 0 ? sem.creditsForAttendance : 0;

            await student_seminar.create({
                studentId: studentRecord.id,
                seminarId: sem.id,
                status: 'approved',
                attended: true,
                attendedAt: guestRec.createdAt,
                participationLevel: guestRec.participationLevel || 'passive',
                earnedCredits: credits,
            });

            totalCreditsAwarded += credits;
            await guestRec.update({ convertedToUserId: userId });
        }

        if (totalCreditsAwarded > 0) {
            const [creditsRecord] = await user_credits.findOrCreate({
                where: { userId },
                defaults: { userId, totalCredits: 0 },
            });

            const before = creditsRecord.totalCredits;
            creditsRecord.totalCredits += totalCreditsAwarded;
            if (creditsRecord.totalCredits > 300) creditsRecord.level = 'master';
            else if (creditsRecord.totalCredits > 150) creditsRecord.level = 'advanced';
            else if (creditsRecord.totalCredits > 50) creditsRecord.level = 'intermediate';
            else creditsRecord.level = 'beginner';
            await creditsRecord.save();

            await user_credits_history.create({
                userId,
                creditsAmount: totalCreditsAwarded,
                creditsBefore: before,
                creditsAfter: creditsRecord.totalCredits,
                sourceType: 'seminar_guest_conversion',
                sourceId: null,
                sourceTitle: `Конвертиране от гост — ${guestRecords.length} семинар(а)`,
                category: 'Семинари',
                description: `Кредити за ${guestRecords.length} посетени семинара като гост`,
            });
        }

        console.log(`[Guest Conversion] User ${userId} (${email}): ${guestRecords.length} seminars, ${totalCreditsAwarded} credits`);
    } catch (err) {
        console.error('Guest conversion error (non-blocking):', err.message);
    }
};

const { loginSchema, registerSchema, googleAuthSchema, resetRequestSchema, resetPasswordSchema } = require('../schemas/userAccount.schema');
const { acceptInvitationSchema } = require('../schemas/invitation.schema');

const userInclude = [
    {
        model: user_details,
        as: 'details',
        attributes: { exclude: ['userAccountsId', 'id'] },
    },
    {
        model: user_ads,
        required: false,
        as: 'ads',
        attributes: [
            'adId',
            'summary',
            'category',
            'description',
            'adRegion',
            'adSubregion',
            'adTown',
            'street',
            'tags',
            'images',
            'status',
            'adminComment',
            'extraFields',
            'creationDate',
            'expirationDate',
        ],
    },
];

authController.post('/register', async (req, res, next) => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        const userExist = await user_account.findOne({ where: { email } });

        if (userExist) {
            return res.status(409).json({ message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await user_account.create({ email, password: hashedPassword });

        // Check if this email was a guest at seminars → convert to student + award credits
        await convertGuestAttendance(user.id, email);

        const { token } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await refreshToken.create({ userId: user.dataValues.id, token: refreshTokenId, expiryDate });

        const data = {
            email: user.email,
            role: user.role,
            enabled: user.finished,
            isGoogleUser: user.isGoogleUser,
            isMentor: user.isMentor || false,
            hasPassword: !!user.password,
        };

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });
        return res.status(201).json({ message: 'User successfully created!', user: data, token });
    } catch (err) {
        next(err);
    }
});

authController.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await user_account.findOne({
            where: { email },
            include: userInclude,
        });

        if (!user) {
            return res.status(409).json({ message: 'Email or password are invalid.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(409).json({ message: 'Email or password are invalid.' });
        }

        const data = {
            email: user.email,
            role: user.role,
            enabled: user.finished,
            hasPassword: !!user.password,
            roleChangeComment: user.roleChangeComment,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGoogleUser: user.isGoogleUser,
            isMentor: user.isMentor || false,
            ads: user.ads,
        };

        if (user.dataValues.details) {
            const details = user.dataValues.details.dataValues;
            details.age = ageCalculate(details.birthDate);
            data.details = details;
        }

        const { token } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await refreshToken.create({ userId: user.dataValues.id, token: refreshTokenId, expiryDate });

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });

        return res.status(200).json({ message: 'User successfully logged in!', user: data, token });
    } catch (err) {
        next(err);
    }
});

authController.post('/logout', isAuth, async (req, res, next) => {
    try {
        if (req.user) {
            const refreshJwtToken = req.cookies.refreshJwtToken;
            if (refreshJwtToken) {
                try {
                    const decodedToken = tokenVerification('refresh', refreshJwtToken);
                    await refreshToken.destroy({ where: { token: decodedToken.refreshTokenId } });
                    res.clearCookie('refreshJwtToken', {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                    });
                    return res.status(200).json({ message: 'Logout successful.' });
                } catch (err) {
                    next(err);
                }
            }
        }
    } catch (err) {
        next(err);
    }
});

authController.post('/request-reset-password', async (req, res, next) => {
    try {
        const { email } = resetRequestSchema.parse(req.body);

        const user = await user_account.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'There is no user registered with that email address.' });
        }

        const resetToken = uuid.v4();
        const expiryTime = Date.now() + 900000; // 15 min

        user.reset_token = resetToken;
        user.token_expiration = expiryTime;
        await user.save();

        try {
            await sendResetEmail(email, resetToken);
            return res.status(200).json({ message: `A reset password link has been sent to ${email}.` });
        } catch (emailError) {
            next(new Error(`Error sending email: ${emailError}`));
        }
    } catch (err) {
        next(err);
    }
});

authController.post('/reset-password', async (req, res, next) => {
    try {
        const { oldPassword, newPassword, reNewPassword, tokenType, token, smsCode } = resetPasswordSchema.parse(req.body);
        const { logAdminAction } = require('../utils/auditLog');
        let user;
        // Captured BEFORE clearing reset_initiated_by_admin_id, so we can log success at the end
        let resetInitiatedByAdminId = null;

        if (tokenType === 'reset') {
            user = await user_account.findOne({ where: { reset_token: token } });
            if (!user || !user.token_expiration) {
                return res.status(404).json({ message: "User with that token wasn't found." });
            }
            if (user.token_expiration.getTime() < Date.now()) {
                return res.status(400).json({ message: 'Reset token has expired.' });
            }

            // Determine if this reset was admin-initiated (for audit log decision)
            const adminInitiatedById = user.reset_initiated_by_admin_id;
            const isAdminInitiated = !!adminInitiatedById;
            resetInitiatedByAdminId = adminInitiatedById;

            // SMS code validation (admin-initiated reset only — has reset_sms_code_hash)
            if (user.reset_sms_code_hash) {
                if (!smsCode) {
                    return res.status(400).json({ message: 'SMS code is required.' });
                }
                if ((user.reset_sms_attempts || 0) >= 5) {
                    if (isAdminInitiated) {
                        await logAdminAction({
                            actionType: 'reset_failed',
                            adminId: adminInitiatedById,
                            targetUserId: user.id,
                            targetEmail: user.email,
                            req,
                            details: { reason: 'too_many_sms_attempts' },
                            success: false,
                        });
                    }
                    return res.status(429).json({
                        message: 'Too many invalid attempts. Please request a new reset link.',
                    });
                }
                const smsValid = await bcrypt.compare(smsCode, user.reset_sms_code_hash);
                if (!smsValid) {
                    user.reset_sms_attempts = (user.reset_sms_attempts || 0) + 1;
                    await user.save();
                    if (isAdminInitiated) {
                        await logAdminAction({
                            actionType: 'reset_failed',
                            adminId: adminInitiatedById,
                            targetUserId: user.id,
                            targetEmail: user.email,
                            req,
                            details: {
                                reason: 'invalid_sms_code',
                                attemptsUsed: user.reset_sms_attempts,
                                attemptsLeft: Math.max(0, 5 - user.reset_sms_attempts),
                            },
                            success: false,
                        });
                    }
                    return res.status(401).json({
                        message: 'Invalid SMS code.',
                        attemptsLeft: Math.max(0, 5 - user.reset_sms_attempts),
                    });
                }
            }

            user.reset_token = null;
            user.token_expiration = null;
            user.reset_sms_code_hash = null;
            user.reset_sms_attempts = 0;
            user.reset_initiated_by_admin_id = null; // clear after successful reset
        }

        if (tokenType === 'jwt') {
            const decodedToken = tokenVerification('access', token);
            user = await user_account.findOne({ where: { email: decodedToken.email } });

            if (!user.password) {
                user.password = await bcrypt.hash(newPassword, 10);
                await user.save();
                return res.status(200).json({ message: 'Password set successfully.' });
            }

            if (!oldPassword) {
                return res.status(400).json({ message: 'Old password is required.' });
            }
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Old password is invalid.' });
            }
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPassword;
        await user.save();

        // Only log admin-initiated resets to the audit log.
        // Self-initiated forgot-password resets do NOT pollute the audit log.
        if (tokenType === 'reset' && resetInitiatedByAdminId) {
            await logAdminAction({
                actionType: 'reset_completed',
                adminId: resetInitiatedByAdminId,
                targetUserId: user.id,
                targetEmail: user.email,
                req,
                success: true,
            });
        }

        return res.status(200).json({ message: 'Password reset was successful.' });
    } catch (err) {
        next(err);
    }
});

// ===============================
// GET /api/auth/reset-info/:token
// Validate reset token and return info for the ResetPasswordPage UI
// (used to decide whether to show SMS code field)
// ===============================
authController.get('/reset-info/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: 'Token is required.' });
        }

        const user = await user_account.findOne({
            where: { reset_token: token },
            attributes: ['id', 'email', 'token_expiration', 'reset_sms_code_hash', 'reset_sms_attempts'],
        });

        if (!user) {
            return res.status(404).json({ message: 'Invalid or already used reset token.' });
        }

        if (!user.token_expiration || user.token_expiration.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Reset token has expired.' });
        }

        return res.status(200).json({
            valid: true,
            email: user.email,
            requiresSms: !!user.reset_sms_code_hash,
            attemptsLeft: Math.max(0, 5 - (user.reset_sms_attempts || 0)),
            expiresAt: user.token_expiration,
        });
    } catch (err) {
        next(err);
    }
});

// ===============================
// GET /api/auth/invitation/:token
// Validate invitation token and return guest info for the AcceptInvitation page
// ===============================
authController.get('/invitation/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: 'Token is required.' });
        }

        const user = await user_account.findOne({
            where: { invitation_token: token },
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        });

        if (!user) {
            return res.status(404).json({ message: 'Invalid or already used invitation.' });
        }

        if (!user.invitation_expiration || user.invitation_expiration.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Invitation has expired.' });
        }

        // Find the most recent seminar this user was registered for via the invitation flow
        // We look for the latest student_seminar record for this user
        const { student, student_seminar, seminar: seminarModel } = require('../sequelize/models/index');
        let seminarTitle = null;
        try {
            const studentRec = await student.findOne({ where: { userId: user.id }, attributes: ['id'] });
            if (studentRec) {
                const latestReg = await student_seminar.findOne({
                    where: { studentId: studentRec.id },
                    order: [['createdAt', 'DESC']],
                    include: [{ model: seminarModel, as: 'seminar', attributes: ['title'] }],
                });
                if (latestReg?.seminar?.title) {
                    seminarTitle = latestReg.seminar.title;
                }
            }
        } catch (e) {
            console.error('Could not load seminar title for invitation:', e.message);
        }

        return res.status(200).json({
            firstName: user.details?.firstName || '',
            lastName: user.details?.lastName || '',
            email: user.email,
            expiresAt: user.invitation_expiration,
            seminarTitle,
        });
    } catch (err) {
        next(err);
    }
});

// ===============================
// POST /api/auth/accept-invitation
// Set password for invited user and auto-login
// ===============================
authController.post('/accept-invitation', async (req, res, next) => {
    try {
        const { token, newPassword } = acceptInvitationSchema.parse(req.body);

        const user = await user_account.findOne({
            where: { invitation_token: token },
            include: userInclude,
        });

        if (!user) {
            return res.status(404).json({ message: 'Invalid or already used invitation.' });
        }

        if (!user.invitation_expiration || user.invitation_expiration.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Invitation has expired.' });
        }

        // Set password, clear invitation, mark as finished
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.invitation_token = null;
        user.invitation_expiration = null;
        user.finished = true;
        await user.save();

        // Build login response (same shape as /login)
        const data = {
            email: user.email,
            role: user.role,
            enabled: user.finished,
            hasPassword: !!user.password,
            roleChangeComment: user.roleChangeComment,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGoogleUser: user.isGoogleUser,
            isMentor: user.isMentor || false,
            ads: user.ads,
        };

        if (user.dataValues.details) {
            const details = user.dataValues.details.dataValues;
            details.age = ageCalculate(details.birthDate);
            data.details = details;
        }

        const { token: accessToken } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await refreshToken.create({ userId: user.dataValues.id, token: refreshTokenId, expiryDate });

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });

        return res.status(200).json({
            message: 'Invitation accepted. You are now logged in.',
            user: data,
            token: accessToken,
        });
    } catch (err) {
        next(err);
    }
});

authController.post('/google-register', async (req, res, next) => {
    try {
        const { credential } = googleAuthSchema.parse(req.body);

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email } = payload;

        let existingUser = await user_account.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists. Please login.' });
        }

        const user = await user_account.create({
            email,
            password: null,
            isGoogleUser: true,
        });

        const details = await user_details.create({
            userAccountsId: user.id,
            imageURL: payload.picture,
            workOptions: [],
            skills: [],
            interestOptions: [],
        });

        // Check if this email was a guest at seminars → convert to student + award credits
        await convertGuestAttendance(user.id, email);

        const { token } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await refreshToken.create({ userId: user.id, token: refreshTokenId, expiryDate });

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });

        return res.status(201).json({
            message: 'User successfully created!',
            user: {
                email: user.email,
                role: user.role,
                enabled: user.finished,
                isGoogleUser: user.isGoogleUser,
                hasPassword: !!user.password,
                isMentor: user.isMentor || false,
                details: {
                    imageURL: details.imageURL,
                },
            },
            token,
        });
    } catch (error) {
        next(error);
    }
});

authController.post('/google-login', async (req, res, next) => {
    try {
        const { credential } = googleAuthSchema.parse(req.body);

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email } = payload;

        let user = await user_account.findOne({
            where: { email },
            include: userInclude,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register.' });
        }

        if (user.dataValues.details && (!user.dataValues.details.imageURL || user.dataValues.details.imageURL.trim() === '')) {
            await user_details.update({ imageURL: payload.picture }, { where: { userAccountsId: user.id } });
            user.dataValues.details.imageURL = payload.picture;
        }

        const data = {
            email: user.email,
            role: user.role,
            enabled: user.finished,
            hasPassword: !!user.password,
            roleChangeComment: user.roleChangeComment,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isGoogleUser: user.isGoogleUser,
            isMentor: user.isMentor || false,
            ads: user.ads,
        };

        if (user.dataValues.details) {
            const details = user.dataValues.details.dataValues;
            details.age = ageCalculate(details.birthDate);
            data.details = details;
        }

        const { token } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await refreshToken.create({ userId: user.id, token: refreshTokenId, expiryDate });

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });

        return res.status(200).json({ message: 'User successfully logged in!', user: data, token });
    } catch (err) {
        next(err);
    }
});

authController.post('/refresh', async (req, res, next) => {
    const refreshJwtToken = req.cookies.refreshJwtToken;

    if (!refreshJwtToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    let decodedToken;
    try {
        decodedToken = tokenVerification('refresh', refreshJwtToken);
    } catch (err) {
        res.clearCookie('refreshJwtToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const storedToken = await refreshToken.findOne({ where: { token: decodedToken.refreshTokenId } });

    if (!storedToken || storedToken.expiryDate < new Date()) {
        res.clearCookie('refreshJwtToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = {
        id: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
        finished: decodedToken.enabled,
    };

    const newRefreshToken = tokenGenerator('refresh', user);
    const newAccessToken = tokenGenerator('access', user);

    await refreshToken.create({ userId: user.id, token: newRefreshToken.refreshTokenId, expiryDate: newRefreshToken.expiryDate });
    await refreshToken.destroy({ where: { token: decodedToken.refreshTokenId } });

    res.cookie('refreshJwtToken', newRefreshToken.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: newRefreshToken.expiryDate - Date.now(),
    });

    return res.json({ token: newAccessToken.token });
});

module.exports = authController;
