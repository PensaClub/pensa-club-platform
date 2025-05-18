const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
const { where, Op, literal } = require('sequelize');
const memoryCache = require('../middlewares/caching.js');
const eventEmitter = require('../utils/eventEmitter.js');
const { createAdSchema, updateAdSchema, extraFieldsSchema } = require('../schemas/ads.schema');

adsController.post('/ad-create', isAuth, rbac.checkPermission('ad', 'create'), async (req, res, next) => {
    try {
        let { extraFields, ...regularFields } = req.body;

        const validationResult = createAdSchema.safeParse(regularFields);
        if (!validationResult.success) {
            throw validationResult.error;
        }

        if (extraFields) {
            const extraFieldsResult = extraFieldsSchema.safeParse(extraFields);
            if (!extraFieldsResult.success) {
                throw extraFieldsResult.error;
            }
            extraFields = extraFieldsResult.data;
        }

        const data = { ...regularFields, extraFields };

        if (data.status) {
            return res.status(400).json({ message: 'Status cannot be updated through this endpoint.' });
        }

        if (data.adminComment) {
            return res.status(400).json({ message: 'Admin comment cannot be updated through this endpoint.' });
        }

        const ad = await user_ads.create({ userId: req.user.userId, ...data });

        eventEmitter.emit('userCacheUpdate', { type: 'ads', data: { ...ad.dataValues }, adId: ad.adId, userId: req.user.userId });

        return res.status(200).json({ message: 'Ad successfully created.' });
    } catch (err) {
        next(err);
    }
});

adsController.get(`/:adStatus-ads/:adId?`, isAuth, rbac.checkPermission('ad', 'approve'), memoryCache('ads'), async (req, res, next) => {
    const adsType = ['approved', 'pending', 'denied'];

    try {
        const { adStatus, adId } = req.params;

        if (!adsType.includes(adStatus)) return res.status(404).json({ message: 'Invalid status type. Status must be approved, pending or denied.', ads: [] });

        const whereCondition = {
            status: adStatus,
        };

        if (adId) whereCondition.adId = adId;

        const ads = await user_ads.findAll({
            where: whereCondition,
            include: [
                {
                    model: user_account,
                    as: 'account',
                    attributes: ['email'],
                },
            ],
        });

        const adsArray = Array.isArray(ads) ? ads : [];

        if (adId && adsArray.length === 0) {
            return res.status(404).json({ message: `There is no ad with such ID at the moment.`, ads: [] });
        } else if (!adId && adsArray.length === 0) {
            return res.status(200).json({ message: `There are no ads at the moment.`, ads: [] });
        }

        const mappedAds = ads.map((ad) => {
            const newAd = ad.get({ plain: true });
            newAd.account = { email: ad.account.email };
            return newAd;
        });

        return res.status(200).json({ message: `${adStatus.charAt(0).toUpperCase() + adStatus.slice(1)} ads successfully retrieved.`, ads: mappedAds });
    } catch (err) {
        next(err);
    }
});

adsController.get('/adById/:adId', rbac.checkPermission('ad', 'read'), memoryCache('ads'), async (req, res, next) => {
    try {
        const adId = req.params.adId;
        const ad = await user_ads.findOne({
            where: { adId },
            include: [
                {
                    model: user_account,
                    as: 'account',
                    attributes: ['email'],
                    include: [
                        {
                            model: user_details,
                            as: 'details',
                            attributes: ['username', 'imageURL', 'workOptions', 'interestOptions', 'skills', 'phoneNumber', 'gender'],
                        },
                    ],
                },
            ],
        });

        if (!ad) return res.status(404).json({ message: `Ad with ID ${adId} does not exist.` });

        return res.status(200).json({
            message: 'Ad successfully retrieved.',
            ads: ad.dataValues,
            details: {
                ...ad.dataValues.account.dataValues.details.dataValues,
                email: ad.account.dataValues.email,
            },
        });
    } catch (err) {
        next(err);
    }
});

