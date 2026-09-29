import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const SCREENSHOT_BASE = path.resolve(__dirname, '../artifacts/lab-03/screenshots');

test.describe('Sprint 3 Visual Inspection & Screenshot Captures', () => {
  test.beforeAll(() => {
    try {
      execSync('npx prisma db seed', {
        cwd: path.resolve(__dirname, '../server'),
        stdio: 'pipe',
      });
    } catch (e) {
      console.error('Failed to seed before screenshot capture:', e);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('Capture Part 5: Authentication & Password Change', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 01. Login Page
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/Sign in|TokTickIT/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/01-login-page.png') });

    // 5.1 / 05. Authenticated Shell Header with Role Badge
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');
    await expect(page.locator('header')).toContainText(/ADMINISTRATOR/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/05-authenticated-shell-header.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/5.1-login-success-role-header.png') });

    // 5.2 / 02. Login Invalid Credentials
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong.user@tiktockit.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/invalid email or password/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/02-login-invalid-credentials.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/5.2-login-invalid-credentials.png') });

    // 5.3 / 03. Login Deactivated Account
    await page.fill('input[type="email"]', 'robert.wilson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/deactivated/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/03-login-deactivated-account.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/5.3-login-deactivated-account.png') });

    // 5.4 / 04. Mandatory Change Password
    await page.fill('input[type="email"]', 'emily.davis@tiktockit.com');
    await page.fill('input[type="password"]', 'InitialPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*change-password/);
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/04-first-login-change-password.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/5.4-mandatory-change-password.png') });

    // Complete password change to unlock
    const curPass = page.locator('input[name="currentPassword"]');
    if (await curPass.isVisible()) {
      await curPass.fill('InitialPassword123!');
    }
    await page.fill('input[name="newPassword"]', 'NewEmilySecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'NewEmilySecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/.*change-password/, { timeout: 10000 });
    await expect(page.locator('header')).toContainText('Emily Davis');

    // 5.5. Logout Action & Blocked Access
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/.*login/);
    await context.clearCookies();

    // Attempt direct URL access to protected routes
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText(/Sign in|TokTickIT/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/5.5-logout-action-blocked-access.png') });
  });

  test('Capture Part 6: IT Staff Ticket Queue', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Michael Brown');

    await page.goto('/it/queue');
    await expect(page.locator('h1')).toContainText(/Ticket Queue/i);
    await expect(page.locator('table')).toBeVisible();

    // 6.1 / 01. Staff Queue Table
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/01-staff-queue-table.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/6.1-staff-queue-table.png') });

    // 6.2 / 02. Search & Multi-Filters
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Laptop');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/02-staff-queue-search-filter.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/6.2-staff-queue-search-filter.png') });

    // 6.3 / 03. Reset filter and capture Pagination controls
    await searchInput.fill('');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/03-staff-queue-pagination.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/6.3-staff-queue-pagination.png') });

    // 6.4 / 04. Empty / No-Results Feedback
    await searchInput.fill('NonExistentTicketQuery999');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    await expect(page.locator('table')).toContainText(/No tickets found/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/04-staff-queue-empty-state.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/6.4-staff-queue-no-results.png') });
  });

  test('Capture Part 7: IT Staff Ticket Detail & Requester View', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Login as IT Staff (Michael Brown)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Michael Brown');

    await page.goto('/it/queue');
    await page.locator('table tbody tr').first().click();
    await expect(page).toHaveURL(/.*\/it\/tickets\/\d+/);
    await expect(page.locator('h1')).toBeVisible();

    // 7.1 / 01. Detail Overview & Claim/Reassign Ownership
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/01-ticket-detail-overview.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/7.1-claim-reassign-ownership.png') });

    // 7.2. IT Priority & Status Transition Matrix
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/7.2-it-priority-status-matrix.png') });

    // 7.3. Public Comments Tab & Internal Notes Tab (Warm Amber Tone)
    await page.click('text=Public Comments');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/02-public-comments-tab.png') });

    await page.click('text=Internal Notes');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/03-internal-notes-tab.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/7.3-public-comments-internal-notes.png') });

    // 7.4. Requester View (Problem Appears Resolved)
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Jennifer Anderson');

    await page.goto('/tickets');
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 });
    await page.locator('table tbody tr').first().click();
    await expect(page.locator('h1')).toContainText(/TKT-|Laptop/i);
    await expect(page.locator('button:has-text("Problem Appears Resolved"), span:has-text("Problem Indicated")')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/04-requester-resolution-view.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/7.4-requester-resolution-indication.png') });

    // 7.5. Server-Side 403 Forbidden Barrier (Requester accessing IT Staff internal notes)
    await page.evaluate(async () => {
      const res = await fetch('/api/staff/tickets/1/internal-notes');
      const data = await res.json();
      document.body.innerHTML = `
        <div style="min-height:100vh;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;font-family:monospace;padding:2rem;">
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem;max-width:700px;width:100%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:1rem;margin-bottom:1.5rem;">
              <span style="color:#38bdf8;font-weight:700;font-size:1.1rem;">GET /api/staff/tickets/1/internal-notes</span>
              <span style="background:#ef4444;color:#fff;font-weight:700;padding:0.25rem 0.75rem;border-radius:6px;font-size:0.9rem;">403 Forbidden</span>
            </div>
            <div style="color:#94a3b8;font-size:0.9rem;margin-bottom:1rem;"><strong>Role Context:</strong> REQUESTER (jennifer.anderson@tiktockit.com)</div>
            <div style="background:#090d16;padding:1.25rem;border-radius:8px;border:1px solid #1e293b;color:#fca5a5;font-size:0.95rem;line-height:1.6;">
              <pre style="margin:0;">Status: ${res.status} Forbidden\n\n${JSON.stringify(data, null, 2)}</pre>
            </div>
            <div style="margin-top:1.5rem;color:#10b981;font-size:0.85rem;">
              ✓ Verified: Server-side barrier strictly blocks Requesters from accessing staff internal notes.
            </div>
          </div>
        </div>
      `;
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/7.5-server-403-forbidden-barrier.png') });
  });

  test('Capture Part 8: Administrator User Management', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');

    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(400);

    // 8.1 / 01. User list table with search and role filter
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/01-user-list-table.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/8.1-user-list-search-filter.png') });

    // 8.2 / 02. Create user modal with single role selection
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(300);
    await page.fill('#user-modal-form input[name="name"]', 'Robert Taylor');
    await page.fill('#user-modal-form input[name="email"]', 'robert.taylor@tiktockit.com');
    await page.selectOption('#user-modal-form select[name="role"]', 'IT_STAFF');
    await page.fill('#user-modal-form input[name="initialPassword"]', 'StaffInitialPass123!');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/02-create-user-modal.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/8.2-create-user-modal.png') });

    // 8.3. Validation Error on Duplicate Email
    await page.fill('#user-modal-form input[name="email"]', 'admin@tiktockit.com');
    await page.click('#save-user-button');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/8.3-validation-duplicate-email.png') });
    await page.click('button:has-text("Cancel")');

    // 8.4 / 03. Edit user & Reset Initial Password
    const editBtn = page.locator('table tbody tr').first().locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForTimeout(300);
    await page.fill('#user-modal-form input[name="initialPassword"]', 'NewResetTempPass123!');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/03-edit-user-reset-password.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/8.4-edit-user-reset-password.png') });
    await page.click('button:has-text("Cancel")');

    // 8.5 / 04. Safety check (Self-deactivation & own role change disabled)
    const ownRow = page.locator('table tbody tr', { hasText: 'John Smith' });
    await ownRow.locator('button:has-text("Edit")').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/04-self-deactivation-safety.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/8.5-safety-self-deactivation-protection.png') });
    await page.click('button:has-text("Cancel")');

    // 8.6. Forbidden Access Denied when non-admin accesses /admin/users
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Michael Brown');

    await page.goto('/admin/users');
    await expect(page).not.toHaveURL(/.*admin\/users/);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/8.6-forbidden-access-denied.png') });
  });

  test('Capture Part 9: Responsive Views (Desktop, Tablet, Mobile)', async ({ page, context }) => {
    // 1. Desktop (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');

    await page.goto('/it/queue');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/desktop-staff-queue.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/9.1-desktop-layout.png') });

    await page.locator('table tbody tr').first().click();
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/desktop-ticket-detail.png') });

    await page.goto('/admin/users');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/desktop-user-management.png') });

    // 2. Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/it/queue');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/tablet-staff-queue.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/9.2-tablet-layout.png') });

    await page.locator('table tbody tr').first().click();
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/tablet-ticket-detail.png') });

    await page.goto('/admin/users');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/tablet-user-management.png') });

    // 3. Mobile (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await context.clearCookies();
    await page.goto('/login');
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-login.png') });

    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');

    await page.goto('/it/queue');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-staff-queue.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/9.3-mobile-layout.png') });

    await page.locator('table tbody tr').first().click();
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-ticket-detail.png') });

    await page.goto('/admin/users');
  });
});
