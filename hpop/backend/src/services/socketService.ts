import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

const userSockets = new Map<string, string>(); // userId -> socketId

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.data.userId = decoded.userId;
      socket.data.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    userSockets.set(userId, socket.id);
    
    logger.info(`🔌 User connected: ${userId}, Socket: ${socket.id}`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join role-based rooms
    if (socket.data.userRole === 'MANAGER' || socket.data.userRole === 'ADMIN') {
      socket.join('managers');
    }
    if (socket.data.userRole === 'ADMIN') {
      socket.join('admins');
    }

    // Handle chat messages
    socket.on('chat:message', async (data: { requestId: string; message: string }) => {
      try {
        const { requestId, message } = data;
        
        // Save message to database
        const chatMessage = await prisma.chatMessage.create({
          data: {
            requestId,
            userId,
            message,
          },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        // Get the request to find all participants
        const request = await prisma.maintenanceRequest.findUnique({
          where: { id: requestId },
          select: { userId: true, assignedTeam: true },
        });

        if (request) {
          // Broadcast to request room
          io.to(`request:${requestId}`).emit('chat:message', chatMessage);
          
          // Notify the other party
          const otherUserId = request.userId === userId ? null : request.userId;
          if (otherUserId) {
            io.to(`user:${otherUserId}`).emit('notification:new', {
              title: 'New Message',
              message: `New message on request #${requestId.slice(-6)}`,
              link: `/maintenance/${requestId}`,
            });
          }
        }
      } catch (error) {
        logger.error('Socket chat error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Join request room
    socket.on('request:join', (requestId: string) => {
      socket.join(`request:${requestId}`);
      logger.debug(`User ${userId} joined request room: ${requestId}`);
    });

    // Leave request room
    socket.on('request:leave', (requestId: string) => {
      socket.leave(`request:${requestId}`);
      logger.debug(`User ${userId} left request room: ${requestId}`);
    });

    // Handle typing indicator
    socket.on('chat:typing', (data: { requestId: string; isTyping: boolean }) => {
      socket.to(`request:${data.requestId}`).emit('chat:typing', {
        userId,
        isTyping: data.isTyping,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      userSockets.delete(userId);
      logger.info(`🔌 User disconnected: ${userId}`);
    });
  });
};

// Utility functions for emitting events
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToManagers = (io: Server, event: string, data: any) => {
  io.to('managers').emit(event, data);
};

export const emitToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};

export const getUserSocketId = (userId: string): string | undefined => {
  return userSockets.get(userId);
};
