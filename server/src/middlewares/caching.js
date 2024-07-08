const NodeCache = require('node-cache');
const eventEmitter = require('../utils/eventEmitter');

const stdTTL = 1800;
const checkPeriod = 600;

// Creating the cache with a standard TTL of 30 minutes and a check period of 10 minutes
const cache = new NodeCache({ stdTTL, checkPeriod });

module.exports = function memoryCache(req, res, next) {
  if (req.method !== 'GET') {
    console.log('Cannot cache non-GET methods!');
    return next();
  }

  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    res.send(cachedResponse);
  } else {
    res.originalSend = res.send;
    res.send = (body) => {
      res.originalSend(body);
      if (res.statusCode === 200) cache.set(key, body);
    };
    next();
  }
};

eventEmitter.on('accountsUpdated', (data) => {
  const oldValue = cache.get('/user/all-users');
  if (oldValue) {
    const object = JSON.parse(oldValue);
    const index = object.accounts.findIndex((obj) => obj.email === data.email);
    index !== -1 ? (object.accounts[index] = data) : object.accounts.push(data);
    cache.set('/user/all-users', JSON.stringify(object), stdTTL);
  }
});

eventEmitter.on('adsApproved', (data) => {
  const oldValueApproved = cache.get('ads/approved-ads');
  const oldValueUnapproved = cache.get('ads/unapproved-ads');
  if (oldValueUnapproved) {
    const approvedObj = JSON.parse(oldValueApproved);
    const unapprovedObj = JSON.parse(oldValueUnapproved);
    approvedAd = unapprovedObj.filter((obj) => obj.id == data.id);
    if (approvedAd) {
      approvedObj ? approvedObj.ads.push(approvedAd) : approvedObj.ads = [approvedAd];
      unapprovedObj = unapprovedObj.filter((obj) => obj.id != data.id);
      cache.set('ads/approved-ads', JSON.stringify(approvedObj), stdTTL);
      cache.set('ads/unapproved-ads', JSON.stringify(unapprovedObj), stdTTL);
    }
  }
});

eventEmitter.on('adsUpdated', (data, identifier = 'approved') => {
  const oldValue = cache.get(`ads/${identifier}-ads`);
  if (oldValue) {
    const object = JSON.parse(oldValue);
    const index = object.ads.findIndex((obj) => obj.id == data.id);
    index !== -1 ? (object.ads[index] = data) : object.ads.push(data);
    cache.set(`ads/${identifier}-ads`, JSON.stringify(object), stdTTL);
  }
});

eventEmitter.on('adsDeleted', (data, identifier = 'approved') => {
  const oldValue = cache.get(`ads/${identifier}-ads`);
  if (oldValue) {
    const object = JSON.parse(oldValue);
    object = object.filter(obj => obj.id !== data.id);
    cache.set(`ads/${identifier}-ads`, JSON.stringify(object), stdTTL);
  }
});