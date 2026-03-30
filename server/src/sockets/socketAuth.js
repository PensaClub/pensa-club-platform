/**
 * Socket.IO authentication middleware
 * Verifies JWT token from handshake auth
 */
const { tokenVerification } = require('../utils/jwt');

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    // Allow unauthenticated connections (guests can see online count)
    socket.data.user = null;
    return next();
  }

  try {
    const decoded = tokenVerification('access', token);
    socket.data.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    // Token invalid/expired — still allow connection but as guest
    socket.data.user = null;
    next();
  }
};

module.exports = socketAuth;
