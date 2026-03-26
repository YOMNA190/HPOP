import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const createCampaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  spend: z.number().default(0),
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  conversions: z.number().default(0),
  targetRegions: z.array(z.string()).default([]),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

// Get all campaigns
router.get(
  '/',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { active } = req.query;

    const where: any = {};
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ campaigns });
  })
);

// Get campaign analytics
router.get(
  '/analytics',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const campaigns = await prisma.campaign.findMany({
      include: {
        dailyMetrics: {
          orderBy: { date: 'asc' },
        },
      },
    });

    // Aggregate metrics
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // Best performing campaign
    const bestCampaign = campaigns.length > 0
      ? campaigns.reduce((best, current) =>
          current.conversions > best.conversions ? current : best
        )
      : null;

    // Campaigns by region
    const byRegion: Record<string, number> = {};
    campaigns.forEach((c) => {
      const regions = c.targetRegions as string[];
      regions.forEach((r) => {
        byRegion[r] = (byRegion[r] || 0) + c.conversions;
      });
    });

    // Time series data for bar chart race
    const timeSeriesData = campaigns.map((c) => ({
      campaignId: c.id,
      name: c.name,
      nameAr: c.nameAr,
      dailyMetrics: c.dailyMetrics.map((d) => ({
        date: d.date,
        spend: d.spend,
        impressions: d.impressions,
        clicks: d.clicks,
        conversions: d.conversions,
      })),
    }));

    res.json({
      summary: {
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgCTR: Math.round(avgCTR * 100) / 100,
        avgCPC: Math.round(avgCPC * 100) / 100,
        avgCPA: Math.round(avgCPA * 100) / 100,
      },
      bestCampaign: bestCampaign
        ? {
            id: bestCampaign.id,
            name: bestCampaign.name,
            nameAr: bestCampaign.nameAr,
            conversions: bestCampaign.conversions,
            spend: bestCampaign.spend,
            roi: bestCampaign.spend > 0
              ? ((bestCampaign.conversions * 1000 - bestCampaign.spend) / bestCampaign.spend) * 100
              : 0,
          }
        : null,
      byRegion,
      timeSeriesData,
    });
  })
);

// Get geo heatmap data
router.get(
  '/heatmap',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const inquiries = await prisma.inquiry.findMany({
      select: {
        region: true,
        latitude: true,
        longitude: true,
        unitType: true,
        createdAt: true,
      },
    });

    // Group by region
    const byRegion = inquiries.reduce((acc, inquiry) => {
      const region = inquiry.region;
      if (!acc[region]) {
        acc[region] = { count: 0, inquiries: [] };
      }
      acc[region].count++;
      acc[region].inquiries.push(inquiry);
      return acc;
    }, {} as Record<string, { count: number; inquiries: typeof inquiries }>);

    res.json({
      inquiries,
      byRegion,
      total: inquiries.length,
    });
  })
);

// Get single campaign
router.get(
  '/:id',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        dailyMetrics: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Calculate metrics
    const ctr = campaign.impressions > 0
      ? (campaign.clicks / campaign.impressions) * 100
      : 0;
    const conversionRate = campaign.clicks > 0
      ? (campaign.conversions / campaign.clicks) * 100
      : 0;

    res.json({
      campaign: {
        ...campaign,
        metrics: {
          ctr: Math.round(ctr * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
        },
      },
    });
  })
);

// Create campaign
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const data = createCampaignSchema.parse(req.body);

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        spend: data.spend,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        targetRegions: JSON.stringify(data.targetRegions),
        startDate: data.startDate,
        endDate: data.endDate,
        active: true,
      },
    });

    logger.info(`New campaign created: ${campaign.id}`);

    res.status(201).json({ campaign });
  })
);

// Update campaign
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = createCampaignSchema.partial().parse(req.body);

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.spend !== undefined && { spend: data.spend }),
        ...(data.impressions !== undefined && { impressions: data.impressions }),
        ...(data.clicks !== undefined && { clicks: data.clicks }),
        ...(data.conversions !== undefined && { conversions: data.conversions }),
        ...(data.targetRegions && { targetRegions: JSON.stringify(data.targetRegions) }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
      },
    });

    logger.info(`Campaign updated: ${id}`);

    res.json({ campaign });
  })
);

// Delete campaign
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id },
    });

    logger.info(`Campaign deleted: ${id}`);

    res.json({ message: 'Campaign deleted successfully' });
  })
);

// Get insights and recommendations
router.get(
  '/insights',
  authenticate,
  authorize('MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const campaigns = await prisma.campaign.findMany();

    const insights = [];

    // Calculate average CTR
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Find campaigns with high CTR
    const highCTRCampaigns = campaigns.filter((c) => {
      const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      return ctr > avgCTR * 1.2;
    });

    if (highCTRCampaigns.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Increase Budget on High-Performing Campaigns',
        titleAr: 'زيادة الميزانية على الحملات عالية الأداء',
        description: `${highCTRCampaigns.length} campaigns have CTR +20% above average`,
        descriptionAr: `${highCTRCampaigns.length} حملات لديها معدل نقرات أعلى بنسبة 20٪ من المتوسط`,
        campaigns: highCTRCampaigns.map((c) => c.name),
        action: 'Consider increasing budget by 15-25%',
      });
    }

    // Find campaigns with low conversion
    const lowConversionCampaigns = campaigns.filter((c) => {
      const conversionRate = c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0;
      return conversionRate < 1 && c.clicks > 1000;
    });

    if (lowConversionCampaigns.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Optimize Landing Pages',
        titleAr: 'تحسين صفحات الهبوط',
        description: `${lowConversionCampaigns.length} campaigns have high clicks but low conversions`,
        descriptionAr: `${lowConversionCampaigns.length} حملات لديها نقرات عالية ولكن تحويلات منخفضة`,
        campaigns: lowConversionCampaigns.map((c) => c.name),
        action: 'Review and optimize landing page experience',
      });
    }

    // Qena-specific insight
    const qenaCampaigns = campaigns.filter((c) => {
      const regions = c.targetRegions as string[];
      return regions.includes('Qena');
    });

    if (qenaCampaigns.length > 0) {
      const qenaConversions = qenaCampaigns.reduce((sum, c) => sum + c.conversions, 0);
      insights.push({
        type: 'info',
        title: 'Qena Market Performance',
        titleAr: 'أداء سوق قنا',
        description: `Qena-targeted campaigns generated ${qenaConversions} conversions`,
        descriptionAr: `الحملات المستهدفة لقنا حققت ${qenaConversions} تحويلة`,
        action: 'Continue focusing on local market engagement',
      });
    }

    res.json({ insights });
  })
);

export default router;
