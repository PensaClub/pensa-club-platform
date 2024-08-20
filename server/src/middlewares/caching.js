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

    const { adId, adStatus, email: paramEmail } = req.params;
    const { userId, email: reqEmail } = req?.user || {};

    if (!cache.get('users')) {
      try {
        const data = await fetchAllAccounts();
        cache.set('users', JSON.stringify(data), stdTTL);
      } catch (err) {
        next(err);
      }
    }

    const cachedResponse = JSON.parse(cache.get('users'));

    if (key === 'ads') await handleAdRequest(cachedResponse, res, adId, adStatus, paramEmail, reqEmail);
    if (key === 'users') await handleUserRequest(cachedResponse, res, userId);
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
          if (key === 'email' && value === process.env.ADMIN_EMAIL) {
            sanitizedObject[key] = value;
            continue;
          }
          if (key === 'details' && sanitizedObject['email'] === process.env.ADMIN_EMAIL) {
            const { location, ...restDetails } = value;
            sanitizedObject[key] = deepSanitize(restDetails);
          } else {
            sanitizedObject[key] = deepSanitize(value);
          }
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

const handleAdRequest = async (cachedResponse, res, adId, adStatus, paramEmail, reqEmail) => {
  if (adId) {
    const filter = filterCachedAdsById(cachedResponse, adId);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `Ad with ID ${adId} does not exist.` });
  } else if (adStatus) {
    const filter = filterCachedAdsByStatus(cachedResponse, adStatus);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `There are no ads with status ${adStatus} at the moment.`, ads: [] });
  } else {
    const filter = filterCachedAdsByEmail(cachedResponse, paramEmail, reqEmail);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: 'No ads found for the specified user.', ads: [] });
  }
};

const handleUserRequest = async (cachedResponse, res, userId) => {
  if (userId) {
    const filter = filterCachedUserById(cachedResponse, userId);
    return filter ? res.send(sanitizeData(filter)) : res.send({ message: `User with ID ${userId} does not exist.` });
  } else {
    return res.send(sanitizeData({ message: 'Users retrieved successfully.', accounts: cachedResponse || [] }));
  }
};

// FILTERS -------------------------------------------------------------------------------------------

const filterCachedAdsById = (cachedData, adId) => {
  const userAccount = cachedData.find((user) => user.ads.find((ad) => ad.adId === adId));
  if (!userAccount) return null;

  const filteredAd = userAccount.ads.find((ad) => ad.adId === adId);
  if (!filteredAd) return null;

  const { username, imageURL, workOptions, interestOptions, skills, phoneNumber, gender } = userAccount.details;

  return {
    message: 'Ad successfully retrieved.',
    ads: { ...filteredAd, account: { email: userAccount.email } },
    details: { username, imageURL, workOptions, interestOptions, skills, phoneNumber, email: userAccount.email, gender },
  };
};

const filterCachedAdsByStatus = (cachedData, status) => {
  const adsType = ['approved', 'pending', 'denied'];
  if (!adsType.includes(status)) return res.status(404).json({ message: 'Invalid status type. Status must be approved, pending or denied.', ads: [] });

  const filteredAds = cachedData.map((user) => user.ads.filter((ad) => ad.status === status).map((ad) => ({ ...ad, account: { email: user.email } }))).flat();

  if (!filteredAds) return null;

  return { message: `${status.charAt(0).toUpperCase() + status.slice(1)} ads successfully retrieved.`, ads: filteredAds };
};

const filterCachedAdsByEmail = (cachedData, paramEmail, reqEmail) => {
  const account = cachedData.find((user) => user.email === paramEmail);
  if (!account) return null;

  const filteredAds = paramEmail === reqEmail ? account.ads : account.ads.filter((ad) => ad.status === 'approved');

  if (!filteredAds) return null;

  return { message: 'User ads successfully retrieved.', ads: filteredAds };
};

const filterCachedUserById = (cachedData, userId) => {
  let filteredUser = cachedData.find((user) => user.id === Number(userId));
  if (!filteredUser) return null;

  return { message: 'User data retrieved successfully.', user: filteredUser };
};

// ACCOUNTS -------------------------------------------------------------------------------------------

eventEmitter.on('userCacheUpdate', async ({ type, data, adId, userId, action }) => {
  if (!cache.get('users')) {
    try {
      const data = await fetchAllAccounts();
      cache.set('users', JSON.stringify(data), stdTTL);
    } catch (err) {
      next(err);
    }
  }

  let parsedCache = JSON.parse(cache.get('users'));

  const accountId = userId !== null ? userId : parsedCache.find((account) => account.ads.find((ad) => ad.adId === adId))?.id || null;
  if (!accountId) return;

  const account = parsedCache.find((account) => account.id.toString() === accountId.toString());

  if (!account) return;

  if (type === 'ads') {
    if (action === 'delete') {
      account.ads = account.ads.filter((ad) => ad.adId !== adId);
    } else {
      const index = account.ads.findIndex((ad) => ad.adId === adId);
      if (index !== -1) {
        Object.assign(account.ads[index], data);
      } else {
        account.ads.push(data);
      }
    }
  }

  if (type === 'users') {
    if (action === 'details') {
      Object.assign(account.details, data);
    }
    if (action === 'enabled') {
      account.enabled = true;
    }
    if (action === 'account-delete') {
      parsedCache = parsedCache.filter((account) => account.id !== userId);
    }
    if (action === 'account') {
      Object.assign(account, data);
    }
  }

  cache.set('users', JSON.stringify(parsedCache), stdTTL);
});

// FETCH ALL USERS ----------------------------------------------------------------------------------------------

const fetchAllAccounts = async () =>
  await user_account.findAll({
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
          'updatedAt',
        ],
      },
    ],
  });
