const NodeCache = require('node-cache');
const eventEmitter = require('../utils/eventEmitter');

const stdTTL = 1800;
const checkperiod = 600;

const { user_ads, user_account, user_details } = require('../sequelize/models/index');

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
    const email = req?.user?.email;

    let cachedResponse = cache.get(key);

    if (cachedResponse) {
      if (key === 'ads') await handleAdRequest(cachedResponse, res, adId, adStatus, email);
      if (key === 'users') await handleUserRequest(cachedResponse, res, userId);
    } else {
      res.originalSend = res.send;
      res.send = (body) => {
        res.originalSend(sanitizeData(body));
        if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 400) cache.set(key, body);
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

const handleAdRequest = async (cachedResponse, res, adId, adStatus, email) => {
  if (adId && !cache.get('users')) {
    const accounts = await fetchAllAccounts();
    cache.set('users', JSON.stringify({ message: 'Users data retrieved successfully.', accounts }), stdTTL);
  }

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
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `There are no ads with status ${adStatus} at the moment.`, ads: [] });
  } else {
    const filter = filterCachedAdsByEmail(cachedResponse, email);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: 'No ads found for the specified user.', ads: [] });
  }
};

const handleUserRequest = async (cachedResponse, res, userId) => {
  if (!Array.isArray(cachedResponse.accounts)) {
    const accounts = await fetchAllAccounts();
    cache.set('users', JSON.stringify({ message: 'Users data retrieved successfully.', accounts }), stdTTL);
    cachedResponse = cache.get('users');
  }

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
  let filteredAd = cachedAds.ads.find((ad) => ad.adId === adId) || null;
  let userDetails = null;

  if (filteredAd !== null) {
    const { username, imageURL, workOptions, interestOptions, skills, phoneNumber } = JSON.parse(cache.get('users')).accounts.find((user) =>
      user.ads.find((ad) => ad.adId === adId)
    ).details;
    userDetails = { username, imageURL, workOptions, interestOptions, skills, phoneNumber };
  }

  return filteredAd ? { message: 'Ad successfully retrieved.', ads: filteredAd, details: userDetails } : null;
};

const filterCachedAdsByStatus = (ads, status) => {
  const cachedAds = JSON.parse(ads);
  let filteredAds = cachedAds.ads.filter((ad) => ad.status === status);

  if (filteredAds.length === 0) {
    return null;
  }

  return filteredAds ? JSON.stringify({ message: `${status.charAt(0).toUpperCase() + status.slice(1)} ads successfully retrieved.`, ads: filteredAds }) : null;
};

const filterCachedAdsByEmail = (ads, email) => {
  const cachedAds = JSON.parse(ads);
  let filteredAds = cachedAds.ads.filter((ad) => ad.account.email === email);

  if (filteredAds.length === 0) {
    return null;
  }

  return filteredAds ? JSON.stringify({ message: 'User ads successfully retrieved.', ads: filteredAds }) : null;
};

const filterCachedUserById = (users, userId) => {
  const cachedUsers = JSON.parse(users);
  let filteredUser = cachedUsers.accounts.find((user) => user.id === Number(userId)) || null;

  return filteredUser ? { message: 'User data retrieved successfully.', user: filteredUser } : null;
};

// ACCOUNTS -------------------------------------------------------------------------------------------

eventEmitter.on('accountUpdated', async (data) => {
  let usersValue = cache.get('users');

  if (!usersValue || !Array.isArray(JSON.parse(usersValue).accounts)) {
    const accounts = await fetchAllAccounts();
    cache.set('users', JSON.stringify({ message: 'Users data retrieved successfully.', accounts }), stdTTL);
    usersValue = cache.get('users');
  }

  const objectUsers = JSON.parse(usersValue);

  const index = objectUsers.accounts.findIndex((obj) => obj.id === Number(data.userId));
  if (index !== -1) {
    Object.keys(data.updates).forEach((key) => {
      if (key === 'ads') {
        const adIndex = objectUsers.accounts[index].ads.findIndex((ad) => ad.adId === data.updates.ads.adId);
        Object.keys(data.updates.ads).forEach((adKey) => {
          if (adIndex !== -1) {
            objectUsers.accounts[index].ads[adIndex][adKey] = data.updates.ads[adKey];
          }
        });
      }
      if (key === 'details') {
        Object.keys(data.updates.details).forEach((detailKey) => {
          objectUsers.accounts[index].details[detailKey] = data.updates.details[detailKey];
        });
      }
      if (key === 'enabled') {
        objectUsers.accounts[index].enabled = data.updates.enabled;
      }
    });
  }
  cache.set('users', JSON.stringify({ message: 'Users data retrieved successfully.', accounts: objectUsers.accounts }), stdTTL);
});

// ADS --------------------------------------------------------------------------------------------------------

eventEmitter.on('ads', async (data, action) => {
  let adsValue = cache.get('ads');

  if (!adsValue || !Array.isArray(JSON.parse(adsValue).ads)) {
    const ads = await fetchAllAds();
    cache.set('ads', JSON.stringify({ message: 'Ads successfully retrieved', ads }), stdTTL);
    adsValue = cache.get('ads');
  }

  const objectAds = JSON.parse(adsValue);

  if (action === 'delete') {
    objectAds.ads = objectAds.ads.filter((ad) => ad.adId !== data.adId);
  } else {
    const index = objectAds.ads.findIndex((obj) => obj.adId === data.adId);
    index !== -1 ? (objectAds.ads[index] = data) : objectAds.ads.push(data);
  }
  cache.set('ads', JSON.stringify(objectAds), stdTTL);

  let usersValue = cache.get('users');

  if (!usersValue || !Array.isArray(JSON.parse(usersValue).accounts)) {
    const accounts = await fetchAllAccounts();
    cache.set('users', JSON.stringify({ message: 'Users successfully retrieved.', accounts }), stdTTL);
    usersValue = cache.get('users');
  }

  const objectUsers = JSON.parse(usersValue);
  objectUsers.accounts.forEach((account) => {
    if (account.id === Number(data.userId)) {
      if (action === 'delete') {
        account.ads = account.ads.filter((ad) => ad.adId !== data.adId);
      } else {
        const index = account.ads.findIndex((ad) => ad.adId === data.adId);
        index !== -1 ? (account.ads[index] = data) : account.ads.push(data);
      }
    }
  });
  cache.set('users', JSON.stringify({ message: 'Users successfully retrieved.', accounts: objectUsers.accounts }), stdTTL);
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
    include: [
      {
        model: user_account,
        as: 'account',
        attributes: ['email'],
      },
    ],
  });

// FETCH ALL USERS ----------------------------------------------------------------------------------------------

const fetchAllAccounts = async () =>
  await user_account.findAll({
    attributes: ['id', 'email', ['finished', 'enabled'], 'createdAt', 'role'],
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
          'municipality',
          'settlement',
          ['work_options', 'workOptions'],
          'skills',
          ['interest_options', 'interestOptions'],
          'district',
          'block',
          'street',
          ['street_number', 'streetNumber'],
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
          ['user_id', 'userId'],
        ],
      },
    ],
  });
