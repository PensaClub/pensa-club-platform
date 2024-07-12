const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
const fieldSwap = require('../utils/fieldSwap.js');
const adsValidator = require('../utils/adsValidator.js');
const { where, Op, literal } = require('sequelize');

adsController.post('/ad-create', isAuth, async (req, res, next) => {
  try {
    adsValidator(req.body);

    const data = fieldSwap(req.body, 'mapToDb');

    data.approved = false;

    await user_ads.create({ user_id: req.user.userId, ...data });

    res.status(200).json({ message: 'Ad successfully created.' });
  } catch (err) {
    next(err);
  }
});

adsController.get('/get-approved', isAuth, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({ where: { approved: true } });
    res.status(200).json({ ...ads });
  } catch (err) {
    next(err);
  }
});

adsController.get('/get-unapproved', rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({ where: { approved: false } });
    res.status(200).json({ ...ads });
  } catch (err) {
    next(err);
  }
});

adsController.post('/approve-ad', rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    const ad = await user_ads.findOne({ where: { id } });
    if (!ad) {
      res.status(400).json({ message: "ID doesn't match an existing ad." });
    }
    if (ad.approved) {
      res.status(400).json({ message: 'Ad has already been approved.' });
    }
    ad.approved = true;
    ad.save();
    res.status(200).json({ message: 'Ad has been approved successfully.', ad });
  } catch (err) {
    next(err);
  }
});

adsController.post('/delete-ad', isAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    const ad = await user_ads.findOne({ where: { id } });
    if (!ad) {
      res.status(400).json({ message: "ID doesn't match an existing ad." });
    }
    if (req.user.role === 'admin' || req.user.userId == ad.user_id) {
      await ad.destroy();
      res.status(200).json({ message: 'Ad successfully deleted' });
    }
    res.status(400).json({ message: 'Access denied.' });
  } catch (err) {
    next(err);
  }
});

adsController.patch('/ad-edit', isAuth, async (req, res, next) => {
  try {
    adsValidator(req.body, req.path);

    const data = fieldSwap(req.body, 'mapToDb');

    data.approved = false;

    const [affectedRows, details] = await user_ads.update(data, { where: { ad_id: data.ad_id }, returning: true });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Ad not found or no changes made.' });
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
  const allowedQueryKeys = ['creationDate', 'expirationDate', 'tags', 'category', 'summary', 'adRegion', 'adMunicipality', 'adTown', 'startDate', 'endDate'];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  try {
    const query = Object.fromEntries(Object.entries(req.query).filter(([key]) => allowedQueryKeys.includes(key)));

    const dateFields = ['startDate', 'endDate', 'creationDate', 'expirationDate'];

    for (let key in query) {
      if (dateFields.includes(key)) {
        if (!dateRegex.test(query[key])) {
          errors[key] = 'Date format must be YYYY-MM-DD';
        } else {
          if (key === 'startDate') startDate = query[key];
          if (key === 'endDate') endDate = query[key];
          if (key === 'creationDate') {
            whereCondition.creation_date = { [Op.gte]: query[key] };
          }
          if (key === 'expirationDate') {
            whereCondition.expiration_date = { [Op.lte]: query[key] };
          }
        }
      } else if (key === 'category') {
        if (query[key] !== 'all') {
          if (validCategories.includes(query[key])) {
            whereCondition.category = query[key];
          } else {
            errors.category = `Invalid category: ${query[key]}. Valid categories are ${validCategories.join(', ')}. Excluding this filter from search.`;
          }
        }
      } else if (key === 'tags') {
        const tagsArray = query[key].split(',').map((tag) => tag.trim().toLowerCase());
        const tagConditions = tagsArray.map((tag) => literal(`LOWER(array_to_string(tags, ',')) LIKE '%${tag.replace(/'/g, "''")}%'`));
        whereCondition[Op.or] = tagConditions;
      } else if (key === 'adTown' || key === 'adRegion' || key === 'adSubregion') {
        let newKey = `${key.toLowerCase().replace('ad', 'ad_')}`;
        whereCondition[newKey] = {
          [Op.iLike]: `%${query[key]}%`,
        };
      } else {
        whereCondition[key] = {
          [Op.iLike]: `%${query[key]}%`,
        };
      }
    }

    if (startDate && endDate) {
      whereCondition.creation_date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereCondition.creation_date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereCondition.creation_date = {
        [Op.lte]: endDate,
      };
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
              attributes: ['username', ['first_name', 'firstName'], ['last_name', 'lastName']],
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
