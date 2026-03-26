import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  titleAr: z.string().optional(),
  category: z.enum(['FINISHING', 'MEP', 'LANDSCAPING', 'INTERIOR_DESIGN', 'STRUCTURAL']),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  deadline: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  assigneeId: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  criticalPath: z.boolean().default(false),
});

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  titleAr: z.string().optional(),
  category: z.enum(['FINISHING', 'MEP', 'LANDSCAPING', 'INTERIOR_DESIGN', 'STRUCTURAL']).optional(),
  description: z.string().optional(),
  startDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  deadline: z.string().optional().transform((str) => str ? new Date(str) : null),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  assigneeId: z.string().nullable().optional(),
  dependencies: z.array(z.string()).optional(),
  criticalPath: z.boolean().optional(),
});

// Get all tasks
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { category, status, assigneeId } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.projectTask.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, nameAr: true, avatar: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    res.json({ tasks });
  })
);

// Get Gantt chart data
router.get(
  '/gantt',
  authenticate,
  asyncHandler(async (req, res) => {
    const tasks = await prisma.projectTask.findMany({
      include: {
        assignee: {
          select: { id: true, name: true, nameAr: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Format for Gantt chart
    const ganttData = tasks.map((task) => ({
      id: task.id,
      name: task.title,
      nameAr: task.titleAr,
      start: task.startDate.toISOString().split('T')[0],
      end: task.endDate.toISOString().split('T')[0],
      progress: task.progress,
      status: task.status,
      category: task.category,
      criticalPath: task.criticalPath,
      assignee: task.assignee,
      dependencies: task.dependencies ? JSON.parse(task.dependencies as string) : [],
    }));

    res.json({ tasks: ganttData });
  })
);

// Get task statistics
router.get(
  '/stats',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const [
      total,
      byStatus,
      byCategory,
      overdue,
      workload,
    ] = await Promise.all([
      prisma.projectTask.count(),
      prisma.projectTask.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.projectTask.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.projectTask.count({
        where: {
          endDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      prisma.projectTask.groupBy({
        by: ['assigneeId'],
        where: { assigneeId: { not: null } },
        _count: { id: true },
        _avg: { progress: true },
      }),
    ]);

    res.json({
      total,
      byStatus,
      byCategory,
      overdue,
      workload,
    });
  })
);

// Get team workload (for radar chart)
router.get(
  '/workload',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const workload = await prisma.projectTask.groupBy({
      by: ['assigneeId'],
      where: { assigneeId: { not: null } },
      _count: { id: true },
      _avg: { progress: true },
    });

    // Get user details
    const users = await prisma.user.findMany({
      where: {
        id: { in: workload.map((w) => w.assigneeId!) },
      },
      select: { id: true, name: true, nameAr: true },
    });

    const workloadWithNames = workload.map((w) => ({
      ...w,
      user: users.find((u) => u.id === w.assigneeId),
    }));

    res.json({ workload: workloadWithNames });
  })
);

// Get single task
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, nameAr: true, avatar: true, email: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  })
);

// Create task
router.post(
  '/',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.projectTask.create({
      data: {
        title: data.title,
        titleAr: data.titleAr,
        category: data.category,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        deadline: data.deadline,
        assigneeId: data.assigneeId,
        dependencies: data.dependencies ? JSON.stringify(data.dependencies) : null,
        criticalPath: data.criticalPath,
      },
      include: {
        assignee: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    });

    logger.info(`New project task created: ${task.id}`);

    res.status(201).json({ task });
  })
);

// Update task
router.patch(
  '/:id',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = updateTaskSchema.parse(req.body);

    const task = await prisma.projectTask.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleAr !== undefined && { titleAr: data.titleAr }),
        ...(data.category && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
        ...(data.status && { status: data.status }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.dependencies && { dependencies: JSON.stringify(data.dependencies) }),
        ...(data.criticalPath !== undefined && { criticalPath: data.criticalPath }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    });

    logger.info(`Project task updated: ${id}`);

    // Check for delay alert
    if (data.deadline && task.endDate > data.deadline) {
      logger.warn(`Task ${id} is delayed!`);
      // Could trigger notification here
    }

    res.json({ task });
  })
);

// Delete task
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.projectTask.delete({
      where: { id },
    });

    logger.info(`Project task deleted: ${id}`);

    res.json({ message: 'Task deleted successfully' });
  })
);

// Trigger delay alert
router.post(
  '/:id/alert',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    logger.warn(`Delay alert triggered for task: ${id}`);

    // In a real implementation, send email/notification
    res.json({
      message: 'Delay alert sent',
      task: {
        id: task.id,
        title: task.title,
        endDate: task.endDate,
        assignee: task.assignee,
      },
    });
  })
);

export default router;
