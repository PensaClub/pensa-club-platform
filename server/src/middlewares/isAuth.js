const jwt = require('../utils/jwt');
const secret = process.env.SECRET;
const { user_account } = require('../sequelize/models/index');

module.exports = async function authentication(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = jwt.tokenVerification(token, secret);
      if (decodedToken) {
        if (decodedToken.role === 'admin') {
          const user = await user_account.findOne({ where: { email: decodedToken.email } });
          if (user && user.role === 'admin') {
            req.user = decodedToken;
            return next();
          } else {
            return res.status(401).json({ message: 'Unauthorized' });
          }
        } else {
          req.user = decodedToken;
          return next();
        }
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
