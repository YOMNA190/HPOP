import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const generateReportSchema = z.object({
  type: z.enum(['MAINTENANCE', 'PROJECT', 'MARKETING', 'FINANCIAL']),
  format: z.enum(['pdf', 'csv', 'excel']).default('pdf'),
  filters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
});

// Get all reports
router.get(
  '/',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reports });
  })
);

// Generate new report
router.post(
  '/generate',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const data = generateReportSchema.parse(req.body);

    // Create report record
    const report = await prisma.report.create({
      data: {
        type: data.type,
        format: data.format,
        filters: data.filters ? JSON.stringify(data.filters) : null,
        status: 'pending',
      },
    });

    logger.info(`Report generation started: ${report.id}`);

    // In a real implementation, this would be queued with BullMQ
    // For now, simulate report generation
    setTimeout(async () => {
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'completed',
          fileUrl: `/reports/report-${report.id}.${data.format}`,
          completedAt: new Date(),
        },
      });
      logger.info(`Report generation completed: ${report.id}`);
    }, 5000);

    res.status(202).json({
      message: 'Report generation started',
      report: {
        id: report.id,
        type: report.type,
        status: report.status,
      },
    });
  })
);

// Get report status
router.get(
  '/:id',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  })
);

// Download report
router.get(
  '/:id/download',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({ error: 'Report not ready' });
    }

    // In a real implementation, stream the file from storage
    // For now, return mock data
    res.json({
      message: 'Report download',
      report: {
        id: report.id,
        type: report.type,
        format: report.format,
        fileUrl: report.fileUrl,
      },
    });
  })
);

// Delete report
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.report.delete({
      where: { id },
    });

    logger.info(`Report deleted: ${id}`);

    res.json({ message: 'Report deleted successfully' });
  })
);

export default router;
