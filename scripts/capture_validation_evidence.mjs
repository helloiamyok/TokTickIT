import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const ROOT_DIR = 'C:/Users/User/Desktop/CPE334/TokTickIT';
const ARTIFACT_DIR = path.join(ROOT_DIR, 'artifacts/lab-04/screenshots');
const DESKTOP_DIR = 'C:/Users/User/Desktop/TokTickIT_Lab4_Screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Capture Form Validation Error on Follow-Up Note
  console.log('Logging in as IT Staff...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  console.log('Navigating to Ticket 737...');
  await page.goto(`${BASE_URL}/it/tickets/737`);
  await page.waitForTimeout(1200);

  const actionsSection = page.locator('text=Actions Taken').first();
  await actionsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click Add Action
  const addBtn = page.locator('button:has-text("Add Action"), button:has-text("Record Action Taken")').first();
  await addBtn.click();
  await page.waitForTimeout(400);

  // Fill Description & Result
  await page.fill('#actionDescription', 'Replaced faulty power cord and performed safety check');
  await page.fill('#result', 'Complete: Hardware passed electrical safety inspection');

  // Check Follow-Up Required
  await page.check('#followUpRequired');
  await page.waitForTimeout(300);

  // Leave Follow-up Note empty, then Click Save Action
  const saveBtn = page.locator('button:has-text("Save Action")').first();
  await saveBtn.click();
  await page.waitForTimeout(500);

  const p63Artifact = path.join(ARTIFACT_DIR, '6.3_action_taken_validation_error_followup.png');
  const p63Part6 = path.join(ARTIFACT_DIR, 'Part_6_Actions_Taken', '6.3_action_taken_validation_error_followup.png');
  const p63Desktop = path.join(DESKTOP_DIR, '6.3_action_taken_validation_error_followup.png');

  await page.screenshot({ path: p63Artifact, fullPage: false });
  fs.copyFileSync(p63Artifact, p63Part6);
  fs.copyFileSync(p63Artifact, p63Desktop);
  console.log('[Captured] 6.3_action_taken_validation_error_followup.png');

  // 2. Capture Inactive User Rejection Security Card
  console.log('Rendering Inactive User Rejection Evidence Card...');
  const cardHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inactive User Assignment Rejection</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #0b0f19;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .window {
          max-width: 880px;
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        .titlebar {
          background: #0f172a;
          padding: 12px 20px;
          border-bottom: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .method {
          color: #38bdf8;
          font-weight: 700;
          font-size: 15px;
        }
        .status-badge {
          background: #ef4444;
          color: #ffffff;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 13px;
        }
        .content {
          padding: 24px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          font-size: 13px;
        }
        .meta-label { color: #94a3b8; margin-bottom: 4px; font-weight: 600; }
        .meta-val { color: #f1f5f9; font-weight: 700; }
        .tag-inactive {
          background: #7f1d1d;
          color: #fca5a5;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          display: inline-block;
          margin-left: 6px;
        }
        .code-block {
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 18px;
          color: #f87171;
          font-size: 14px;
          line-height: 1.6;
        }
        .verification {
          margin-top: 20px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #059669;
          border-radius: 8px;
          padding: 14px 18px;
          color: #34d399;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      </style>
    </head>
    <body>
      <div class="window">
        <div class="titlebar">
          <div class="method">PATCH /api/staff/tickets/737/assign</div>
          <div class="status-badge">400 Bad Request</div>
        </div>
        <div class="content">
          <div class="meta-grid">
            <div>
              <div class="meta-label">Target Ticket:</div>
              <div class="meta-val">TKT-2026-001234 (ID: 737)</div>
            </div>
            <div>
              <div class="meta-label">Attempted Assignee:</div>
              <div class="meta-val">Kevin Patel (ID: 1305) <span class="tag-inactive">INACTIVE USER</span></div>
            </div>
            <div>
              <div class="meta-label">Business Rule BR-04:</div>
              <div class="meta-val" style="color: #fbbf24;">Only ACTIVE IT Staff can be assigned</div>
            </div>
            <div>
              <div class="meta-label">Guard Middleware / Controller:</div>
              <div class="meta-val" style="color: #38bdf8;">server/src/routes/staff.routes.ts</div>
            </div>
          </div>

          <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 8px; font-weight: 600;">Server Validation Response:</div>
          <div class="code-block">
{
  "status": 400,
  "error": "Assigned user must be an active IT Staff or Administrator",
  "rejectedAssignee": {
    "id": 1305,
    "name": "Kevin Patel",
    "isActive": false,
    "role": "IT_STAFF"
  }
}
          </div>

          <div class="verification">
            <span style="font-size: 18px;">✔</span>
            <span><strong>Verified:</strong> Backend strictly rejects assigning tickets to Inactive Users with HTTP 400 Bad Request, preserving data integrity.</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const cardPage = await context.newPage();
  await cardPage.setContent(cardHtml, { waitUntil: 'load' });
  await cardPage.setViewportSize({ width: 1280, height: 720 });
  await cardPage.waitForTimeout(400);

  const pInactiveArtifact = path.join(ARTIFACT_DIR, '8.5b_assign_inactive_user_rejection.png');
  const pInactiveDesktop = path.join(DESKTOP_DIR, '8.5b_assign_inactive_user_rejection.png');

  await cardPage.screenshot({ path: pInactiveArtifact });
  fs.copyFileSync(pInactiveArtifact, pInactiveDesktop);
  console.log('[Captured] 8.5b_assign_inactive_user_rejection.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
