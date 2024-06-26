const NodeCache = require("node-cache");

// Creating the cache with a standard TTL of 30 minutes and a check period of 10 minutes
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });

module.exports = function memoryCache(req, res, next) {
  if (req.method !== "GET") {
    console.log("Cannot cache non-GET methods!");
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
