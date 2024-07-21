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

    data.approved = false;

    await user_ads.create({ user_id: req.user.userId, ...data });

    res.status(200).json({ message: 'Ad successfully created.' });
  } catch (err) {
    next(err);
  }
});

adsController.get('/approved-ads', memoryCache, async (req, res, next) => {
  const limit = req.query.limit;
  const options = { where: { status: 'approved' }, order: [['createdAt', 'DESC']] }
  if (limit) options.limit = Number(limit);
  try {
    const ads = await user_ads.findAll(options);
    const mappedAds = ads.map(ad => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/unapproved-ads', isAuth, rbac.checkPermission('approve_record'), memoryCache, async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const options = { where: { [Op.ne]: 'approved' }, order: [['createdAt', 'DESC']] }
    if (limit) options.limit = Number(limit);
    const ads = await user_ads.findAll(options);
    const mappedAds = ads.map(ad => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/user-ads', isAuth, memoryCache, async (req, res, next) => {
  try {
    const { email } = req.user;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email is invalid." });
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
    const { adId, newStatus } = req.body;
    if (newStatus !== 'pending' && newStatus !== 'approved' && newStatus !== 'denied') {
      return res.status(400).json({ message: "Invalid status type. Status must be approved, denied or pending." });
    }

    const [updatedRowsCount, [updatedAd]] = await user_ads.update(
      { status: newStatus },
      {
        where: {
          ad_id: adId,
          status: { [Op.ne]: newStatus } // Only update if current status is different
        }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(400).json({ message: `Ad status is already ${newStatus}.` });
    }
    if (updatedAd && updatedAd.status === newStatus) {
      return res.status(400).json({ message: `Ad status is already ${newStatus}.` });
    }

    eventEmitter.emit('adsApproved', ad);

    res.status(200).json({ message: 'Ad has been approved successfully.' });
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
      approved = ad.status;
      await ad.destroy();

      eventEmitter.emit('adsDeleted', ad, approved); // TODO CHANGE BASED ON CACHING IF NEEDED

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

    data.approved = false;

    const [affectedRows, [details]] = await user_ads.update(data, { where: { ad_id: data.ad_id, user_id: req.user.userId }, returning: true });

    if (!details) {
      return res.status(404).json({ message: 'Ad not found or wrong user credentials.' });
    }
    if (affectedRows <= 1) {
      return res.status(404).json({ message: 'No changes were made.' });
    }
    else {
      if (details.dataValues?.status !== 'pending') {
        const ad = details;
        ad.status = 'pending';
        await ad.save();
      }
      eventEmitter.emit('adsUpdated', details.dataValues); // TODO CHANGE BASED ON CACHING IF NEEDED
    }

    const updatedDetails = fieldSwap(details[0].dataValues, 'mapFromDb');

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

    //Change to false for testing !!!
    whereCondition.approved = true;

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
        'approved',
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

module.exports = adsController;
