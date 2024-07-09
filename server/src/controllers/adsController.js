const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
const fieldSwap = require('../utils/fieldSwap.js');
const adsValidator = require('../utils/adsValidator.js');
const { where } = require('sequelize');
const memoryCache = require('../middlewares/caching.js');
const eventEmitter = require('../utils/eventEmitter.js');
const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

adsController.post('/ad-create', isAuth, async (req, res, next) => {
  try {
    adsValidator(req.body);

    const data = fieldSwap(req.body, 'mapToDb');
    const ad = await user_ads.create({ user_id: req.user.userId, ...data });

    res.status(200).json({ message: 'Ad successfully created.' });
  } catch (err) {
    next(err);
  }
});

adsController.get('/approved-ads', memoryCache, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({ where: { approved: true } });
    const mappedAds = ads.map(ad => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/unapproved-ads', rbac.checkPermission('approve_record'), isAuth, memoryCache, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({ where: { approved: false } });
    const mappedAds = ads.map(ad => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/user-ads', isAuth, memoryCache, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required." });
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Email is invalid." });
    }
    const ads = await user_ads.findAll({
      include: [{
        model: user_account,
        as: "account",
        where: { email },
        attributes: []
      }]
    });

    const mappedAds = ads.map(ad => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json({ mappedAds });
  } catch (err) {
    next(err);
  }
});

adsController.post('/ad-approve', rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
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
    
    eventEmitter.emit('adsApproved', ad);

    res.status(200).json({ message: "Ad has been approved successfully." });
  } catch (err) {
    next(err);
  }
});

adsController.post('/ad-delete', isAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    const ad = await user_ads.findOne({ where: { id } });
    if (!ad) {
      res.status(400).json({ message: "ID doesn't match an existing ad." });
    }
    if (req.user.role === 'admin' || req.user?.userId == ad.user_id) {
      approved = ad.approved;
      await ad.destroy();

      eventEmitter.emit('adsDeleted', ad, approved ? 'approved' : 'unapproved');

      res.status(200).json({ message: 'Ad has been deleted successfully.' });
    }
    res.status(400).json({ message: 'Access denied.' });
  } catch (err) {
    next(err);
  }
});

adsController.patch('/ad-edit', isAuth, async (req, res, next) => {
  try {
    adsValidator(req.body);

    const data = fieldSwap(req.body, 'mapToDb');

    const [_, details] = await user_ads.update(data, { where: { ad_id: data.ad_id }, returning: true, plain: true });

    const updatedDetails = fieldSwap(details.dataValues, 'mapFromDb');

    res.status(200).json({ message: 'Ad details edited successfully!', details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

module.exports = adsController;