adsController.get('/ads-user/:email', isAuth, rbac.checkPermission('ad', 'read'), memoryCache('ads'), async (req, res, next) => {
    try {
        const email = req.params.email;
        const whereCondition = {};

        if (email !== req.user.email) {
            whereCondition.status = 'approved';
        }

        if (!email) return res.status(404).json({ message: 'Email is required.' });

        const ads = await user_ads.findAll({
            where: whereCondition,
            include: [
                {
                    model: user_account,
                    as: 'account',
                    where: { email },
                    attributes: [],
                },
            ],
        });

        if (ads.length === 0) return res.status(404).json({ message: 'No ads found for the specified user.', ads: [] });

        return res.status(200).json({ message: 'User ads successfully retrieved.', ads: ads.map((ad) => ad.dataValues) });
    } catch (err) {
        next(err);
    }
});

adsController.post('/ad-update-status', isAuth, rbac.checkPermission('ad', 'approve'), async (req, res, next) => {
    const adsType = ['approved', 'pending', 'denied'];

    try {
        let { adId, newStatus, adminComment } = req.body;

        if (!adsType.includes(newStatus)) return res.status(400).json({ message: 'Invalid status type. Status must be approved, pending or denied.' });

        if (newStatus === 'denied' && !adminComment) {
            return res.status(400).json({ message: 'Denying an ad requires admin comment explanation.' });
        }

        if (!adminComment) adminComment = null;

        const [updatedRowsCount, [updatedAd]] = await user_ads.update(
            {
                status: newStatus,
                adminComment,
            },
            {
                where: {
                    adId,
                    status: { [Op.ne]: newStatus },
                },
                returning: true,
            }
        );

        if (updatedRowsCount === 0) return res.status(404).json({ message: `Ad could not be found or status is already ${newStatus}` });

        eventEmitter.emit('userCacheUpdate', { type: 'ads', data: { ...updatedAd.dataValues }, adId, userId: null });

        return res.status(200).json({ message: 'Ad status has been updated successfully.' });
    } catch (err) {
        next(err);
    }
});

adsController.delete('/ad-delete/:adId', isAuth, rbac.checkPermission('ad', 'delete'), async (req, res, next) => {
    try {
        const adId = req.params.adId;

        const ad = await user_ads.findOne({ where: { adId } });

        if (!ad) return res.status(404).json({ message: "ID doesn't match an existing ad." });

        if (req.user.role === 'admin' || req.user?.userId == ad.userId) {
            await ad.destroy();

            eventEmitter.emit('userCacheUpdate', { type: 'ads', data: null, adId, userId: null, action: 'delete' });

            return res.status(200).json({ message: 'Ad has been deleted successfully.' });
        }
        return res.status(400).json({ message: 'Access denied.' });
    } catch (err) {
        next(err);
    }
});

adsController.patch('/ad-edit', isAuth, rbac.checkPermission('ad', 'update'), async (req, res, next) => {
    try {
        const { extraFields, ...regularFields } = req.body;

        const validationResult = updateAdSchema.safeParse(regularFields);
        if (!validationResult.success) {
            throw validationResult.error;
        }

        if (extraFields) {
            const extraFieldsResult = extraFieldsSchema.safeParse(extraFields);
            if (!extraFieldsResult.success) {
                throw extraFieldsResult.error;
            }
            extraFields = extraFieldsResult.data;
        }

        const data = { ...regularFields, extraFields };

        if (regularFields.status) {
            return res.status(400).json({ message: 'Status cannot be updated through this endpoint.' });
        }
        if (regularFields.adminComment) {
            return res.status(400).json({ message: 'Admin comment cannot be updated through this endpoint.' });
        }

        const where = {
            adId: regularFields.adId,
            userId: req.user.userId,
        };

        const [affectedRows, [details]] = await user_ads.update({ ...data, status: 'pending' }, { where, returning: true });

        if (!details) {
            return res.status(404).json({ message: 'Ad not found or wrong user credentials.' });
        }

        eventEmitter.emit('userCacheUpdate', { type: 'ads', data: { ...details.dataValues }, adId: regularFields.adId, userId: req.user.userId });

        return res.status(200).json({ message: 'Ad details edited successfully!', details: details.dataValues });
    } catch (err) {
        next(err);
    }
});

