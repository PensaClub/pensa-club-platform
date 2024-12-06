const userDetailsController = require('express').Router();

const { user_details, user_account, user_ads, refreshToken } = require('../sequelize/models/index');
const geoCoder = require('../utils/geoCoder');
const ageCalculate = require('../utils/ageCalculate');
const userDetailsValidator = require('../utils/userDetailsValidator');
const isAuth = require('../middlewares/isAuth.js');
const { where } = require('sequelize');
const { tokenGenerator } = require('../utils/jwt.js');
const fieldSwap = require('../utils/fieldSwap.js');
const memoryCache = require('../middlewares/caching.js');
const eventEmitter = require('../utils/eventEmitter.js');
const rbac = require('../middlewares/rbac');

userDetailsController.post('/details', isAuth, async (req, res, next) => {
  if (req.user.enabled) {
    return res.status(403).send({ message: 'User details have already been submitted once.' });
  }

  try {
    userDetailsValidator(req.body, req.path);
    const {
      region,
      phoneNumber,
      username,
      workOptions,
      skills,
      interestOptions,
      firstName,
      lastName,
      gender,
      birthDate,
      imageURL,
      firebaseImagePath,
    } = req.body;

    const location = await geoCoder({ streetNumber, street, district, settlement, municipality, region });

    const data = {
      phone_number: phoneNumber,
      username,
      region,
      work_options: workOptions,
      skills,
      interest_options: interestOptions,
      first_name: firstName,
      last_name: lastName,
      gender,
      birth_date: birthDate,
      user_accounts_id: req.user.userId,
      imageURL: imageURL,
      firebase_image_path: firebaseImagePath,
    };

    const details = await user_details.create(data);

    const { id, user_accounts_id, ...restOfDetails } = details.dataValues;

    const user = await user_account.update({ finished: true }, { where: { id: req.user.userId }, returning: true, plain: true });

    const { token } = tokenGenerator('access', user[1].dataValues);
    const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user[1].dataValues);

    await refreshToken.destroy({ where: { userId: req.user.userId } });
    await refreshToken.create({ userId: user[1].dataValues.id, token: refreshTokenId, expiryDate });

    res.cookie('refreshJwtToken', refreshJwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expiryDate - Date.now(),
    });

    const updatedDetails = { ...fieldSwap(restOfDetails, 'mapFromDb'), age: ageCalculate(restOfDetails.birth_date) };

    eventEmitter.emit('userCacheUpdate', { type: 'users', data: { ...updatedDetails }, adId: null, userId: req.user.userId, action: 'details' });
    eventEmitter.emit('userCacheUpdate', { type: 'users', data: null, adId: null, userId: req.user.userId, action: 'enabled' });

    res.status(200).send({ message: 'Details successfully updated!', user: { email: req.user.email, enabled: true, details: updatedDetails }, token });
  } catch (err) {
    next(err);
  }
});

userDetailsController.get('/all-users', memoryCache('users'), async (req, res, next) => {
  try {
    const accounts = await user_account.findAll({
      attributes: ['id', 'email', ['finished', 'enabled'], 'createdAt', 'role', 'updatedAt', ['role_change_comment', 'roleChangeComment']],
      include: [
        {
          model: user_details,
          as: 'details',
          attributes: [
            ['phone_number', 'phoneNumber'],
            'username',
            ['first_name', 'firstName'],
            ['last_name', 'lastName'],
            'region',
            ['work_options', 'workOptions'],
            'skills',
            ['interest_options', 'interestOptions'],
            'gender',
            'imageURL',
            ['firebase_image_path', 'firebaseImagePath'],
          ],
        },
        {
          model: user_ads,
          required: false,
          as: 'ads',
          attributes: [
            ['ad_id', 'adId'],
            'summary',
            'category',
            'description',
            ['ad_region', 'adRegion'],
            ['ad_subregion', 'adSubregion'],
            ['ad_town', 'adTown'],
            'street',
            'tags',
            'images',
            'status',
            ['admin_comment', 'adminComment'],
            ['extra_fields', 'extraFields'],
            ['creation_date', 'creationDate'],
            ['expiration_date', 'expirationDate'],
            ['user_id', 'userId'],
          ],
        },
      ],
    });

    if (accounts.length === 0) return res.status(404).json({ message: 'No user accounts found.' });

    res.status(200).json({ message: 'Users data retrieved successfully.', accounts });
  } catch (err) {
    next(err);
  }
});

userDetailsController.patch('/update-details', isAuth, async (req, res, next) => {
  try {
    userDetailsValidator(req.body, req.path);

    const addressUpdate = ['region' ];

    const addressData = {};

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (addressUpdate.includes(fieldName) && value !== undefined) {
        addressData[fieldName] = value;
      }
    });

    const data = fieldSwap(req.body, 'mapToDb');

    let location;
    if (Object.keys(addressData).length > 0) {
      location = await geoCoder(addressData);
      data.location = location;
    }

    const [_, details] = await user_details.update(data, { where: { user_accounts_id: req.user.userId }, returning: true, plain: true });

    const updatedDetails = fieldSwap(details.dataValues, 'mapFromDb');

    updatedDetails.age = ageCalculate(updatedDetails.birthDate);

    eventEmitter.emit('userCacheUpdate', { type: 'users', data: { ...updatedDetails }, adId: null, userId: req.user.userId, action: 'details' });
    eventEmitter.emit('userCacheUpdate', { type: 'users', data: null, adId: null, userId: req.user.userId, action: 'enabled' });

    res.status(200).json({ message: 'Details edited successfully!', details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

userDetailsController.get('/single-user', isAuth, rbac.checkPermission('read_record'), memoryCache('users'), async (req, res, next) => {
  try {
    const user = await user_account.findOne({
      where: { id: req.user.userId },
      attributes: ['id', 'email', ['finished', 'enabled'], 'createdAt', 'role', 'updatedAt', ['role_change_comment', 'roleChangeComment']],
      include: [
        {
          model: user_details,
          as: 'details',
          attributes: [
            ['phone_number', 'phoneNumber'],
            'username',
            ['first_name', 'firstName'],
            ['last_name', 'lastName'],
            'region',
            ['work_options', 'workOptions'],
            'skills',
            ['interest_options', 'interestOptions'],
            'gender',
            'imageURL',
            ['firebase_image_path', 'firebaseImagePath'],
          ],
        },
        {
          model: user_ads,
          required: false,
          as: 'ads',
          attributes: [
            ['ad_id', 'adId'],
            'summary',
            'category',
            'description',
            ['ad_region', 'adRegion'],
            ['ad_subregion', 'adSubregion'],
            ['ad_town', 'adTown'],
            'street',
            'tags',
            'images',
            'status',
            ['admin_comment', 'adminComment'],
            ['extra_fields', 'extraFields'],
            ['creation_date', 'creationDate'],
            ['expiration_date', 'expirationDate'],
            ['user_id', 'userId'],
          ],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const details = fieldSwap(user.dataValues.details.dataValues, 'mapFromDb');

    details.age = ageCalculate(details.birthDate);

    res.status(200).json({
      message: 'User data retrieved successfully.',
      user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
