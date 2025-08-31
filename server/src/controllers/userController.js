const userController = require('express').Router();

const { user_details, user_account, user_ads, refreshToken } = require('../sequelize/models/index');
const ageCalculate = require('../utils/ageCalculate.js');
const isAuth = require('../middlewares/isAuth.js');
const { where } = require('sequelize');
const { tokenGenerator } = require('../utils/jwt.js');
const eventEmitter = require('../utils/eventEmitter.js');
const rbac = require('../middlewares/rbac.js');
const { forwardEmailsViaZoho } = require('../utils/zohoEmails.js');
const verifyRecaptcha = require('../utils/verifyRecaptcha.js');
const CustomError = require('../utils/customError.js');
const { userDetailsSchema, updateUserDetailsSchema } = require('../schemas/userDetails.schema');

userController.post('/details', isAuth, async (req, res, next) => {
    if (req.user.enabled) {
        return res.status(403).send({ message: 'User details have already been submitted once.' });
    }

    try {
        const validationResult = userDetailsSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw validationResult.error;
        }
        const data = {
            ...validationResult.data,
            userAccountsId: req.user.userId,
        };

        const existingDetails = await user_details.findOne({
            where: { userAccountsId: req.user.userId },
        });

        let details;
        if (existingDetails) {
            const [_, updatedDetails] = await user_details.update(data, {
                where: { userAccountsId: req.user.userId },
                returning: true,
                plain: true,
            });
            details = updatedDetails;
        } else {
            details = await user_details.create(data);
        }

        const { id, userAccountsId, ...restOfDetails } = details.dataValues;

        const user = await user_account.update({ finished: true }, { where: { id: req.user.userId }, returning: true, plain: true });

        const { token } = tokenGenerator('access', user[1].dataValues);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user[1].dataValues);

        await refreshToken.destroy({ where: { userId: req.user.userId } });
        await refreshToken.create({ userId: user[1].dataValues.id, token: refreshTokenId, expiryDate });

        res.cookie('refreshJwtToken', refreshJwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiryDate - Date.now(),
        });

        const updatedDetails = { ...restOfDetails, age: ageCalculate(restOfDetails.birthDate) };

        eventEmitter.emit('userCacheUpdate', { type: 'users', data: { ...updatedDetails }, adId: null, userId: req.user.userId, action: 'details' });
        eventEmitter.emit('userCacheUpdate', { type: 'users', data: null, adId: null, userId: req.user.userId, action: 'enabled' });

        res.status(200).send({ message: 'Details successfully updated!', user: { email: req.user.email, enabled: true, details: updatedDetails }, token });
    } catch (err) {
        next(err);
    }
});

userController.get('/all-users', async (req, res, next) => {
    try {
        const accounts = await user_account.findAll({
            attributes: ['id', 'email', ['finished', 'enabled'], 'createdAt', 'role', 'updatedAt', 'roleChangeComment'],
            include: [
                {
                    model: user_details,
                    as: 'details',
                    attributes: [
                        'phoneNumber',
                        'username',
                        'firstName',
                        'lastName',
                        'region',
                        'workOptions',
                        'skills',
                        'interestOptions',
                        'gender',
                        'imageURL',
                        'firebaseImagePath',
                    ],
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
                        'userId',
                    ],
                },
            ],
        });

        if (accounts.length === 0) return res.status(404).json({ message: 'No user accounts found.' });

        res.status(200).json({ message: 'Users data retrieved successfully.', accounts });
    } catch (err) {
        next(err);
    }
});

userController.patch('/update-details', isAuth, async (req, res, next) => {
    try {
        const validationResult = updateUserDetailsSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw validationResult.error;
        }

        const [_, details] = await user_details.update(validationResult.data, { where: { userAccountsId: req.user.userId }, returning: true, plain: true });

        const updatedDetails = details.dataValues;
        updatedDetails.age = ageCalculate(updatedDetails.birthDate);

        eventEmitter.emit('userCacheUpdate', { type: 'users', data: { ...updatedDetails }, adId: null, userId: req.user.userId, action: 'details' });
        eventEmitter.emit('userCacheUpdate', { type: 'users', data: null, adId: null, userId: req.user.userId, action: 'enabled' });

        res.status(200).json({ message: 'Details edited successfully!', details: updatedDetails });
    } catch (err) {
        next(err);
    }
});

userController.get('/single-user', isAuth, rbac.checkPermission('userDetails', 'read'), async (req, res, next) => {
    try {
        const user = await user_account.findOne({
            where: { id: req.user.userId },
            attributes: ['email', ['finished', 'enabled'], 'createdAt', 'role', 'updatedAt', 'roleChangeComment', 'password'],
            include: [
                {
                    model: user_details,
                    as: 'details',
                    attributes: [
                        'phoneNumber',
                        'username',
                        'firstName',
                        'lastName',
                        'region',
                        'workOptions',
                        'skills',
                        'interestOptions',
                        'gender',
                        'imageURL',
                        'firebaseImagePath',
                    ],
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
                        'userId',
                    ],
                },
            ],
        });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        const { id, password, details, ...restUser } = user.dataValues;

        return res.status(200).json({
            message: 'User data retrieved successfully.',
            user: {
                ...restUser,
                hasPassword: !!password,
                details: {
                    ...details.dataValues,
                    age: ageCalculate(details?.birthDate),
                },
            },
        });
    } catch (err) {
        next(err);
    }
});

userController.post('/contact-form', async (req, res, next) => {
    try {
        const { name, message, email, recaptchaToken, subject } = req.body;

        if (!name || !message || !email || !subject) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const recaptchaResult = await verifyRecaptcha(recaptchaToken);

        if (!recaptchaResult.success || (recaptchaResult.score !== undefined && recaptchaResult.score < 0.5)) {
            throw new CustomError('Failed reCAPTCHA verification', 400, { reason: recaptchaResult['error-codes'] || 'Low score' });
        }

        await forwardEmailsViaZoho({
            userEmail: email,
            subject: `Съобщение от контактна форма - ${subject}`,
            body: `Име: ${name}<br><br>Съобщение:<br>${message}`,
            toAddresses: ['help@pensa.club', 'pensa.club@gmail.com'],
        });

        return res.status(200).json({ message: 'Your message has been sent successfully.' });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = userController;
