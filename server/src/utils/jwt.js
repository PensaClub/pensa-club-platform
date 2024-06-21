const jwt = require("jsonwebtoken");
const { secret } = process.env;

function tokenCreator(data) {
  const payload = {
    userId: data.id.toString(),
    email: data.email,
    role: data.role,
    enabled: data.finished
  };

  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

function tokenVerification(token) {
  return jwt.verify(token, secret, (err) => {
    throw new Error('Invalid JWT token.');
  });
}

module.exports = { tokenCreator, tokenVerification };
