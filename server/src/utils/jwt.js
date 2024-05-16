const jwt = require("jsonwebtoken");
const { secret } = process.env;

function tokenCreator(data) {
  const payload = {
    userId: data._id.toString(),
    phoneNumber: data.phoneNumber,
  };

  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

function tokenVerification(token) {
  return jwt.verify(token, secret);
}

module.exports = { tokenCreator, tokenVerification };
