import { PrismaClient, Role, Priority, TicketStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Sprint 3 (TokTickIT)...');

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const initialPasswordHash = await bcrypt.hash('Initial123!', 10);

  // 1. Clean existing transactional records safely for idempotency
  await prisma.ticketComment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Categories (เดิมจาก Sprint 2)
  const categoriesData = [
    { name: 'Account and Access' },
    { name: 'Hardware' },
    { name: 'Software' },
    { name: 'Network' },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name },
      })
    )
  );

  const hardwareCat = categories.find((c) => c.name === 'Hardware')!;
  const networkCat = categories.find((c) => c.name === 'Network')!;
  const softwareCat = categories.find((c) => c.name === 'Software')!;

  // 3. Seed Related Systems (เดิมจาก Sprint 2)
  const relatedSystemsData = [
    { name: 'Corporate Laptop' },
    { name: 'Campus Wi-Fi' },
    { name: 'VPN' },
    { name: 'LEB2 App' },
    { name: 'Grade Submission App' },
    { name: 'Email' },
    { name: 'Printer' },
  ];

  const relatedSystems = await Promise.all(
    relatedSystemsData.map((sys) =>
      prisma.relatedSystem.upsert({
        where: { name: sys.name },
        update: {},
        create: { name: sys.name },
      })
    )
  );

  const laptopSys = relatedSystems.find((s) => s.name === 'Corporate Laptop')!;
  const vpnSys = relatedSystems.find((s) => s.name === 'VPN')!;
  const emailSys = relatedSystems.find((s) => s.name === 'Email')!;

  // 4. Seed Users (Admin 1, IT Staff 3 Active + 1 Inactive, Requester 4 Active + 1 Inactive)
  // 4.1 Admin (1 Active)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'System Administrator',
      role: Role.ADMINISTRATOR,
      isActive: true,
      mustChangePassword: false,
    },
  });

  // 4.2 IT Staff (3 Active + 1 Inactive)
  const staff1 = await prisma.user.create({
    data: {
      email: 'michael.brown@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Michael Brown',
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Sarah Johnson',
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const staff3 = await prisma.user.create({
    data: {
      email: 'david.lee@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'David Lee',
      role: Role.IT_STAFF,
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.user.create({
    data: {
      email: 'kevin.patel@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Kevin Patel',
      role: Role.IT_STAFF,
      isActive: false,
      mustChangePassword: false,
    },
  });

  // 4.3 Requesters (4 Active + 1 Inactive)
  const req1 = await prisma.user.create({
    data: {
      email: 'jennifer.anderson@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Jennifer Anderson',
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const req2 = await prisma.user.create({
    data: {
      email: 'emily.davis@tiktockit.com',
      passwordHash: initialPasswordHash,
      name: 'Emily Davis',
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: true, // For First-Login Password Change Testing
    },
  });

  const req3 = await prisma.user.create({
    data: {
      email: 'amanda.clark@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Amanda Clark',
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const req4 = await prisma.user.create({
    data: {
      email: 'lisa.martinez@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Lisa Martinez',
      role: Role.REQUESTER,
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.user.create({
    data: {
      email: 'robert.wilson@tiktockit.com',
      passwordHash: defaultPasswordHash,
      name: 'Robert Wilson',
      role: Role.REQUESTER,
      isActive: false,
      mustChangePassword: false,
    },
  });

  // 5. Seed Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNo: 'TKT-2026-001234',
      summary: 'Laptop battery drains quickly',
      description: 'My laptop battery is draining much faster than usual even when the system is idle.',
      requestedPriority: Priority.MEDIUM,
      itPriority: Priority.MEDIUM,
      currentStatus: TicketStatus.IN_PROGRESS,
      requesterId: req1.id,
      assignedToId: staff1.id,
      categoryId: hardwareCat.id,
      relatedSystemId: laptopSys.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNo: 'TKT-2026-001235',
      summary: 'Cannot connect to VPN',
      description: 'VPN authentication times out continuously after network maintenance.',
      requestedPriority: Priority.HIGH,
      itPriority: Priority.HIGH,
      currentStatus: TicketStatus.OPEN,
      requesterId: req2.id,
      assignedToId: staff2.id,
      categoryId: networkCat.id,
      relatedSystemId: vpnSys.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNo: 'TKT-2026-001236',
      summary: 'Email client synchronization error',
      description: 'Corporate emails are stuck in the outbox and not syncing with the server.',
      requestedPriority: Priority.LOW,
      itPriority: Priority.LOW,
      currentStatus: TicketStatus.NEW,
      requesterId: req3.id,
      assignedToId: null, // Unassigned queue ticket
      categoryId: softwareCat.id,
      relatedSystemId: emailSys.id,
    },
  });

  // 6. Seed Comments & Internal Notes
  await prisma.ticketComment.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorId: req1.id,
        content: 'Just adding that this issue occurs even when I close all applications.',
        isInternal: false,
      },
      {
        ticketId: ticket1.id,
        authorId: staff1.id,
        content: 'We are investigating the issue on your device. We will update you shortly.',
        isInternal: false,
      },
      {
        ticketId: ticket1.id,
        authorId: staff1.id,
        content: 'Internal note: Suspect background telemetry task running uncontrollably.',
        isInternal: true, // Visible only to IT Staff & Admin
      },
    ],
  });

  console.log('Sprint 3 database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });