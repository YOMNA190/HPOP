import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { emitToManagers, emitToUser } from '../services/socketService';
import { io } from '../server';
import { logger } from '../utils/logger';

const router = Router();

const createRequestSchema = z.object({
  category: z.enum(['CLEANING', 'AC', 'PLUMBING', 'ELECTRICAL', 'SECURITY', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  descriptionAr: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  unitId: z.string().optional(),
  unitX: z.number().optional(),
  unitY: z.number().optional(),
});

const updateRequestSchema = z.object({
  status: z.enum(['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTeam: z.string().optional(),
  internalNotes: z.string().optional(),
  satisfaction: z.number().min(1).max(5).optional(),
});

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

// Get all requests (with filters)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const {
      status,
      category,
      priority,
      page = '1',
      limit = '10',
      startDate,
      endDate,
    } = req.query;

    const where: any = {};

    // Tenants can only see their own requests
    if (req.user?.role === 'TENANT') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [requests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, nameAr: true, email: true, avatar: true },
          },
          _count: {
            select: { chatMessages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    res.json({
      requests,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  })
);

// Get request statistics
router.get(
  '/stats',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const [
      totalOpen,
      slaBreaches,
      avgResponseTime,
      byCategory,
      byStatus,
    ] = await Promise.all([
      prisma.maintenanceRequest.count({
        where: { status: { not: 'COMPLETED' } },
      }),
      prisma.maintenanceRequest.count({
        where: { slaBreached: true },
      }),
      prisma.maintenanceRequest.aggregate({
        where: { resolvedAt: { not: null } },
        _avg: {
          // Calculate average time between createdAt and resolvedAt
          // This is a simplified version
        },
      }),
      prisma.maintenanceRequest.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.maintenanceRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    // Calculate SLA compliance percentage
    const total = await prisma.maintenanceRequest.count();
    const slaCompliance = total > 0 ? ((total - slaBreaches) / total) * 100 : 100;

    res.json({
      totalOpen,
      slaBreaches,
      slaCompliance: Math.round(slaCompliance * 100) / 100,
      byCategory,
      byStatus,
    });
  })
);

// Get heatmap data
router.get(
  '/heatmap',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        unitX: { not: null },
        unitY: { not: null },
      },
      select: {
        unitX: true,
        unitY: true,
        category: true,
        status: true,
        priority: true,
      },
    });

    res.json({ heatmap: requests });
  })
);

// Get single request
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, nameAr: true, email: true, avatar: true },
        },
        chatMessages: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user has permission to view
    if (req.user?.role === 'TENANT' && request.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ request });
  })
);

// Create request
router.post(
  '/',
  authenticate,
  authorize('TENANT'),
  asyncHandler(async (req, res) => {
    const data = createRequestSchema.parse(req.body);

    const request = await prisma.maintenanceRequest.create({
      data: {
        category: data.category,
        description: data.description,
        descriptionAr: data.descriptionAr,
        priority: data.priority,
        unitId: data.unitId,
        unitX: data.unitX,
        unitY: data.unitY,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.info(`New maintenance request created: ${request.id}`);

    // Notify managers
    emitToManagers(io, 'request:new', request);

    res.status(201).json({ request });
  })
);

// Update request
router.patch(
  '/:id',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateRequestSchema.parse(req.body);

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.assignedTeam && { assignedTeam: data.assignedTeam }),
        ...(data.internalNotes && { internalNotes: data.internalNotes }),
        ...(data.satisfaction && { satisfaction: data.satisfaction }),
        ...(data.status === 'COMPLETED' && { resolvedAt: new Date() }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.info(`Maintenance request updated: ${id}`);

    // Notify the tenant
    emitToUser(io, request.userId, 'request:update', request);

    res.json({ request });
  })
);

// Add chat message
router.post(
  '/:id/chat',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = chatMessageSchema.parse(req.body);

    // Check if request exists and user has access
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (req.user?.role === 'TENANT' && request.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        requestId: id,
        userId: req.user!.id,
        message: data.message,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Emit to request room
    io.to(`request:${id}`).emit('chat:message', message);

    res.status(201).json({ message });
  })
);

// Get chat messages
router.get(
  '/:id/chat',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (req.user?.role === 'TENANT' && request.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { requestId: id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages });
  })
);

// Upload photos
router.post(
  '/:id/photos',
  authenticate,
  asyncHandler(async (req, res) => {
    // In a real implementation, use multer for file uploads
    // For now, assume photos are uploaded via base64 or external service
    const { id } = req.params;
    const { photos } = req.body;

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        photos: JSON.stringify(photos),
      },
    });

    res.json({ request });
  })
);

export default router;
