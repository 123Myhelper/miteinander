const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const { getModelByRole } = require('../utils/helpers');
const config = require('../config/config');
const models = require('../models');

let io;

/**
 * Track online users: Map<string, Set<socketId>>
 * Key format: "role:userId" e.g. "care_giver:4"
 */
const onlineUsers = new Map();

const getUserKey = (role, userId) => `${role}:${userId}`;

const getProductionOrigins = () => {
  const url = process.env.FRONTEND_URL;
  if (!url) return [];
  const origins = new Set();
  origins.add(url);
  // Add www variant if not already www, or non-www if it is
  if (url.includes('://www.')) {
    origins.add(url.replace('://www.', '://'));
  } else {
    origins.add(url.replace('://', '://www.'));
  }
  return [...origins].filter(Boolean);
};

const setupSocket = (httpServer) => {
  const allowedOrigins = config.server.env === 'production'
    ? getProductionOrigins()
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:1003', 'http://127.0.0.1:1003'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      const Model = getModelByRole(decoded.role, models);
      if (!Model) {
        return next(new Error('Invalid role'));
      }

      const user = await Model.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      // Attach user info to socket
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userKey = getUserKey(decoded.role, decoded.id);

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userKey} (${socket.id})`);

    // Track online user
    if (!onlineUsers.has(socket.userKey)) {
      onlineUsers.set(socket.userKey, new Set());
    }
    onlineUsers.get(socket.userKey).add(socket.id);

    // Join user's personal room for targeted notifications
    socket.join(socket.userKey);

    // Support/Admin agents join their respective rooms
    if (socket.userRole === 'support') {
      socket.join('support_agents');
      console.log(`  🎧 ${socket.userKey} joined support_agents room`);
    }
    if (socket.userRole === 'admin') {
      socket.join('admin_agents');
      console.log(`  👑 ${socket.userKey} joined admin_agents room`);
    }

    const ctx = { io, socket, onlineUsers, getUserKey, models };
    require('./socketConversation')(ctx);
    require('./socketSettlement')(ctx);
    require('./socketSupport')(ctx);
    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userKey} (${socket.id})`);

      const sockets = onlineUsers.get(socket.userKey);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(socket.userKey);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

const isUserOnline = (role, userId) => {
  const key = getUserKey(role, userId);
  return onlineUsers.has(key) && onlineUsers.get(key).size > 0;
};

module.exports = {
  setupSocket,
  getIO,
  isUserOnline,
};
