import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  avatar: z.string().optional(),
  region: z.string().optional(),
});

// Get all users
router.get(
  '/',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { role, search } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        region: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            maintenanceRequests: true,
            projectTasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  })
);

// Get current user profile
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        region: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            maintenanceRequests: true,
            notifications: {
              where: { read: false },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  })
);

// Update user profile
router.patch(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.region && { region: data.region }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        region: true,
        avatar: true,
      },
    });

    logger.info(`User profile updated: ${user.id}`);

    res.json({ user });
  })
);

// Get single user
router.get(
  '/:id',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        region: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            maintenanceRequests: true,
            projectTasks: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  })
);

// Update user (admin only)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.region && { region: data.region }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        region: true,
        avatar: true,
      },
    });

    logger.info(`User updated by admin: ${user.id}`);

    res.json({ user });
  })
);

// Delete user (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id },
    });

    logger.info(`User deleted: ${id}`);

    res.json({ message: 'User deleted successfully' });
  })
);

export default router;
