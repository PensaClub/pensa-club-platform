const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
const fieldSwap = require('../utils/fieldSwap.js');
const adsValidator = require('../utils/adsValidator.js');
const { where, Op, literal } = require('sequelize');
const memoryCache = require('../middlewares/caching.js');
const eventEmitter = require('../utils/eventEmitter.js');
const extraFieldsValidator = require('../utils/extraFieldsValidator.js');
const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

adsController.post('/ad-create', isAuth, async (req, res, next) => {
  try {
    const { extraFields, ...regularFields } = req.body;

    adsValidator(regularFields);
    if (extraFields) extraFieldsValidator(extraFields);

    const data = fieldSwap({ ...regularFields, extraFields }, 'mapToDb');

    if (data.status) {
      return res.status(400).json({ message: 'Status cannot be updated through this endpoint.' });
    }

    const ad = await user_ads.create({ user_id: req.user.userId, ...data });

    eventEmitter.emit('adsCreated', ad.dataValues);

    res.status(200).json({ message: 'Ad successfully created.' });
  } catch (err) {
    next(err);
  }
});

adsController.get('/approved-ads/:userId?', isAuth, memoryCache, async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const whereCondition = {
      status: 'approved',
    };
    if (userId) {
      whereCondition.user_id = Number(userId);
    }

    const ads = await user_ads.findAll({ where: whereCondition });

    if (ads.length === 0) return res.status(200).json({ message: 'This user does not have approved ads at the moment.' });

    const mappedAds = ads.map((ad) => fieldSwap(ad.dataValues, 'mapFromDb'));

    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/unapproved-ads/:userId?', isAuth, rbac.checkPermission('approve_record'), memoryCache, async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const whereCondition = {
      status: { [Op.ne]: 'approved' },
    };

    if (userId) {
      whereCondition.user_id = Number(userId);
    }

    const ads = await user_ads.findAll({
      whereCondition
    });

    const mappedAds = ads.map((ad) => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/user-ads', isAuth, memoryCache, async (req, res, next) => {
  try {
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }
    const ads = await user_ads.findAll({
      include: [
        {
          model: user_account,
          as: 'account',
          where: { email },
          attributes: [],
        },
      ],
    });

    const mappedAds = ads.map((ad) => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json({ mappedAds });
  } catch (err) {
    next(err);
  }
});

adsController.post('/ad-update-status', isAuth, rbac.checkPermission('approve_record'), async (req, res, next) => {
  try {
    let { adId, newStatus, adminComment } = req.body;
    if (newStatus !== 'pending' && newStatus !== 'approved' && newStatus !== 'denied') {
      return res.status(400).json({ message: 'Invalid status type. Status must be approved, denied or pending.' });
    }
    if (newStatus === 'denied' && !adminComment) {
      return res.status(400).json({ message: 'Denying an ad requires admin comment explanation.' });
    }
    if (!adminComment) {
      adminComment = null;
    }

    const [updatedRowsCount, updatedAd] = await user_ads.update(
      {
        status: newStatus,
        admin_comment: adminComment,
      },
      {
        where: {
          ad_id: adId,
          status: { [Sequelize.Op.ne]: newStatus }, // Only update if current status is different
        },
        returning: true,
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: `Ad could not be found or status is already ${newStatus}` });
    }

    eventEmitter.emit('adsStatusUpdate', updatedAd[0].dataValues, newStatus);

    res.status(200).json({ message: 'Ad status has been updated successfully.' });
  } catch (err) {
    next(err);
  }
});

adsController.post('/ad-delete', isAuth, async (req, res, next) => {
  try {
    const { adId } = req.body;
    const ad = await user_ads.findOne({ where: { ad_id: adId } });
    if (!ad) {
      return res.status(400).json({ message: "ID doesn't match an existing ad." });
    }
    if (req.user.role === 'admin' || req.user?.userId == ad.user_id) {
      let approvedStr = ad.status === 'approved' ? 'approved' : 'unapproved';
      await ad.destroy();

      eventEmitter.emit('adsDeleted', ad.dataValues, approvedStr);

      return res.status(200).json({ message: 'Ad has been deleted successfully.' });
    }
    res.status(400).json({ message: 'Access denied.' });
  } catch (err) {
    next(err);
  }
});

