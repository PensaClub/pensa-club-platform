const adsController = require('express').Router();
const { user_account, user_details, user_ads } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const fieldSwap = require('../utils/fieldSwap.js');
const adsValidator = require('../utils/adsValidator.js');

adsController.post('/ad-create', isAuth, async (req, res, next) => {
  try {
    adsValidator(req.body);

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

    const ad = await user_ads.create({ user_id: req.user.userId, ...data });

    // if we switch from pure adId to details use the line below (doesn`t include id!)
    // const newAd = fieldSwap(ad.dataValues, 'mapFromDb');

    res.status(200).json({ message: 'Ad successfully created.', adId: ad.dataValues.id });
  } catch (err) {
    next(err);
  }
});

module.exports = adsController;
