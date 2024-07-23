const jwt = require('../utils/jwt');
const CustomError = require('../utils/customError');
const secret = process.env.SECRET;

module.exports = async function authentication(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = jwt.tokenVerification(token, secret);
      if (decodedToken) {
        req.user = decodedToken;
        return next();
      } else {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (err) {
      return next(err);
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
