const NodeCache = require('node-cache');
const eventEmitter = require('../utils/eventEmitter');

const stdTTL = 1800;
const checkperiod = 600;

const { user_ads, user_account } = require('../sequelize/models/index');

// Creating the cache with a standard TTL of 30 minutes and a check period of 10 minutes
const cache = new NodeCache({ stdTTL, checkperiod });

module.exports = function memoryCache(key) {
  return async function (req, res, next) {
    if (req.method !== 'GET') {
      console.log('Cannot cache non-GET methods!');
      return next();
    }

    const adId = req.params.adId;
    const adStatus = req.params.adStatus;
    const userId = req?.user?.userId;

    let cachedResponse = cache.get(key);

    if (cachedResponse) {
      if (key === 'ads') handleAdRequest(cachedResponse, res, adId, adStatus);
      if (key === 'users') handleUserRequest(cachedResponse, res, userId);
    } else {
      res.originalSend = res.send;
      res.send = (body) => {
        res.originalSend(sanitizeData(body));
        if (res.statusCode === 200) cache.set(key, body);
      };
      next();
    }
  };
};

// Sanitization --------------------------------------------------------------------------------------

function sanitizeData(newData) {
  let data;

  try {
    data = JSON.parse(newData);
  } catch (error) {
    data = newData;
  }

  if (typeof data !== 'object' || data === null) {
    return JSON.stringify({ message: 'Invalid data format' });
  }

  const { message, ...rest } = data;

  function deepSanitize(obj) {
    if (Array.isArray(obj)) {
      return obj.map(deepSanitize);
    } else if (obj && typeof obj === 'object') {
      const sanitizedObject = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key !== 'id' && key !== 'userId') {
          sanitizedObject[key] = deepSanitize(value);
        }
      }
      return sanitizedObject;
    }
    return obj;
  }

  const sanitizedData = deepSanitize(rest);
  const result = { message, ...sanitizedData };
  return JSON.stringify(result);
}

// REQUEST HANDLERS ----------------------------------------------------------------------------------

const handleAdRequest = async (cachedResponse, res, adId, adStatus) => {
  if (!Array.isArray(cachedResponse.ads)) {
    const ads = await fetchAllAds();
    cache.set('ads', JSON.stringify({ message: 'Ads successfully retrieved', ads }), stdTTL);
    cachedResponse = cache.get('ads');
  }

  if (adId) {
    const filter = filterCachedAdsById(cachedResponse, adId);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `Ad with ID ${adId} does not exist.` });
  } else if (adStatus) {
    const filter = filterCachedAdsByStatus(cachedResponse, adStatus);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `There are no ads with status ${adStatus} at the moment.` });
  } else {
    return res.send(sanitizeData(cachedResponse));
  }
};

const handleUserRequest = (cachedResponse, res, userId) => {
  if (userId) {
    const filter = filterCachedUserById(cachedResponse, userId);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `User with ID ${userId} does not exist.` });
  } else {
    return res.send(sanitizeData(cachedResponse));
  }
};

// FILTERS -------------------------------------------------------------------------------------------

const filterCachedAdsById = (ads, adId) => {
  const cachedAds = JSON.parse(ads);
  let filteredAd = null;

  if (!Array.isArray(cachedAds.ads)) {
    if (cachedAds.ads.adId === adId) {
      filteredAd = cachedAds.ads;
    }
  } else {
    filteredAd = cachedAds.ads.find((ad) => ad.adId === adId) || null;
  }
  return filteredAd ? { message: 'Ad successfully retrieved.', ad: filteredAd } : null;
};

const filterCachedAdsByStatus = (ads, status) => {
  const cachedAds = JSON.parse(ads);
  let filteredAds = [];

  if (Array.isArray(cachedAds.ads)) {
    filteredAds = cachedAds.ads.filter((ad) => ad.status === status);
  }

  if (filteredAds.length === 0) {
    return null;
  }

  return filteredAds ? JSON.stringify({ message: `Ads with ${status} status successfully retrieved.`, ad: filteredAds }) : null;
};

const filterCachedUserById = (users, userId) => {
  const cachedUsers = JSON.parse(users);
  let filteredUser = null;

  if (!Array.isArray(cachedUsers.accounts)) {
    if (cachedUsers.user.id === Number(userId)) {
      filteredUser = cachedUsers.user;
    }
  } else {
    filteredUser = cachedUsers.accounts.find((user) => user.id === Number(userId)) || null;
  }
  return filteredUser;
};

// ACCOUNTS -------------------------------------------------------------------------------------------

eventEmitter.on('accountUpdated', async (data) => {
  const oldValue = cache.get('users');

  if (!oldValue) {
    const accounts = await fetchAllAccounts();
    cache.set('users', JSON.stringify({ message: 'Users data retrieved successfully.', accounts }), stdTTL);
  } else {
    const object = JSON.parse(oldValue);
    const index = object.accounts.findIndex((obj) => obj.email === data.email);
    index !== -1 ? (object.accounts[index] = data) : object.accounts.push(data);
    cache.set('users', JSON.stringify({ message: 'Users data retrieved successfully.', object }), stdTTL);
  }
});

// ADS --------------------------------------------------------------------------------------------------------

eventEmitter.on('ads', async (data, action) => {
  const oldValue = cache.get('ads');
  if (!oldValue) {
    const ads = await fetchAllAds();
    cache.set('ads', JSON.stringify({ message: 'Ads successfully retrieved', ads }), stdTTL);
  } else {
    const object = JSON.parse(oldValue);
    if (action === 'delete') {
      object.ads = object.ads.filter((ad) => ad.adId !== data.adId);
    } else {
      const index = object.ads.findIndex((obj) => obj.adId === data.adId);
      index !== -1 ? (object.ads[index] = data) : object.ads.push(data);
    }
    cache.set('ads', JSON.stringify(object), stdTTL);
  }

  const oldValueUsers = cache.get('users');

  if (oldValueUsers) {
    const object = JSON.parse(oldValueUsers);
    object.accounts.forEach((account) => {
      if (account.id === Number(data.userId)) {
        if (action === 'delete') {
          account.ads = account.ads.filter((ad) => ad.adId !== data.adId);
        } else {
          const index = account.ads.findIndex((ad) => ad.adId === data.adId);
          index !== -1 ? (account.ads[index] = data) : account.ads.push(data);
        }
      }
    });
    cache.set('users', JSON.stringify({ message: 'Users successfully retrieved.', accounts: object.accounts }), stdTTL);
  }
});

// FETCH ALL ADS ----------------------------------------------------------------------------------------------

const fetchAllAds = async () =>
  await user_ads.findAll({
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
    ],
  });

// FETCH ALL USERS ----------------------------------------------------------------------------------------------

const fetchAllAccounts = async () =>
  await user_account.findAll({
    attributes: ['id', 'email', ['finished', 'enabled']],
    include: [
      {
        model: user_details,
        as: 'details',
        attributes: [
          ['phone_number', 'phoneNumber'],
          'username',
          ['first_name', 'firstName'],
          ['last_name', 'lastName'],
          ['work_options', 'workOptions'],
          'skills',
          ['interest_options', 'interestOptions'],
          'location',
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
        ],
      },
    ],
  });
