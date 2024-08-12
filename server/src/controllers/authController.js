const authController = require('express').Router();
const { refreshToken } = require('../sequelize/models/index');
const { tokenVerification, tokenGenerator } = require('../utils/jwt');

authController.post('/refresh', async (req, res, next) => {
  const refreshJwtToken = req.cookies.refreshJwtToken;

  if (!refreshJwtToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let decodedToken;
  try {
    decodedToken = tokenVerification('refresh', refreshJwtToken);
  } catch (err) {
    res.clearCookie('refreshJwtToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const storedToken = await refreshToken.findOne({ where: { token: decodedToken.refreshTokenId } });

  if (!storedToken || storedToken.expiryDate < new Date()) {
    res.clearCookie('refreshJwtToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = {
    id: decodedToken.userId,
    email: decodedToken.email,
    role: decodedToken.role,
    finished: decodedToken.enabled,
  };

  const newRefreshToken = tokenGenerator('refresh', user);
  const newAccessToken = tokenGenerator('access', user);

  await refreshToken.create({ userId: user.id, token: newRefreshToken.refreshTokenId, expiryDate: newRefreshToken.expiryDate });
  await refreshToken.destroy({ where: { token: decodedToken.refreshTokenId } });

  res.cookie('refreshJwtToken', newRefreshToken.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: newRefreshToken.expiryDate - Date.now(),
  });

  return res.json({ token: newAccessToken.token });
});

module.exports = authController;
