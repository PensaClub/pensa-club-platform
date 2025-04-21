const suggestUserController = require('express').Router();

const { user_suggest } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
const { where } = require('sequelize');
const CustomError = require('../utils/customError.js');
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;

suggestUserController.post('/', async (req, res, next) => {
    let errors = {};
    try {
        const { name, phoneNumber, message, reffererName } = req.body;

        if (name.length < 3 || name.length > 40) errors.name = 'Name must be between 3 and 40 characters in length.';
        if (reffererName.length < 3 || reffererName.length > 40) errors.reffererName = 'Refferer name must be between 3 and 40 characters in length.';
        if (message.length < 5 || message.length > 100) errors.message = 'The length of the message must be between 5 and 100 characters.';
        if (!phoneRegex.test(phoneNumber)) errors.phoneNumber = 'Invalid phone number.';

        if (Object.keys(errors).length > 0) {
            throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
        }

        const data = {
            name,
            phone_number: phoneNumber,
            message,
            refferer_name: reffererName,
        };

        const details = await user_suggest.create(data);

        res.status(200).send({
            message: 'User successfully suggested!',
            data: { details },
        });
    } catch (err) {
        next(err);
    }
});

suggestUserController.get('/resolved', isAuth, rbac.checkPermission('suggestion', 'read'), async (req, res, next) => {
    try {
        const userData = await user_suggest.findAll({
            where: { resolved: true },
        });

        if (userData.length === 0) {
            return res.status(200).json({ message: 'No resolved suggestions found', userData: [] });
        }

        res.status(200).json({ message: 'Suggested Users data retrieved successfully.', userData });
    } catch (err) {
        next(err);
    }
});
suggestUserController.get('/unresolved', isAuth, rbac.checkPermission('suggestion', 'read'), async (req, res, next) => {
    try {
        const userData = await user_suggest.findAll({
            where: { resolved: false },
        });

        if (userData.length === 0) {
            return res.status(200).json({ message: 'No unresolved suggestions found', userData: [] });
        }

        res.status(200).json({ message: 'Suggested Users data retrieved successfully.', userData });
    } catch (err) {
        next(err);
    }
});

suggestUserController.post('/delete', isAuth, rbac.checkPermission('suggestion', 'delete'), async (req, res, next) => {
    try {
        const { id } = req.body;
        const entry = await user_suggest.findOne({ where: { id } });
        if (!entry) {
            res.status(400).json({ message: "ID doesn't match an existing entry." });
        }

        await entry.destroy();

        res.status(200).json({ message: 'Suggestion has been deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

suggestUserController.post('/resolve', isAuth, rbac.checkPermission('suggestion', 'approve'), async (req, res, next) => {
    try {
        const { id } = req.body;

        const entry = await user_suggest.findOne({ where: { id } });

        if (!entry) {
            return res.status(400).json({ message: "ID doesn't match an existing entry." });
        }

        entry.resolved = true;
        await entry.save();

        res.status(200).json({ message: 'Suggestion has been marked as resolved successfully.' });
    } catch (err) {
        next(err);
    }
});

suggestUserController.post('/comments', isAuth, rbac.checkPermission('suggestion', 'comment'), async (req, res, next) => {
    try {
        const { comment, id } = req.body;

        const entry = await user_suggest.findOne({ where: { id } });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found.' });
        }

        entry.comments = [...entry.comments, { comment, date: new Date() }];

        await entry.save();

        res.status(200).json({ message: 'Message added successfully.', comments: entry.comments });
    } catch (err) {
        next(err);
    }
});

module.exports = suggestUserController;
