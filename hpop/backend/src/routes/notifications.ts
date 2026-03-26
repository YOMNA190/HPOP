import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Get user notifications
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { unreadOnly, page = '1', limit = '20' } = req.query;

    const where: any = { userId: req.user!.id };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where: { userId: req.user!.id } }),
      prisma.notification.count({
        where: { userId: req.user!.id, read: false },
      }),
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  })
);

// Mark notification as read
router.patch(
  '/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: { read: true },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  })
);

// Mark all notifications as read
router.post(
  '/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        read: false,
      },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  })
);

// Delete notification
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await prisma.notification.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  })
);

// Create notification (internal use)
export const createNotification = async (data: {
  userId: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        titleAr: data.titleAr,
        message: data.message,
        messageAr: data.messageAr,
        type: data.type || 'INFO',
        link: data.link,
      },
    });

    logger.info(`Notification created: ${notification.id}`);
    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    return null;
  }
};

export default router;
