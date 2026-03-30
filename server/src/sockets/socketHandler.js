/**
 * Socket.IO event handlers
 * Manages rooms, online tracking, typing indicators
 */
const socketAuth = require('./socketAuth');

const onlineUsers = new Set();
let lastOnlineEmit = 0;

module.exports = function socketHandler(io) {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const user = socket.data.user;

    // Track online users (only authenticated)
    if (user?.userId) {
      onlineUsers.add(user.userId);
      socket.join(`user:${user.userId}`);
    }
    // Always send current count + list to the connecting socket
    socket.emit('forum:onlineUsers', { count: onlineUsers.size, userIds: [...onlineUsers] });
    // Broadcast to all others
    emitOnlineCount(io);

    // ── Forum rooms ──

    socket.on('forum:joinPost', (postId) => {
      if (postId) socket.join(`forum:post:${postId}`);
    });

    socket.on('forum:leavePost', (postId) => {
      if (postId) socket.leave(`forum:post:${postId}`);
    });

    socket.on('forum:joinFeed', () => {
      socket.join('forum:feed');
    });

    socket.on('forum:leaveFeed', () => {
      socket.leave('forum:feed');
    });

    // ── Typing indicators ──

    socket.on('forum:typing', (postId) => {
      if (!user?.userId || !postId) return;
      const name = user.email?.split('@')[0] || 'Потребител';
      socket.to(`forum:post:${postId}`).emit('forum:typing', {
        userId: user.userId,
        name,
      });
    });

    socket.on('forum:stopTyping', (postId) => {
      if (!user?.userId || !postId) return;
      socket.to(`forum:post:${postId}`).emit('forum:stopTyping', {
        userId: user.userId,
      });
    });

    // ── Disconnect ──

    socket.on('disconnect', () => {
      if (user?.userId) {
        onlineUsers.delete(user.userId);
        emitOnlineCount(io);
      }
    });
  });
};

function emitOnlineCount(io) {
  const now = Date.now();
  // Throttle: max once per 5 seconds
  if (now - lastOnlineEmit < 5000) return;
  lastOnlineEmit = now;
  io.emit('forum:onlineUsers', { count: onlineUsers.size, userIds: [...onlineUsers] });
}

// Export for use in controllers
module.exports.emitToUser = (io, userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

module.exports.emitToPost = (io, postId, event, data) => {
  if (io) io.to(`forum:post:${postId}`).emit(event, data);
};

module.exports.emitToFeed = (io, event, data) => {
  if (io) io.to('forum:feed').emit(event, data);
};
