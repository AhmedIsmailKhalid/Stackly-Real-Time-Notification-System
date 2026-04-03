import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ServerToClientEvents, ClientToServerEvents, JwtAccessPayload } from '../types';
import { initSocketService } from '../services/socketService';
import { registerNotificationHandlers } from '../socket/handlers/notificationHandlers';

type AuthenticatedSocket = {
  user: JwtAccessPayload;
};

export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Reconnection handled client-side via Socket.io client defaults
    pingTimeout: 120000,
    pingInterval: 30000,
  });

  // ── JWT Auth Middleware for all socket connections ──
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error('UNAUTHORIZED: No token provided'));
      }

      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
      (socket as unknown as AuthenticatedSocket & typeof socket).user = payload;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new Error('UNAUTHORIZED: Token expired'));
      }
      return next(new Error('UNAUTHORIZED: Invalid token'));
    }
  });

  // ── Connection Handler ──
  io.on('connection', (socket) => {
    const authenticatedSocket = socket as unknown as typeof socket & AuthenticatedSocket;
    const userId = authenticatedSocket.user.sub;

    // Join private user room
    socket.join(`user:${userId}`);

    console.log(`[socket] connected — userId: ${userId}, socketId: ${socket.id}`);

    // Register event handlers
    registerNotificationHandlers(authenticatedSocket as any);

    // ── Disconnect ──
    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected — userId: ${userId}, reason: ${reason}`);
    });

    // ── Error ──
    socket.on('error', (err) => {
      console.error(`[socket] error — userId: ${userId}, message: ${err.message}`);
    });
  });

  // Wire up socketService so other parts of the app can emit
  initSocketService(io);

  return io;
};