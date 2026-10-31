const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../server/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function updateActions() {
  const ticket = await prisma.ticket.findFirst({
    where: { ticketNo: 'TKT-2026-001234' }
  });
  if (!ticket) {
    console.log('Ticket not found');
    return;
  }
  const staff = await prisma.user.findFirst({
    where: { email: 'michael.brown@tiktockit.com' }
  });

  // Delete existing actions on ticket
  await prisma.actionTaken.deleteMany({
    where: { ticketId: ticket.id }
  });

  // 1. Action 1: Status Complete
  await prisma.actionTaken.create({
    data: {
      ticketId: ticket.id,
      actionDateTime: new Date(Date.now() - 7200000),
      actionDescription: 'Ran full battery diagnostic and health telemetry scan',
      result: 'Complete: Battery health report generated (wear level estimated at 42%)',
      performedById: staff.id,
      followUpRequired: false,
      attachmentNotes: 'battery_diagnostic_report.pdf'
    }
  });

  // 2. Action 2: Status Cancel
  await prisma.actionTaken.create({
    data: {
      ticketId: ticket.id,
      actionDateTime: new Date(Date.now() - 3600000),
      actionDescription: 'Scheduled on-site motherboard and power rail hardware replacement',
      result: 'Cancel: Cancelled by requester; confirmed issue is isolated to battery wear',
      performedById: staff.id,
      followUpRequired: false,
      attachmentNotes: 'vendor_cancellation_receipt.pdf'
    }
  });

  // 3. Action 3: Status Complete with Follow-up
  await prisma.actionTaken.create({
    data: {
      ticketId: ticket.id,
      actionDateTime: new Date(),
      actionDescription: 'Diagnosed thermal throttling and replaced cooling fan assembly',
      result: 'Complete: Applied Arctic MX-4 thermal paste and verified RPM stability',
      performedById: staff.id,
      followUpRequired: true,
      followUpNote: 'Follow-up with requester after 48 hours of normal office workload',
      attachmentNotes: 'thermal_diagnostic_log.txt'
    }
  });

  console.log('Successfully seeded 3 actions with Complete and Cancel statuses for ticket:', ticket.id);
}

updateActions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
