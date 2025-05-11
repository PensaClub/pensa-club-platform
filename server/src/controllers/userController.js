const userController = require('express').Router();

const bcrypt = require('bcrypt');
const { tokenVerification, tokenGenerator } = require('../utils/jwt');
const CustomError = require('../utils/customError');

const { where } = require('sequelize');
const { user_account, user_details, user_ads, refreshToken } = require('../sequelize/models/index');
const uuid = require('uuid');

const isAuth = require('../middlewares/isAuth');
const { sendResetEmail } = require('../utils/zohoEmails');
const fieldSwap = require('../utils/fieldSwap');
const ageCalculate = require('../utils/ageCalculate');

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { loginSchema, registerSchema, googleAuthSchema, resetRequestSchema, resetPasswordSchema } = require('../schemas/userAccount.schema');

const userInclude = [
    {
        model: user_details,
        as: 'details',
        attributes: { exclude: ['user_accounts_id'] },
    },
    {
        model: user_ads,
        required: false,
        as: 'ads',
        attributes: [
            ['ad_id', 'adId'],
            'summary',
            'category',
            'description',
            ['ad_region', 'adRegion'],
            ['ad_subregion', 'adSubregion'],
            ['ad_town', 'adTown'],
            'street',
            'tags',
            'images',
            'status',
            ['admin_comment', 'adminComment'],
            ['extra_fields', 'extraFields'],
            ['creation_date', 'creationDate'],
            ['expiration_date', 'expirationDate'],
        ],
    },
];

userController.post('/register', async (req, res, next) => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        const userExist = await user_account.findOne({ where: { email } });

        if (userExist) {
            return res.status(409).json({ message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await user_account.create({ email, password: hashedPassword });

        const { token } = tokenGenerator('access', user);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

        await refreshToken.create({ userId: user.dataValues.id, token: refreshTokenId, expiryDate });

        const data = {
            email: user.email,
            role: user.role,
            enabled: user.finished,
            is_google_user: user.is_google_user,
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

userController.post('/login', async (req, res, next) => {
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
            roleChangeComment: user.role_change_comment,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            is_google_user: user.is_google_user,
            ads: user.ads,
        };

        if (user.dataValues.details) {
            const details = fieldSwap(user.dataValues.details.dataValues, 'mapFromDb');
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

userController.post('/logout', isAuth, async (req, res, next) => {
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

userController.post('/request-reset-password', async (req, res, next) => {
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

userController.post('/reset-password', async (req, res, next) => {
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

userController.post('/google-register', async (req, res, next) => {
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
            is_google_user: true,
            enabled: false,
        });

        // await user_details.create({
        //     user_accounts_id: user.id,
        //     imageURL: payload.picture,
        //     work_options: [],
        //     skills: [],
        //     interest_options: [],
        // });

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
                is_google_user: user.is_google_user,
            },
            token,
        });
    } catch (error) {
        next(error);
    }
});

userController.post('/google-login', async (req, res, next) => {
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

        const data = {
            email: user.email,
            role: user.role,
            enabled: user.finished,
            roleChangeComment: user.role_change_comment,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            is_google_user: user.is_google_user,
            ads: user.ads,
        };

        if (user.dataValues.details) {
            const details = fieldSwap(user.dataValues.details.dataValues, 'mapFromDb');
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

module.exports = userController;
