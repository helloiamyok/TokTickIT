import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Sprint 2...');

  // 1. Categories เดิมของคุณ (4 หมวดหมู่ตามข้อกำหนดแล็ป)
  const categories = [
    { name: 'Account and Access' },
    { name: 'Hardware' },
    { name: 'Software' },
    { name: 'Network' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
  }

  // 2. เพิ่ม Related Systems (อย่างน้อย 6 ระบบตามข้อกำหนดแล็ป)
  const relatedSystems = [
    { name: 'Corporate Laptop' },
    { name: 'Campus Wi-Fi' },
    { name: 'VPN' },
    { name: 'LEB2 App' },
    { name: 'Grade Submission App' },
    { name: 'Email' },
    { name: 'Printer' },
  ];

  for (const sys of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: {},
      create: { name: sys.name },
    });
  }

  // 3. เพิ่ม Development Requesters (4 Active + 1 Inactive ตามข้อกำหนดแล็ป)
  const requesters = [
    { name: 'Jennifer Anderson', email: 'jennifer.anderson@example.com', isActive: true },
    { name: 'Michael Brown', email: 'michael.brown@example.com', isActive: true },
    { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', isActive: true },
    { name: 'David Lee', email: 'david.lee@example.com', isActive: true },
    { name: 'John Inactive', email: 'john.inactive@example.com', isActive: false },
  ];

  for (const req of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: { isActive: req.isActive, name: req.name },
      create: { name: req.name, email: req.email, isActive: req.isActive },
    });
  }

  console.log('Seeding completed successfully with Categories, Related Systems, and Requesters.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });