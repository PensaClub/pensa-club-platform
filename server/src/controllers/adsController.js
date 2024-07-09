const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
const fieldSwap = require('../utils/fieldSwap.js');
const adsValidator = require('../utils/adsValidator.js');
const { where } = require('sequelize');

adsController.post('/ad-create', isAuth, async (req, res, next) => {
  try {
    adsValidator(req.body);

    const data = fieldSwap(req.body, 'mapToDb');

    const ad = await user_ads.create({ user_id: req.user.userId, ...data });

    // if we switch from pure adId to details use the line below (doesn`t include id!)
    // const newAd = fieldSwap(ad.dataValues, 'mapFromDb');

    res.status(200).json({ message: 'Ad successfully created.', adId: ad.dataValues.ad_id });
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
