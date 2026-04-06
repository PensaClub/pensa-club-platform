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
        const { oldPassword, newPassword, reNewPassword, tokenType, token } = resetPasswordSchema.parse(req.body);
        let user;

        if (tokenType === 'reset') {
            user = await user_account.findOne({ where: { reset_token: token } });
            if (!user || !user.token_expiration) {
                return res.status(404).json({ message: "User with that token wasn't found." });
            }
            if (user.token_expiration.getTime() < Date.now()) {
                return res.status(400).json({ message: 'Reset token has expired.' });
            }
            user.reset_token = null;
            user.token_expiration = null;
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
        return res.status(200).json({ message: 'Password reset was successful.' });
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
