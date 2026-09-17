import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = 'C:/Users/User/Desktop/TokTickIT_Lab2_Screenshots';
const ARTIFACT_DIR = 'c:/Users/User/Desktop/CPE334/TokTickIT/artifacts/lab-02/screenshots';

// Ensure directories exist
const folders = [
  'Part_1_Git_Workflow',
  'Part_3_Automated_Tests',
  'Part_6_Create_Ticket',
  'Part_7_My_Tickets',
  'Part_8_Ticket_Detail',
  'Part_9_Responsive_Evidence',
  'create-ticket',
  'my-tickets',
  'ticket-detail',
];

folders.forEach((f) => {
  fs.mkdirSync(path.join(OUTPUT_DIR, f), { recursive: true });
  fs.mkdirSync(path.join(ARTIFACT_DIR, f), { recursive: true });
});

async function saveBoth(page, relativePath) {
  const p1 = path.join(OUTPUT_DIR, relativePath);
  const p2 = path.join(ARTIFACT_DIR, relativePath);
  fs.mkdirSync(path.dirname(p1), { recursive: true });
  fs.mkdirSync(path.dirname(p2), { recursive: true });
  await page.screenshot({ path: p1, fullPage: false });
  await page.screenshot({ path: p2, fullPage: false });
  console.log(`Saved screenshot: ${relativePath}`);
}

