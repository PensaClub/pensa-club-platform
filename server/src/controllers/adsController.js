const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require("../middlewares/rbac");
const fieldSwap = require('../utils/fieldSwap.js');

adsController.post('/ad-create', isAuth, async (req, res, next) => {
  try {
    // validators to be added - currently validates only on the DB

    // Example of successful ad creation via postman
    // {
    //     "summary": "Divan",
    //     "category": "Sale",
    //     "description": "very nice and comfy",
    //     "adTown": "Popovo",
    //     "adAddress" : "Madjarov 5",
    //     "images" : [{
    //         "imageURL" : "random url",
    //         "firebaseImagePath" : "random path"
    //     }]
    //  }

    const data = fieldSwap(req.body, 'mapToDb');

    const ad = await user_ads.create({ user_id: req.user?.userId || 2, ...data });

    // if we switch from pure ad to details use the line below (doesn`t include id!)
    // const newAd = fieldSwap(ad.dataValues, 'mapFromDb');

    res.status(200).json({ message: 'Ad successfully created.', adId: ad.dataValues.id });
  } catch (err) {
    next(err);
  }
});

adsController.get('/get-unapproved', rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({ where: { approved: false } });
    res.status(200).json({ ...ads });
  }
  catch (err) {
    next(err);
  }
});

adsController.post('/approve-ad', rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    const ad = await user_ads.findOne({ where: { id } });
    if (!ad) {
      res.status(400).json({ message: 'ID doesn\'t match an existing ad.' });
    }
    if (ad.approved) {
      res.status(400).json({ message: "Ad has already been approved." });
    }
    ad.approved = true;
    ad.save();
    res.status(200).json({ message: "Ad has been approved successfully.", ad });
  }
  catch (err) {
    next(err);
  }
});

adsController.post('/delete-ad', isAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    const ad = await user_ads.findOne({ where: { id } });
    if (!ad) {
      res.status(400).json({ message: 'ID doesn\'t match an existing ad.' });
    }
    if (req.user.role === 'admin' || req.user.userId == ad.user_id) {
      await user.destroy();
      res.status(200).json({ message: 'Ad successfully deleted' });
    }
    res.status(400).json({ message: 'Access denied.' });
  }
  catch (err) {
    next(err);
  }
});

module.exports = adsController;
