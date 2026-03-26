import { PrismaClient, Role, Category, Priority, Status, TaskCategory, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.campaignDailyMetric.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const tenantPassword = await bcrypt.hash('tenant123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@alhabeeb.com',
      name: 'System Administrator',
      nameAr: 'مدير النظام',
      role: Role.ADMIN,
      region: 'Qena',
      password: adminPassword,
    },
  });

  const facilityManager = await prisma.user.create({
    data: {
      email: 'manager@jkfacilities.com',
      name: 'Ahmed Hassan',
      nameAr: 'أحمد حسن',
      role: Role.MANAGER,
      region: 'Qena',
      password: managerPassword,
    },
  });

  const tenants = await prisma.user.createMany({
    data: [
      {
        email: 'tenant1@example.com',
        name: 'Mohamed Ali',
        nameAr: 'محمد علي',
        role: Role.TENANT,
        region: 'Qena',
        password: tenantPassword,
      },
      {
        email: 'tenant2@example.com',
        name: 'Fatima Omar',
        nameAr: 'فاطمة عمر',
        role: Role.TENANT,
        region: 'Qena',
        password: tenantPassword,
      },
      {
        email: 'tenant3@example.com',
        name: 'Hassan Ibrahim',
        nameAr: 'حسن إبراهيم',
        role: Role.TENANT,
        region: 'Qena',
        password: tenantPassword,
      },
      {
        email: 'tenant4@example.com',
        name: 'Amina Khalil',
        nameAr: 'أمينة خليل',
        role: Role.TENANT,
        region: 'Qena',
        password: tenantPassword,
      },
      {
        email: 'tenant5@example.com',
        name: 'Omar Farouk',
        nameAr: 'عمر فاروق',
        role: Role.TENANT,
        region: 'Qena',
        password: tenantPassword,
      },
    ],
  });

  const allTenants = await prisma.user.findMany({ where: { role: Role.TENANT } });
  console.log(`✅ Created ${allTenants.length} tenants`);

  // Create maintenance requests with Qena-specific examples
  const maintenanceRequests = await prisma.maintenanceRequest.createMany({
    data: [
      {
        category: Category.AC,
        description: 'AC not working properly - Qena summer heat is unbearable! Unit needs urgent servicing.',
        descriptionAr: 'المكيف لا يعمل بشكل صحيح - حرارة صيف قنا لا تُطاق! الوحدة تحتاج صيانة عاجلة.',
        status: Status.COMPLETED,
        priority: Priority.HIGH,
        assignedTeam: 'HVAC Team',
        internalNotes: 'Replaced compressor, cleaned filters',
        slaBreached: false,
        satisfaction: 5,
        userId: allTenants[0].id,
        unitId: 'A-101',
        unitX: 0.2,
        unitY: 0.3,
        createdAt: new Date('2024-01-15'),
        resolvedAt: new Date('2024-01-16'),
      },
      {
        category: Category.PLUMBING,
        description: 'Water leak in bathroom - affecting our retail display',
        descriptionAr: 'تسرب مياه في الحمام - يؤثر على عرض البيع بالتجزئة لدينا',
        status: Status.IN_PROGRESS,
        priority: Priority.MEDIUM,
        assignedTeam: 'Plumbing Team',
        internalNotes: 'Parts ordered, scheduled for tomorrow',
        slaBreached: false,
        userId: allTenants[1].id,
        unitId: 'B-205',
        unitX: 0.5,
        unitY: 0.4,
        createdAt: new Date('2024-01-20'),
      },
      {
        category: Category.ELECTRICAL,
        description: 'Flickering lights in the main showroom - customers complaining',
        descriptionAr: 'أضواء وامضة في صالة العرض الرئيسية - الشكاوى من العملاء',
        status: Status.ASSIGNED,
        priority: Priority.HIGH,
        assignedTeam: 'Electrical Team',
        slaBreached: false,
        userId: allTenants[2].id,
        unitId: 'C-301',
        unitX: 0.7,
        unitY: 0.6,
        createdAt: new Date('2024-01-22'),
      },
      {
        category: Category.CLEANING,
        description: 'Weekly deep cleaning for restaurant kitchen area',
        descriptionAr: 'تنظيف عميق أسبوعي لمنطقة مطبخ المطعم',
        status: Status.SUBMITTED,
        priority: Priority.LOW,
        slaBreached: false,
        userId: allTenants[3].id,
        unitId: 'D-102',
        unitX: 0.3,
        unitY: 0.7,
        createdAt: new Date('2024-01-23'),
      },
      {
        category: Category.SECURITY,
        description: 'Security camera in parking area needs adjustment',
        descriptionAr: 'كاميرا الأمن في منطقة المواقف تحتاج تعديل',
        status: Status.COMPLETED,
        priority: Priority.MEDIUM,
        assignedTeam: 'Security Team',
        internalNotes: 'Camera repositioned and focused',
        slaBreached: false,
        satisfaction: 4,
        userId: allTenants[4].id,
        unitId: 'E-401',
        unitX: 0.8,
        unitY: 0.2,
        createdAt: new Date('2024-01-18'),
        resolvedAt: new Date('2024-01-19'),
      },
      {
        category: Category.AC,
        description: 'Temperature control not working in office space',
        descriptionAr: 'جهاز التحكم في درجة الحرارة لا يعمل في مساحة المكتب',
        status: Status.IN_PROGRESS,
        priority: Priority.MEDIUM,
        assignedTeam: 'HVAC Team',
        slaBreached: true,
        userId: allTenants[0].id,
        unitId: 'A-105',
        unitX: 0.25,
        unitY: 0.35,
        createdAt: new Date('2024-01-10'),
      },
      {
        category: Category.OTHER,
        description: 'Install gold accents in lobby as per new design',
        descriptionAr: 'تركيب لمسات ذهبية في الردهة حسب التصميم الجديد',
        status: Status.ASSIGNED,
        priority: Priority.LOW,
        assignedTeam: 'Interior Team',
        internalNotes: 'Gold leaf material ordered from Cairo',
        slaBreached: false,
        userId: allTenants[1].id,
        unitId: 'F-201',
        unitX: 0.6,
        unitY: 0.5,
        createdAt: new Date('2024-01-21'),
      },
    ],
  });

  console.log(`✅ Created ${await prisma.maintenanceRequest.count()} maintenance requests`);

  // Create project tasks
  const openingDate = new Date('2026-12-01');

  const projectTasks = await prisma.projectTask.createMany({
    data: [
      {
        title: 'Install gold accents in main lobby',
        titleAr: 'تركيب لمسات ذهبية في الردهة الرئيسية',
        category: TaskCategory.INTERIOR_DESIGN,
        description: 'Apply gold leaf detailing to columns and reception desk',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-15'),
        deadline: new Date('2024-03-20'),
        status: TaskStatus.IN_PROGRESS,
        progress: 65,
        criticalPath: true,
        assigneeId: facilityManager.id,
      },
      {
        title: 'HVAC System Installation',
        titleAr: 'تركيب نظام التكييف',
        category: TaskCategory.MEP,
        description: 'Complete AC installation for all retail units - critical for Qena heat',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-30'),
        deadline: new Date('2024-05-15'),
        status: TaskStatus.IN_PROGRESS,
        progress: 45,
        criticalPath: true,
        assigneeId: facilityManager.id,
      },
      {
        title: 'Nile-inspired fountain installation',
        titleAr: 'تركيب نافورة مستوحاة من النيل',
        category: TaskCategory.LANDSCAPING,
        description: 'Central water feature with LED lighting effects',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-30'),
        deadline: new Date('2024-06-15'),
        status: TaskStatus.NOT_STARTED,
        progress: 0,
        criticalPath: false,
      },
      {
        title: 'Marble flooring - Ground floor',
        titleAr: 'أرضيات رخام - الطابق الأرضي',
        category: TaskCategory.FINISHING,
        description: 'Italian marble installation in common areas',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-04-15'),
        deadline: new Date('2024-04-30'),
        status: TaskStatus.IN_PROGRESS,
        progress: 80,
        criticalPath: true,
        assigneeId: admin.id,
      },
      {
        title: 'Electrical wiring - Phase 2',
        titleAr: 'الأسلاك الكهربائية - المرحلة 2',
        category: TaskCategory.MEP,
        description: 'Complete electrical infrastructure for upper floors',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-03-30'),
        deadline: new Date('2024-04-10'),
        status: TaskStatus.BLOCKED,
        progress: 60,
        criticalPath: true,
        dependencies: JSON.stringify(['task-1']),
        assigneeId: facilityManager.id,
      },
      {
        title: 'Parking lot landscaping',
        titleAr: 'تنسيق حدائق موقف السيارات',
        category: TaskCategory.LANDSCAPING,
        description: 'Palm trees and desert plants installation',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-30'),
        deadline: new Date('2024-07-15'),
        status: TaskStatus.NOT_STARTED,
        progress: 0,
        criticalPath: false,
      },
      {
        title: 'Security system installation',
        titleAr: 'تركيب نظام الأمن',
        category: TaskCategory.MEP,
        description: 'CCTV cameras, access control, and monitoring center',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-05-15'),
        deadline: new Date('2024-05-30'),
        status: TaskStatus.IN_PROGRESS,
        progress: 30,
        criticalPath: true,
      },
      {
        title: 'Retail unit interior finishing',
        titleAr: 'التشطيبات الداخلية لوحدات البيع بالتجزئة',
        category: TaskCategory.FINISHING,
        description: 'Final paint, fixtures, and signage for retail spaces',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-08-30'),
        deadline: new Date('2024-09-15'),
        status: TaskStatus.NOT_STARTED,
        progress: 0,
        criticalPath: true,
      },
    ],
  });

  console.log(`✅ Created ${await prisma.projectTask.count()} project tasks`);

  // Create marketing campaigns
  const campaigns = await prisma.campaign.createMany({
    data: [
      {
        name: 'Retail Units for Qena Investors',
        nameAr: 'وحدات تجارية لمستثمري قنا',
        description: 'Target local investors in Qena governorate',
        spend: 150000,
        impressions: 2500000,
        clicks: 45000,
        conversions: 120,
        targetRegions: JSON.stringify(['Qena', 'Luxor', 'Sohag']),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        active: true,
      },
      {
        name: 'Office Spaces Launch',
        nameAr: 'إطلاق مساحات المكاتب',
        description: 'Premium office spaces for businesses',
        spend: 85000,
        impressions: 1800000,
        clicks: 32000,
        conversions: 85,
        targetRegions: JSON.stringify(['Cairo', 'Alexandria', 'Qena']),
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-30'),
        active: true,
      },
      {
        name: 'Food Court Pre-booking',
        nameAr: 'الحجز المسبق لمنطقة المطاعم',
        description: 'Early bird offers for restaurant tenants',
        spend: 45000,
        impressions: 950000,
        clicks: 18000,
        conversions: 45,
        targetRegions: JSON.stringify(['Qena']),
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-28'),
        active: false,
      },
      {
        name: 'Grand Opening Teaser',
        nameAr: '-teaser الافتتاح الكبير',
        description: 'Building anticipation for December 2026 opening',
        spend: 25000,
        impressions: 500000,
        clicks: 8500,
        conversions: 0,
        targetRegions: JSON.stringify(['Qena', 'Luxor', 'Sohag', 'Cairo']),
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        active: true,
      },
    ],
  });

  console.log(`✅ Created ${await prisma.campaign.count()} campaigns`);

  // Create daily metrics for campaigns
  const allCampaigns = await prisma.campaign.findMany();
  for (const campaign of allCampaigns) {
    const dailyMetrics = [];
    const days = Math.floor((campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(campaign.startDate);
      date.setDate(date.getDate() + i);
      
      dailyMetrics.push({
        date,
        spend: Math.random() * (campaign.spend / 30),
        impressions: Math.floor(Math.random() * (campaign.impressions / 30)),
        clicks: Math.floor(Math.random() * (campaign.clicks / 30)),
        conversions: Math.floor(Math.random() * (campaign.conversions / 30)),
        campaignId: campaign.id,
      });
    }
    
    await prisma.campaignDailyMetric.createMany({ data: dailyMetrics });
  }

  console.log(`✅ Created ${await prisma.campaignDailyMetric.count()} daily metrics`);

  // Create inquiries with geo data
  const inquiries = await prisma.inquiry.createMany({
    data: [
      { name: 'Khaled Mahmoud', email: 'khaled@example.com', phone: '+20 100 123 4567', message: 'Interested in retail unit 200-300 sqm', region: 'Qena', unitType: 'retail', latitude: 26.1551, longitude: 32.7160 },
      { name: 'Samar Adel', email: 'samar@example.com', phone: '+20 101 234 5678', message: 'Looking for office space for my company', region: 'Qena', unitType: 'office', latitude: 26.1600, longitude: 32.7200 },
      { name: 'Hani Fouad', email: 'hani@example.com', phone: '+20 102 345 6789', message: 'Restaurant space inquiry', region: 'Luxor', unitType: 'restaurant', latitude: 25.6872, longitude: 32.6396 },
      { name: 'Nadia Salem', email: 'nadia@example.com', phone: '+20 103 456 7890', message: 'Retail investment opportunity', region: 'Cairo', unitType: 'retail', latitude: 30.0444, longitude: 31.2357 },
      { name: 'Tarek Anwar', email: 'tarek@example.com', phone: '+20 104 567 8901', message: 'Multiple units for franchise', region: 'Sohag', unitType: 'retail', latitude: 26.5605, longitude: 31.6919 },
      { name: 'Layla Mostafa', email: 'layla@example.com', phone: '+20 105 678 9012', message: 'Boutique space needed', region: 'Qena', unitType: 'retail', latitude: 26.1580, longitude: 32.7180 },
      { name: 'Youssef Hamed', email: 'youssef@example.com', phone: '+20 106 789 0123', message: 'Tech startup office space', region: 'Cairo', unitType: 'office', latitude: 30.0500, longitude: 31.2400 },
      { name: 'Mona Rashid', email: 'mona@example.com', phone: '+20 107 890 1234', message: 'Cafe and bakery space', region: 'Qena', unitType: 'restaurant', latitude: 26.1520, longitude: 32.7140 },
    ],
  });

  console.log(`✅ Created ${await prisma.inquiry.count()} inquiries`);

  // Create notifications
  const notifications = await prisma.notification.createMany({
    data: [
      { title: 'New Maintenance Request', titleAr: 'طلب صيانة جديد', message: 'AC repair request submitted', messageAr: 'تم تقديم طلب إصلاح المكيف', type: 'INFO', userId: facilityManager.id },
      { title: 'Task Completed', titleAr: 'تم إنجاز المهمة', message: 'Gold accents installation completed', messageAr: 'تم الانتهاء من تركيب اللمسات الذهبية', type: 'SUCCESS', userId: admin.id },
      { title: 'SLA Alert', titleAr: 'تنبيه مستوى الخدمة', message: 'Request #123 approaching SLA breach', messageAr: 'الطلب #123 يقترب من تجاوز مستوى الخدمة', type: 'WARNING', userId: facilityManager.id },
      { title: 'Campaign Performance', titleAr: 'أداء الحملة', message: 'Qena Investors campaign reached 1M impressions', messageAr: 'وصلت حملة مستثمري قنا إلى مليون انطباع', type: 'SUCCESS', userId: admin.id },
    ],
  });

  console.log(`✅ Created ${await prisma.notification.count()} notifications`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Maintenance Requests: ${await prisma.maintenanceRequest.count()}`);
  console.log(`   - Project Tasks: ${await prisma.projectTask.count()}`);
  console.log(`   - Campaigns: ${await prisma.campaign.count()}`);
  console.log(`   - Inquiries: ${await prisma.inquiry.count()}`);
  console.log(`   - Notifications: ${await prisma.notification.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