adsController.get('/ads-search', rbac.checkPermission('ad', 'read'), async (req, res, next) => {
    const whereCondition = {};
    const errors = {};

    const validCategories = ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'];
    const dateFields = ['startDate', 'endDate', 'creationDate', 'expirationDate', 'eventStartDate', 'eventEndDate'];
    const orderValues = ['ASC', 'DESC'];
    const allowedQueryKeys = [
        'creationDate',
        'expirationDate',
        'tags',
        'category',
        'summary',
        'adRegion',
        'adSubregion',
        'adTown',
        'startDate',
        'endDate',
        'eventStartDate',
        'eventEndDate',
        'limit',
        'page',
        'order',
    ];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    try {
        const query = Object.fromEntries(Object.entries(req.query).filter(([key]) => allowedQueryKeys.includes(key)));

        const { adRegion, adSubregion, adTown } = query;
        const adLocationConditions = [];
        const paginationConditions = { lastPage: false };
        const orderConditions = [];

        if (adSubregion && !adRegion) {
            errors.adSubregion = 'adSubregion filter requires adRegion to be specified.';
        }
        if (adTown && (!adRegion || !adSubregion)) {
            errors.adTown = 'adTown filter requires both adRegion and adSubregion to be specified.';
        }

        const processPaginationFields = (key, value) => {
            const number = key === 'limit' ? 10 : 1;
            return value < 1 || isNaN(Number(value)) ? (value = number) : parseInt(value);
        };

        const processDateFields = (key, value) => {
            if (!dateRegex.test(value)) {
                errors[key] = 'Date format must be YYYY-MM-DD';
                return;
            }
            if (key === 'creationDate') {
                whereCondition.creationDate = { [Op.gte]: value };
            } else if (key === 'expirationDate') {
                whereCondition.expirationDate = { [Op.lte]: value };
            }
        };

        const processCategoryField = (value) => {
            if (value !== 'all') {
                const currentValue = value.split(',');
                if (currentValue.every((v) => validCategories.includes(v))) {
                    whereCondition.category = value.split(',');
                } else {
                    errors.category = `Invalid category: ${value}. Valid categories are ${validCategories.join(', ')}. Excluding this filter from search.`;
                }
            }
        };

        const processTagsField = (value) => {
            const tagsArray = value.split(',').map((tag) => tag.trim().toLowerCase());
            const tagConditions = tagsArray.map((tag) => literal(`LOWER(array_to_string(tags, ',')) LIKE '%${tag.replace(/'/g, "''")}%'`));
            whereCondition[Op.or] = tagConditions;
        };

        const processAdField = (key, value) => {
            adLocationConditions.push({
                [key]: value,
            });
        };

        for (let key in query) {
            const value = query[key];
            if (dateFields.includes(key)) {
                processDateFields(key, value);
            } else if (key === 'category') {
                processCategoryField(value);
            } else if (key === 'tags') {
                processTagsField(value);
            } else if (['adTown', 'adRegion', 'adSubregion'].includes(key)) {
                if (key === 'adSubregion' && !adRegion) continue;
                if (key === 'adTown' && (!adRegion || !adSubregion)) continue;
                processAdField(key, value);
            } else if (key === 'limit' || key === 'page') {
                paginationConditions[key] = processPaginationFields(key, value);
            } else if (key === 'order') {
                if (!orderValues.includes(value.toUpperCase())) {
                    errors.order = `Invalid order value: ${value}. Valid values are ${orderValues.join(', ')}. Defaulting to ASC.`;
                } else {
                    orderConditions.push(['updatedAt', `${value.toUpperCase()}`]);
                }
            } else {
                whereCondition[key] = {
                    [Op.iLike]: `%${value}%`,
                };
            }
        }

        const processDateRangeFields = (startKey, endKey, fieldKey) => {
            const start = query[startKey];
            const end = query[endKey];
            if (start && dateRegex.test(start) && end && dateRegex.test(end)) {
                if (fieldKey === 'extraFields') {
                    whereCondition[fieldKey] = {
                        eventStartDate: { [Op.gte]: query[startKey] },
                        eventEndDate: { [Op.lte]: query[endKey] },
                    };
                } else {
                    whereCondition[fieldKey] = {
                        [Op.between]: [start, end],
                    };
                }
            } else if (start && dateRegex.test(start)) {
                whereCondition[fieldKey] = {
                    [Op.gte]: query[startKey],
                };
            } else if (end && dateRegex.test(end)) {
                whereCondition[fieldKey] = {
                    [Op.lte]: query[endKey],
                };
            }
        };

        processDateRangeFields('eventStartDate', 'eventEndDate', 'extraFields');
        processDateRangeFields('startDate', 'endDate', 'creationDate');

        if (adLocationConditions.length > 0) {
            whereCondition[Op.and] = adLocationConditions;
        }

        // Status to be changed to pending FOR TESTING !!!
        whereCondition.status = 'approved';

        if (paginationConditions.page) {
            paginationConditions.limit = paginationConditions.limit || 10;

            const totalRecordsInDb = await user_ads.count({ where: whereCondition });

            if (totalRecordsInDb === 0) return res.status(200).json({ result: [], errors });

            const totalNumberOfPages = Math.ceil(totalRecordsInDb / paginationConditions.limit);

            paginationConditions.page >= totalNumberOfPages
                ? ((paginationConditions.page = totalNumberOfPages), (paginationConditions.lastPage = true))
                : paginationConditions.page;

            paginationConditions.offset = (paginationConditions.page - 1) * paginationConditions.limit;

            if (paginationConditions.offset > totalRecordsInDb) {
                paginationConditions.offset = totalRecordsInDb;
            }
        }

        const result = await user_ads.findAll({
            where: whereCondition,
            order: orderConditions,
            limit: paginationConditions.limit,
            offset: paginationConditions.offset,
            attributes: [
                'adId',
                'summary',
                'category',
                'adRegion',
                'adSubregion',
                'adTown',
                'street',
                'tags',
                'images',
                'status',
                'extraFields',
                'creationDate',
                'expirationDate',
                'updatedAt',
            ],
            include: [
                {
                    model: user_account,
                    as: 'account',
                    required: true,
                    attributes: ['email'],
                    include: [
                        {
                            model: user_details,
                            as: 'details',
                            attributes: ['username', 'firstName', 'lastName', 'imageURL', 'gender'],
                        },
                    ],
                },
            ],
        });

        return res.status(200).json({ result, errors, lastPage: paginationConditions.lastPage });
    } catch (err) {
        next(err);
    }
});

adsController.patch('/update-expiration-date/:adId', isAuth, rbac.checkPermission('ad', 'update'), async (req, res, next) => {
    try {
        const adId = req.params.adId;

        if (!adId) return res.status(400).json({ message: 'Ad ID is required.' });

        const expirationDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];

        const [affectedRows, [details]] = await user_ads.update(
            { expirationDate },
            {
                where: {
                    userId: req.user.userId,
                    adId,
                },
                returning: true,
            }
        );

        if (affectedRows === 0) return res.status(404).json({ message: 'No such ad was found.' });

        eventEmitter.emit('userCacheUpdate', { type: 'ads', data: { ...details.dataValues }, adId, userId: req.user.userId });

        return res.status(200).json({ message: `Expiration date successfully changed to ${expirationDate}` });
    } catch (err) {
        next(err);
    }
});

module.exports = adsController;
