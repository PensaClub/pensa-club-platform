const userController = require('express').Router();

const bcrypt = require('bcrypt');
const { tokenCreator, tokenVerification, tokenGenerator } = require('../utils/jwt');
const CustomError = require('../utils/customError');

const { where } = require('sequelize');
const { user_account, user_details, user_ads, refreshToken } = require('../sequelize/models/index');
const uuid = require('uuid');

const isAuth = require('../middlewares/isAuth');
const sendResetEmail = require('../utils/sendResetEmail');
const fieldSwap = require('../utils/fieldSwap');
const ageCalculate = require('../utils/ageCalculate');

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//Example - john.doe@example.com

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d].{8,}$/;

const secret = process.env.SECRET;

userController.post('/register', async (req, res, next) => {
  let errors = {};
  try {
    const { email, password, rePassword } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === '') {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
    }

    if (!emailRegex.test(email)) {
      errors.email = 'Invalid email.';
    }

    if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 8 characters long, contain at least one letter and one number.';
    }

    if (password !== rePassword) {
      errors.rePassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
    }

    const userExist = await user_account.findOne({ where: { email } });

    if (userExist) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await user_account.create({ email, password: hashedPassword });

    const { token } = tokenGenerator('access', user);
    const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

    await refreshToken.create({ userId: user.dataValues.id, token: refreshTokenId, expiryDate });

    const data = {
      email: user.email,
      role: user.role,
      enabled: user.finished,
    };

    res.cookie('refreshJwtToken', refreshJwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expiryDate - Date.now(),
    });
    res.status(201).json({ message: 'User successfully created!', user: data, token });
  } catch (err) {
    next(err);
  }
});

userController.post('/login', async (req, res, next) => {
  let errors = {};
  try {
    const { email, password } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === '') {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: 'Validation errors', statusCode: 400, details: errors });
    }

    const user = await user_account.findOne({
      where: { email },
      include: [
        {
          model: user_details,
          as: 'details',
          attributes: { exclude: ['user_accounts_id'] },
        },
        {
          model: user_ads,
          as: 'ads',
          required: false,
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

    if (!user) {
      return res.status(409).json({ message: 'Email or password are invalid.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(409).json({ message: 'Email or password are invalid.' });
    }

    const data = {
      email: user.email,
      role: user.role,
      enabled: user.finished,
      roleChangeComment: user.role_change_comment,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ads: user.ads,
    };

    if (user.dataValues.details) {
      const details = fieldSwap(user.dataValues.details.dataValues, 'mapFromDb');
      details.age = ageCalculate(details.birthDate);
      data.details = details;
    }

    const { token } = tokenGenerator('access', user);
    const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user);

    await refreshToken.create({ userId: user.dataValues.id, token: refreshTokenId, expiryDate });

    res.cookie('refreshJwtToken', refreshJwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expiryDate - Date.now(),
    });

    res.status(200).json({ message: 'User successfully logged in!', user: data, token });
  } catch (err) {
    next(err);
  }
});

userController.post('/logout', isAuth, async (req, res, next) => {
  try {
    if (req.user) {
      const refreshJwtToken = req.cookies.refreshJwtToken;
      if (refreshJwtToken) {
        try {
          const decodedToken = tokenVerification('refresh', refreshJwtToken);
          await refreshToken.destroy({ where: { token: decodedToken.refreshTokenId } });
          res.clearCookie('refreshJwtToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
          res.status(200).json({ message: 'Logout successful.' });
        } catch (err) {
          next(err);
        }
      }
    }
  } catch (err) {
    next(err);
  }
});

userController.post('/request-reset-password', async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await user_account.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'There is no user registered with that email address' });
    }

    const resetToken = uuid.v4();
    const expiryTime = Date.now() + 900000; // 15 min

    user.reset_token = resetToken;
    user.token_expiration = expiryTime;
    await user.save();

    try {
      await sendResetEmail(email, resetToken);
      res.status(200).json({ message: `A reset password link has been sent to ${email}.` });
    } catch (emailError) {
      next(new Error(`Error sending email: ${emailError}`));
    }
  } catch (err) {
    next(err);
  }
});

userController.post('/reset-password', async (req, res, next) => {
  const { oldPassword, newPassword, reNewPassword, tokenType, token } = req.body;
  let user;
  try {
    if (tokenType !== 'jwt' && tokenType !== 'reset') {
      return res.status(400).json({ message: 'Invalid token type.' });
    }
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }
    if (!reNewPassword) {
      return res.status(400).json({ message: 'Repeat password is required.' });
    }
    if (newPassword !== reNewPassword) {
      return res.status(400).json({ message: 'Repeat password does not match.' });
    }
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long, contain at least one letter and one number.' });
    }

    if (tokenType === 'reset') {
      user = await user_account.findOne({ where: { reset_token: token } });
      if (!user || !user.token_expiration) {
        return res.status(404).json({ message: "User with that token wasn't found." });
      }
      if (user.token_expiration.getTime() < Date.now()) {
        return res.status(400).json({ message: 'Reset token has expired.' });
      }
      user.reset_token = null;
      user.token_expiration = null;
    }

    if (tokenType === 'jwt') {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Old password is required.' });
      }
      const decodedToken = tokenVerification(token, secret);
      user = await user_account.findOne({ where: { email: decodedToken.email } });

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Old password is not valid.' });
      }
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password reset was successful.' });
  } catch (err) {
    next(err);
  }
});

module.exports = userController;
