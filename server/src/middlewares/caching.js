const NodeCache = require('node-cache');
const eventEmitter = require('../utils/eventEmitter');

const stdTTL = 1800;
const checkperiod = 600;

// Creating the cache with a standard TTL of 30 minutes and a check period of 10 minutes
const cache = new NodeCache({ stdTTL, checkperiod });

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

eventEmitter.on('dbUpdated', (data) => {
  const oldValue = cache.get('/user/all-users');
  if (oldValue) {
    const object = JSON.parse(oldValue);
    const index = object.accounts.findIndex((obj) => obj.email === data.email);
    index !== -1 ? (object.accounts[index] = data) : object.accounts.push(data);
    cache.set('/user/all-users', JSON.stringify(object), stdTTL);
  }
});