adsController.patch('/ad-edit', isAuth, async (req, res, next) => {
  try {
    const { extraFields, ...regularFields } = req.body;

    adsValidator(regularFields);
    if (extraFields) extraFieldsValidator(extraFields);

    const data = fieldSwap({ ...regularFields, extraFields }, 'mapToDb');

    if (data.status) {
      return res.status(400).json({ message: 'Status cannot be updated through this endpoint.' });
    }

    const where = {
      ad_id: data.ad_id,
      user_id: req.user.userId,
    };

    const [affectedRows, [details]] = await user_ads.update(data, { where, returning: true });

    if (!details) {
      return res.status(404).json({ message: 'Ad not found or wrong user credentials.' });
    }

    let approvedStr = 'unapproved';
    if (details.dataValues?.status !== 'pending') {
      const ad = details;
      if (ad.status === 'approved') approvedStr = 'approved';
      ad.status = 'pending';
      await ad.save();
    }
    eventEmitter.emit('adsUpdated', details.dataValues, approvedStr);

    const updatedDetails = fieldSwap(details.dataValues, 'mapFromDb');

    res.status(200).json({ message: 'Ad details edited successfully!', details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

adsController.get('/ads-search', async (req, res, next) => {
  const whereCondition = {};
  const errors = {};

  const validCategories = ['recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'];
  const dateFields = ['startDate', 'endDate', 'creationDate', 'expirationDate', 'eventStartDate', 'eventEndDate'];
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
  ];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  try {
    const query = Object.fromEntries(Object.entries(req.query).filter(([key]) => allowedQueryKeys.includes(key)));

    const { adRegion, adSubregion, adTown } = query;
    const adLocationConditions = [];

    if (adSubregion && !adRegion) {
      errors.adSubregion = 'adSubregion filter requires adRegion to be specified.';
    }
    if (adTown && (!adRegion || !adSubregion)) {
      errors.adTown = 'adTown filter requires both adRegion and adSubregion to be specified.';
    }

    const processDateFields = (key, value) => {
      if (!dateRegex.test(value)) {
        errors[key] = 'Date format must be YYYY-MM-DD';
        return;
      }
      if (key === 'creationDate') {
        whereCondition.creation_date = { [Op.gte]: value };
      } else if (key === 'expirationDate') {
        whereCondition.expiration_date = { [Op.lte]: value };
      }
    };

    const processCategoryField = (value) => {
      if (value !== 'all') {
        if (validCategories.includes(value)) {
          whereCondition.category = value;
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
      const newKey = `${key.toLowerCase().replace('ad', 'ad_')}`;
      adLocationConditions.push({
        [newKey]: value,
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
        if (fieldKey === 'extra_fields') {
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

    processDateRangeFields('eventStartDate', 'eventEndDate', 'extra_fields');
    processDateRangeFields('startDate', 'endDate', 'creation_date');

    if (adLocationConditions.length > 0) {
      whereCondition[Op.and] = adLocationConditions;
    }

    // Status to be changed to pending FOR TESTING !!!
    whereCondition.status = 'approved';

    const result = await user_ads.findAll({
      where: whereCondition,
      attributes: [
        'summary',
        'category',
        ['ad_region', 'adRegion'],
        ['ad_subregion', 'adSubregion'],
        ['ad_town', 'adTown'],
        ['ad_id', 'adId'],
        'images',
        'status',
        'street',
        ['extra_fields', 'extraFields'],
        ['creation_date', 'creationDate'],
        ['expiration_date', 'expirationDate'],
        'tags',
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
              attributes: ['username', ['first_name', 'firstName'], ['last_name', 'lastName'], 'imageURL'],
            },
          ],
        },
      ],
    });

    res.status(200).json({ result, errors });
  } catch (err) {
    next(err);
  }
});

adsController.patch('/update-expiration-date/:adId', isAuth, async (req, res, next) => {
  try {
    const { adId } = req.params;

    if (!adId) {
      return res.status(400).json({ message: 'adId is required.' });
    }

    const expirationDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0];

    const [affectedRows, _] = await user_ads.update({ expiration_date: expirationDate }, { where: { user_id: req.user.userId, ad_id: adId }, returning: true });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'No such ad was found.' });
    }

    res.status(200).json({ message: `Expiration date successfully changed to ${expirationDate}` });
  } catch (err) {
    next(err);
  }
});

module.exports = adsController;
