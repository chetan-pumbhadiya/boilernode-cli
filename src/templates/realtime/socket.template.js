/** @format */

"use strict";

function socketTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from './logger.config';
import { env } from './env.config';

let io: Server;

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(\`🔌 Client connected: \${socket.id}\`);

    socket.on('join-room', (room: string) => {
      socket.join(room);
      logger.info(\`Socket \${socket.id} joined room: \${room}\`);
    });

    socket.on('leave-room', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      logger.info(\`🔌 Client disconnected: \${socket.id}\`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket() first.');
  return io;
}
`;
  }

  return `import { Server } from 'socket.io';
import { logger } from './logger.config.js';
import { env } from './env.config.js';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(\`🔌 Client connected: \${socket.id}\`);

    socket.on('join-room', (room) => {
      socket.join(room);
      logger.info(\`Socket \${socket.id} joined room: \${room}\`);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      logger.info(\`🔌 Client disconnected: \${socket.id}\`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket() first.');
  return io;
}
`;
}

module.exports = { socketTemplate };
