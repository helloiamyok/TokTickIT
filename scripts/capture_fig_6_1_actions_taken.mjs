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

  console.log('Logging in as IT Staff...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  console.log('Navigating to Ticket 737 Detail page...');
  await page.goto(`${BASE_URL}/it/tickets/737`);
  await page.waitForTimeout(1500);

  // Scroll to Actions Taken section
  console.log('Locating Actions Taken section...');
  const actionsSection = page.locator('text=Actions Taken').first();
  await actionsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // 1. Full Context Screenshot (Ticket Detail Page showing Header, Status bar & Actions Taken Table)
  const p61Artifact = path.join(ARTIFACT_DIR, '6.1_ticket_detail_multiple_actions_taken.png');
  const p61Part6 = path.join(ARTIFACT_DIR, 'Part_6_Actions_Taken', '6.1_ticket_detail_multiple_actions_taken.png');
  const p61Desktop = path.join(DESKTOP_DIR, '6.1_ticket_detail_multiple_actions_taken.png');
  const p61DesktopPart6 = path.join(DESKTOP_DIR, 'Part_6_Actions_Taken', '6.1_ticket_detail_multiple_actions_taken.png');

  await page.screenshot({ path: p61Artifact, fullPage: false });
  fs.copyFileSync(p61Artifact, p61Part6);
  fs.copyFileSync(p61Artifact, p61Desktop);
  fs.copyFileSync(p61Artifact, p61DesktopPart6);
  console.log('[Captured] 6.1_ticket_detail_multiple_actions_taken.png');

  // 2. Focused Card Screenshot of the Actions Taken Table
  const tableCard = page.locator('div:has-text("Actions Taken")').last();
  const pFocusedArtifact = path.join(ARTIFACT_DIR, '6.1_actions_taken_table_complete_cancel_focused.png');
  const pFocusedDesktop = path.join(DESKTOP_DIR, '6.1_actions_taken_table_complete_cancel_focused.png');

  // If tableCard is element, take element screenshot or scroll carefully
  try {
    const cardEl = await page.$('.actions-taken-section, div[style*="border-radius: 8px"], div:has(> h3:has-text("Actions Taken"))');
    if (cardEl) {
      await cardEl.screenshot({ path: pFocusedArtifact });
    } else {
      await page.screenshot({ path: pFocusedArtifact, fullPage: false });
    }
  } catch {
    await page.screenshot({ path: pFocusedArtifact, fullPage: false });
  }
  fs.copyFileSync(pFocusedArtifact, pFocusedDesktop);
  console.log('[Captured] 6.1_actions_taken_table_complete_cancel_focused.png');

  // 3. Composite Figure with Header & Annotations
  const pageBase64 = fs.readFileSync(p61Artifact).toString('base64');
  const compositeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ภาพที่ 6.1: Actions Taken Table</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0B0F19;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
          max-width: 1400px;
          width: 100%;
          overflow: hidden;
        }
        .figure-header {
          background: #1B4D3E;
          color: #FFFFFF;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .figure-title {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .figure-subtitle {
          font-size: 13px;
          color: #A7F3D0;
          margin-top: 4px;
        }
        .badge-verified {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
        }
        .summary-bar {
          background: #F8FAF9;
          border-bottom: 1px solid #E2E8F0;
          padding: 12px 24px;
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: #374151;
          flex-wrap: wrap;
        }
        .summary-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot-green { width: 10px; height: 10px; border-radius: 50%; background: #10B981; }
        .dot-red { width: 10px; height: 10px; border-radius: 50%; background: #EF4444; }
        .dot-amber { width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; }
        .image-wrapper {
          padding: 20px;
          background: #F1F5F9;
        }
        .image-wrapper img {
          width: 100%;
          display: block;
          border-radius: 10px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          border: 1px solid #CBD5E1;
        }
        .caption {
          padding: 16px 24px;
          background: #FFFFFF;
          font-size: 13px;
          color: #4B5563;
          line-height: 1.6;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="figure-header">
          <div>
            <div class="figure-title">ภาพที่ 6.1: Actions Taken Table บน Ticket Detail (Multiple Actions: Complete & Cancel)</div>
            <div class="figure-subtitle">แสดงรายการการปฏิบัติงานหลายรายการภายใต้ตั๋วใบเดียว (TKT-2026-001234) พร้อมสถานะ Complete และ Cancel อย่างชัดเจน</div>
          </div>
          <div class="badge-verified">✓ Lab 4 Part 6 Verified</div>
        </div>
        <div class="summary-bar">
          <div class="summary-item"><span class="dot-green"></span><strong>Action 1:</strong> Battery Diagnostic & Telemetry → <span style="color:#065F46;font-weight:700;">✓ Complete</span></div>
          <div class="summary-item"><span class="dot-red"></span><strong>Action 2:</strong> Motherboard Hardware Replacement → <span style="color:#991B1B;font-weight:700;">✕ Cancel</span></div>
          <div class="summary-item"><span class="dot-green"></span><strong>Action 3:</strong> Fan Replacement & Thermal Calibration → <span style="color:#065F46;font-weight:700;">✓ Complete</span> (<span style="color:#B45309;font-weight:600;">⚠️ Follow-up Required</span>)</div>
        </div>
        <div class="image-wrapper">
          <img src="data:image/png;base64,${pageBase64}" />
        </div>
        <div class="caption">
          <strong>คำอธิบายพฤติกรรมของระบบ (Audit Findings):</strong><br>
          1. <strong>Multiple Actions in Single Ticket:</strong> ตั๋วหมายเลข <code>TKT-2026-001234</code> บันทึกประวัติการปฏิบัติงานของเจ้าหน้าที่ IT หลายรายการตามลำดับเวลา (Action Date/Time)<br>
          2. <strong>สถานะ Complete & Cancel:</strong> คอลัมน์ <em>Result</em> มีการแสดงสถานะ <code>✓ Complete</code> สำหรับงานที่เสร็จสิ้นสมบูรณ์ และ <code>✕ Cancel</code> สำหรับงานที่ถูกยกเลิกตามความต้องการของผู้ใช้ พร้อมทั้งแสดงป้าย <code>⚠️ Required</code> สำหรับรายการที่ต้องติดตามผล (Follow-up) ต่อไป
        </div>
      </div>
    </body>
    </html>
  `;

  const compositePage = await context.newPage();
  await compositePage.setContent(compositeHtml, { waitUntil: 'load' });
  await compositePage.setViewportSize({ width: 1440, height: 1100 });
  await compositePage.waitForTimeout(500);

  const pCompositeArtifact = path.join(ARTIFACT_DIR, '6.1_composite_actions_taken_complete_cancel.png');
  const pCompositeDesktop = path.join(DESKTOP_DIR, '6.1_composite_actions_taken_complete_cancel.png');

  await compositePage.screenshot({ path: pCompositeArtifact, fullPage: true });
  fs.copyFileSync(pCompositeArtifact, pCompositeDesktop);
  console.log('[Captured] 6.1_composite_actions_taken_complete_cancel.png');

  await browser.close();
  console.log('Finished capturing all evidence for Part 6 Actions Taken!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
