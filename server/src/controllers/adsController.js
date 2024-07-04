const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
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

    res.status(200).json({ message: 'Ad successfully created.', adId: ad.dataValues.id });
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