async function run() {
  console.log('Starting Playwright screenshot capture...');
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // 1. Desktop Session (1280x800)
  // -------------------------------------------------------------
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Load app
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // --- PART 6.1: Dev Requester Selection (Dropdown) ---
  await saveBoth(page, 'Part_6_Create_Ticket/1_dev_requester_selection.png');

  // --- PART 6.2: Create Ticket Screen Initial (Desktop) ---
  await page.click('button:has-text("Create Ticket")');
  await page.waitForTimeout(800);
  await saveBoth(page, 'Part_6_Create_Ticket/2_create_ticket_desktop_initial.png');
  await saveBoth(page, 'Part_9_Responsive_Evidence/1_desktop_viewport_1280px.png');
  await saveBoth(page, 'create-ticket/desktop.png');

  // --- PART 6.3: Validation Failure State ---
  await page.click('button:has-text("Submit Ticket")');
  await page.waitForTimeout(500);
  await saveBoth(page, 'Part_6_Create_Ticket/3_validation_failure_empty_fields.png');

  // --- PART 6.4: Fill and Submit Form -> Success State ---
  // Select Category
  await page.selectOption('select:has-text("Select Category")', { index: 1 });
  // Select Related System
  await page.selectOption('select:has-text("Select System")', { index: 1 });
  // Priority
  await page.selectOption('select:has(option[value="HIGH"])', 'HIGH');
  // Summary
  await page.fill('input[placeholder*="Brief summary"]', 'Battery overheating and rapid drain');
  // Description
  await page.fill('textarea[placeholder*="Provide details"]', 'The laptop battery reaches 85°C and discharges completely within 20 minutes under normal web browsing.');
  
  await page.waitForTimeout(500);
  await saveBoth(page, 'Part_6_Create_Ticket/4_form_filled_before_submit.png');

  // Submit
  await page.click('button:has-text("Submit Ticket")');
  await page.waitForTimeout(1000);
  await saveBoth(page, 'Part_6_Create_Ticket/5_ticket_created_success_screen.png');
  await saveBoth(page, 'create-ticket/desktop_success.png');

  // --- PART 7.1: My Tickets for Requester A ---
  await page.click('button:has-text("My Tickets")');
  await page.waitForTimeout(1000);
  await saveBoth(page, 'Part_7_My_Tickets/1_my_tickets_requester_A.png');
  await saveBoth(page, 'my-tickets/desktop.png');

  // --- PART 7.3: Search & Filter Active ---
  await page.fill('input[placeholder*="Ticket No or Summary"]', 'Battery');
  await page.click('button:has-text("Filter / Search")');
  await page.waitForTimeout(500);
  await saveBoth(page, 'Part_7_My_Tickets/2_my_tickets_search_active.png');

  // --- PART 7.4: No Results State ---
  await page.fill('input[placeholder*="Ticket No or Summary"]', 'XYZNONEXISTENT999');
  await page.click('button:has-text("Filter / Search")');
  await page.waitForTimeout(500);
  await saveBoth(page, 'Part_7_My_Tickets/3_my_tickets_no_results_state.png');

  // Reset filters
  await page.click('button:has-text("Reset All Filters")');
  await page.waitForTimeout(800);

  // --- PART 7.2: Requester Data Isolation (Switch to Requester B) ---
  // Select Michael Brown in Dev Requester Switcher
  await page.selectOption('.dev-switcher-select', { label: 'Michael Brown (michael.brown@example.com) ' });
  await page.waitForTimeout(1000);
  await saveBoth(page, 'Part_7_My_Tickets/4_my_tickets_requester_B_isolation.png');

  // Switch back to Jennifer Anderson
  await page.selectOption('.dev-switcher-select', { label: 'Jennifer Anderson (jennifer.anderson@example.com) ' });
  await page.waitForTimeout(1000);

  // --- PART 8.1: Ticket Detail View Mode ---
  const firstTicket = page.locator('.desktop-table-view tbody tr').first();
  await firstTicket.click();
  await page.waitForTimeout(1000);
  await saveBoth(page, 'Part_8_Ticket_Detail/1_ticket_detail_read_only.png');
  await saveBoth(page, 'ticket-detail/desktop.png');

  // --- PART 8.2: Soft Delete Modal (Trigger modal) ---
  const deleteBtn = page.locator('button:has-text("Delete")').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(500);
    await saveBoth(page, 'Part_8_Ticket_Detail/2_soft_delete_modal_mandatory_reason.png');
    // Cancel modal
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(300);
  }

  // -------------------------------------------------------------
  // 2. Tablet Session (820x900)
  // -------------------------------------------------------------
  const tabletContext = await browser.newContext({
    viewport: { width: 820, height: 900 },
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await tabletPage.waitForTimeout(800);

  // Tablet My Tickets
  await saveBoth(tabletPage, 'Part_9_Responsive_Evidence/2_tablet_responsive_820px.png');
  await saveBoth(tabletPage, 'my-tickets/tablet.png');

  // Tablet Create Ticket
  await tabletPage.click('button:has-text("Create Ticket")');
  await tabletPage.waitForTimeout(800);
  await saveBoth(tabletPage, 'create-ticket/tablet.png');

  // Tablet Ticket Detail
  await tabletPage.click('button:has-text("My Tickets")');
  await tabletPage.waitForTimeout(800);
  await tabletPage.locator('.desktop-table-view tbody tr').first().click();
  await tabletPage.waitForTimeout(800);
  await saveBoth(tabletPage, 'ticket-detail/tablet.png');

  // -------------------------------------------------------------
  // 3. Mobile Session (390x844)
  // -------------------------------------------------------------
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);

  // Mobile My Tickets (Mobile Cards)
  await saveBoth(mobilePage, 'Part_9_Responsive_Evidence/3_mobile_responsive_390px.png');
  await saveBoth(mobilePage, 'my-tickets/mobile.png');

  // Mobile Create Ticket (1-column stacked form)
  await mobilePage.click('button:has-text("Create Ticket")');
  await mobilePage.waitForTimeout(800);
  await saveBoth(mobilePage, 'create-ticket/mobile.png');

  // Mobile Ticket Detail
  await mobilePage.click('button:has-text("My Tickets")');
  await mobilePage.waitForTimeout(800);
  await mobilePage.locator('.ticket-card-item').first().click();
  await mobilePage.waitForTimeout(800);
  await saveBoth(mobilePage, 'ticket-detail/mobile.png');

  await browser.close();
  console.log('All screenshots captured and saved successfully!');
}

run().catch((err) => {
  console.error('Capture script error:', err);
  process.exit(1);
});
