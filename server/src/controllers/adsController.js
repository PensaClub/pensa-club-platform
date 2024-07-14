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
    await user_ads.create({ user_id: req.user.userId, ...data });

    res.status(200).json({ message: 'Ad successfully created.' });
  } catch (err) {
    next(err);
  }
});

adsController.get('/approved-ads', memoryCache, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({ where: { status: 'approved' } });
    const mappedAds = ads.map(ad => fieldSwap(ad.dataValues, 'mapFromDb'));
    res.status(200).json(mappedAds);
  } catch (err) {
    next(err);
  }
});

adsController.get('/unapproved-ads', isAuth, rbac.checkPermission('approve_record'), memoryCache, async (req, res, next) => {
  try {
    const ads = await user_ads.findAll({
      where: {
        status: { [Op.ne]: 'approved' }
      }
    });
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
          status: { [Sequelize.Op.ne]: newStatus } // Only update if current status is different
        }
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(400).json({ message: `Ad status is already ${newStatus}.` });
    }
    if (updatedAd && updatedAd.status === newStatus) {
      return res.status(400).json({ message: `Ad status is already ${newStatus}.` });
    }


    res.status(200).json({ message: "Ad status updated successfully." });

    eventEmitter.emit('adsApproved', ad);

    res.status(200).json({ message: "Ad has been approved successfully." });
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
    adsValidator(req.body, req.path);
    const data = fieldSwap(req.body, 'mapToDb');
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

    const updatedDetails = fieldSwap(details.dataValues, 'mapFromDb');

    res.status(200).json({ message: 'Ad details edited successfully!', details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

module.exports = adsController;