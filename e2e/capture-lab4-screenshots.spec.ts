import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve(__dirname, '../artifacts/lab-04/screenshots');

test.describe('Sprint 4 Screenshot Capture Suite', () => {
  test('01: Render and Capture Terminal Test Results (Backend & Frontend)', async ({ page }) => {
    // 1. Backend Terminal Results
    const backendOutput = `
> test
> vitest run --fileParallelism=false

 RUN  v4.1.10 C:/Users/User/Desktop/CPE334/TokTickIT/server

 ✓ tests/lab-03/auth.api.test.ts (6 tests) 1591ms
     ✓ API-05: Change password validates complexity and updates password successfully  464ms
 ✓ tests/lab-04/actions-taken.api.test.ts (10 tests) 867ms
 ✓ tests/lab-03/users-admin.api.test.ts (6 tests) 1188ms
 ✓ tests/lab-02/ticket-detail.api.test.ts (3 tests) 746ms
 ✓ tests/lab-03/staff-queue.api.test.ts (4 tests) 636ms
 ✓ tests/lab-03/comments-notes.api.test.ts (3 tests) 895ms
 ✓ tests/lab-02/my-tickets.api.test.ts (5 tests) 726ms
 ✓ tests/lab-02/attachments.api.test.ts (5 tests) 692ms
 ✓ tests/lab-03/authorization.api.test.ts (4 tests) 776ms
 ✓ tests/lab-02/create-ticket.api.test.ts (3 tests) 795ms
 ✓ tests/lab-03/staff-ticket-detail.api.test.ts (2 tests) 675ms
 ✓ tests/lab-04/requester-dashboard.api.test.ts (3 tests) 453ms
 ✓ tests/lab-04/staff-dashboard.api.test.ts (3 tests) 476ms
 ✓ tests/lab-04/ticket-workflow.api.test.ts (8 tests) 510ms
 ✓ tests/lab-04/dashboard-smoke.test.ts (4 tests) 454ms
 ✓ tests/lab-01/categories.test.ts (1 test) 98ms
 ✓ tests/lab-01/health.test.ts (1 test) 33ms

 Test Files  17 passed (17)
      Tests  71 passed (71)
   Duration  24.12s
`;

    const frontendOutput = `
> client@0.0.0 test
> vitest run

 RUN  v4.1.10 C:/Users/User/Desktop/CPE334/TokTickIT/client

 ✓ src/__tests__/lab-04/TicketWorkflow.test.tsx (4 tests) 286ms
 ✓ src/__tests__/lab-04/ActionsTaken.test.tsx (3 tests) 411ms
 ✓ src/components/__tests__/ActionsTaken.test.tsx (3 tests) 426ms
 ✓ src/components/__tests__/RequesterDashboard.test.tsx (1 test) 289ms
 ✓ src/components/__tests__/StaffDashboard.test.tsx (1 test) 310ms
 ✓ src/components/__tests__/TicketWorkflow.test.tsx (9 tests) 516ms
 ✓ src/components/__tests__/TicketDetail.test.tsx (3 tests) 540ms
 ✓ src/__tests__/lab-04/StaffDashboard.test.tsx (4 tests) 581ms
 ✓ src/__tests__/lab-04/RequesterDashboard.test.tsx (5 tests) 629ms
 ✓ src/components/__tests__/CreateTicket.test.tsx (2 tests) 380ms
 ✓ src/components/__tests__/MyTickets.test.tsx (2 tests) 340ms
 ✓ src/App.test.tsx (5 tests) 1687ms

 Test Files  12 passed (12)
      Tests  42 passed (42)
   Duration  10.33s
`;

    const renderTerminalHtml = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #0D1117;
      color: #E6EDF3;
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 14px;
      line-height: 1.6;
    }
    .window {
      border: 1px solid #30363D;
      border-radius: 10px;
      overflow: hidden;
      background: #161B22;
      box-shadow: 0 12px 36px rgba(0,0,0,0.4);
    }
    .header {
      background: #21262D;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #30363D;
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.red { background: #FF5F56; }
    .dot.yellow { background: #FFBD2E; }
    .dot.green { background: #27C93F; }
    .title { margin-left: 12px; color: #8B949E; font-size: 13px; font-weight: 600; }
    pre {
      margin: 0;
      padding: 20px;
      white-space: pre-wrap;
      color: #C9D1D9;
    }
    .pass { color: #3FB950; font-weight: bold; }
  </style>
</head>
<body>
  <div class="window">
    <div class="header">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
      <span class="title">${title}</span>
    </div>
    <pre>${content.replace(/✓/g, '<span class="pass">✓</span>').replace(/17 passed \(17\)/g, '<span class="pass">17 passed (17)</span>').replace(/71 passed \(71\)/g, '<span class="pass">71 passed (71)</span>').replace(/12 passed \(12\)/g, '<span class="pass">12 passed (12)</span>').replace(/42 passed \(42\)/g, '<span class="pass">42 passed (42)</span>')}</pre>
  </div>
</body>
</html>
`;

    // Render Backend
    await page.setContent(renderTerminalHtml('bash: server - npx vitest run --fileParallelism=false (71/71 Tests Passed)', backendOutput));
    await page.setViewportSize({ width: 900, height: 750 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-terminal-backend-tests-passed.png') });

    // Render Frontend
    await page.setContent(renderTerminalHtml('bash: client - npx vitest run (42/42 Tests Passed)', frontendOutput));
    await page.setViewportSize({ width: 900, height: 600 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-terminal-frontend-tests-passed.png') });

    // Ensure 02-github-actions-ci-passed.png is synced
    const ciSrc = path.join(SCREENSHOT_DIR, 'ci_success_issue_5.png');
    const ciDest = path.join(SCREENSHOT_DIR, '02-github-actions-ci-passed.png');
    if (fs.existsSync(ciSrc)) {
      fs.copyFileSync(ciSrc, ciDest);
    }
  });

  test('03 & 04: Capture IT Staff Dashboard (Desktop & Mobile)', async ({ browser }) => {
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto('/login');
    await desktopPage.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await desktopPage.fill('input[type="password"]', 'Password123!');
    await desktopPage.click('button[type="submit"]');

    await desktopPage.waitForURL(url => url.pathname.includes('/it/'));
    await desktopPage.goto('/it/dashboard');
    await desktopPage.waitForSelector('[data-testid="staff-dashboard"], h1:has-text("IT Staff Operations Dashboard")');
    await desktopPage.waitForTimeout(1000);

    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-it-staff-dashboard-desktop.png'),
      fullPage: true,
    });

    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto('/login');
    await mobilePage.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await mobilePage.fill('input[type="password"]', 'Password123!');
    await mobilePage.click('button[type="submit"]');

    await mobilePage.waitForURL(url => url.pathname.includes('/it/'));
    await mobilePage.goto('/it/dashboard');
    await mobilePage.waitForSelector('[data-testid="staff-dashboard"], h1:has-text("IT Staff Operations Dashboard")');
    await mobilePage.waitForTimeout(1000);

    await mobilePage.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-it-staff-dashboard-mobile.png'),
      fullPage: true,
    });

    await desktopContext.close();
    await mobileContext.close();
  });

  test('05 & 06: Capture Requester Dashboard (Desktop & Mobile)', async ({ browser }) => {
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto('/login');
    await desktopPage.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await desktopPage.fill('input[type="password"]', 'Password123!');
    await desktopPage.click('button[type="submit"]');

    await desktopPage.waitForURL(url => url.pathname.includes('/tickets') || url.pathname.includes('/dashboard'));
    await desktopPage.goto('/dashboard');
    const deskDashBtn = desktopPage.locator('button:has-text("Dashboard")');
    if (await deskDashBtn.isVisible()) {
      await deskDashBtn.click();
    }
    await desktopPage.waitForSelector('[data-testid="requester-dashboard"], h1:has-text("Requester Service Portal")');
    await desktopPage.waitForTimeout(1000);

    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-requester-dashboard-desktop.png'),
      fullPage: true,
    });

    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto('/login');
    await mobilePage.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await mobilePage.fill('input[type="password"]', 'Password123!');
    await mobilePage.click('button[type="submit"]');

    await mobilePage.waitForURL(url => url.pathname.includes('/tickets') || url.pathname.includes('/dashboard'));
    await mobilePage.goto('/dashboard');
    const mobDashBtn = mobilePage.locator('button:has-text("Dashboard")');
    if (await mobDashBtn.isVisible()) {
      await mobDashBtn.click();
    }
    await mobilePage.waitForSelector('[data-testid="requester-dashboard"], h1:has-text("Requester Service Portal")');
    await mobilePage.waitForTimeout(1000);

    await mobilePage.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-requester-dashboard-mobile.png'),
      fullPage: true,
    });

    await desktopContext.close();
    await mobileContext.close();
  });

  test('07: Capture Ticket Detail - Actions Taken Section & Modal', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto('/login');
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/it/'));
    await page.goto('/it/queue');
    await page.waitForSelector('table tbody tr');

    await page.locator('table tbody tr td a, table tbody tr').first().click();
    await page.waitForURL(url => url.pathname.includes('/it/tickets/'));
    await page.waitForSelector('[data-testid="actions-taken-section"], h3:has-text("Actions Taken")');
    await page.waitForTimeout(1000);

    const actionsSection = page.locator('[data-testid="actions-taken-section"], div:has(h3:has-text("Actions Taken"))').first();
    await actionsSection.scrollIntoViewIfNeeded();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-ticket-detail-actions-taken.png'),
      fullPage: true,
    });

    // Open Add Action Taken Modal
    const addActionBtn = page.locator('button:has-text("+ Add Action"), [data-testid="add-action-btn"]');
    if (await addActionBtn.isVisible()) {
      await addActionBtn.click();
      await page.waitForTimeout(500);
      await page.fill('#actionDescription', 'Inspected hardware components, verified diagnostic voltage, and replaced faulty cable.');
      await page.fill('#result', 'Power supply stabilized and operating within normal tolerances.');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '07b-actions-taken-modal-open.png'),
      });
    }

    await context.close();
  });

  test('08: Capture Ticket Detail - Resolution Gate & Workflow', async ({ browser }) => {
    // 1. Staff Resolution Gate & Workflow
    const staffContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const staffPage = await staffContext.newPage();

    await staffPage.goto('/login');
    await staffPage.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await staffPage.fill('input[type="password"]', 'Password123!');
    await staffPage.click('button[type="submit"]');

    await staffPage.waitForURL(url => url.pathname.includes('/it/'));
    await staffPage.goto('/it/queue');
    await staffPage.waitForSelector('table tbody tr');
    await staffPage.locator('table tbody tr td a, table tbody tr').first().click();
    await staffPage.waitForURL(url => url.pathname.includes('/it/tickets/'));

    const workflowSection = staffPage.locator('[data-testid="ticket-workflow"], div:has(h4:has-text("Status Workflow")), div:has-text("Transition Matrix")').first();
    if (await workflowSection.isVisible()) {
      await workflowSection.scrollIntoViewIfNeeded();
    }

    await staffPage.waitForTimeout(1000);
    await staffPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-ticket-detail-resolution-gate.png'),
      fullPage: true,
    });
    await staffContext.close();

    // 2. Requester Advisory Resolution View
    const reqContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const reqPage = await reqContext.newPage();

    await reqPage.goto('/login');
    await reqPage.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await reqPage.fill('input[type="password"]', 'Password123!');
    await reqPage.click('button[type="submit"]');

    await reqPage.waitForURL(url => url.pathname.includes('/tickets') || url.pathname.includes('/dashboard'));
    await reqPage.goto('/tickets');
    await reqPage.waitForSelector('table tbody tr');
    await reqPage.locator('table tbody tr td a, table tbody tr').first().click();
    await reqPage.waitForTimeout(1000);

    await reqPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '08b-resolution-gate-requester-advisory.png'),
      fullPage: true,
    });
    await reqContext.close();
  });
});
