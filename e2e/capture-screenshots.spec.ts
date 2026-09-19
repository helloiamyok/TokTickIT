import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_BASE = path.resolve(__dirname, '../artifacts/lab-03/screenshots');

test.describe('Sprint 3 Visual Inspection & Screenshot Captures', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('Capture Part 5: Authentication & Password Change', async ({ page, context }) => {
    // 01. Login Page
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/Sign in|TokTickIT/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/01-login-page.png') });

    // 02. Login Invalid Credentials
    await page.fill('input[type="email"]', 'wrong.user@tiktockit.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/invalid email or password/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/02-login-invalid-credentials.png') });

    // 03. Login Deactivated Account
    await page.fill('input[type="email"]', 'robert.wilson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('body')).toContainText(/deactivated/i);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/03-login-deactivated-account.png') });

    // 04. Mandatory Change Password
    await page.fill('input[type="email"]', 'emily.davis@tiktockit.com');
    await page.fill('input[type="password"]', 'InitialPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*change-password/);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/04-first-login-change-password.png') });

    // Complete password change to unlock
    const currentInput = page.locator('input[name="currentPassword"]');
    if (await currentInput.isVisible()) {
      await currentInput.fill('InitialPassword123!');
    }
    await page.fill('input[name="newPassword"]', 'NewEmilySecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'NewEmilySecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Emily Davis');

    // 05. Authenticated Shell Header (with Administrator)
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'authentication/05-authenticated-shell-header.png') });
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

    // 01. Staff Queue Table
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/01-staff-queue-table.png') });

    // 02. Search & Filters
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Laptop');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/02-staff-queue-search-filter.png') });

    // 03. Reset filter and capture pagination
    await searchInput.fill('');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-queue/03-staff-queue-pagination.png') });
  });

  test('Capture Part 7: IT Staff Ticket Detail & Requester View', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Login as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Michael Brown');

    await page.goto('/it/queue');
    await page.locator('table tbody tr').first().click();
    await expect(page).toHaveURL(/.*\/it\/tickets\/\d+/);

    // 01. Detail Overview
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/01-ticket-detail-overview.png') });

    // 02. Public Comments Tab
    await page.click('text=Public Comments');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/02-public-comments-tab.png') });

    // 03. Internal Notes Tab (Warm Amber Tone)
    await page.click('text=Internal Notes');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/03-internal-notes-tab.png') });

    // 04. Requester View (Problem Appears Resolved)
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Jennifer Anderson');

    await page.goto('/tickets');
    const firstTicket = page.locator('table tbody tr td a, table tbody tr td button').first();
    if (await firstTicket.isVisible()) {
      await firstTicket.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'staff-ticket-detail/04-requester-resolution-view.png') });
  });

  test('Capture Part 8: Administrator User Management', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');

    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');

    // 01. User list table
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/01-user-list-table.png') });

    // 02. Create user modal
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/02-create-user-modal.png') });
    await page.click('button:has-text("Cancel")');

    // 03. Edit user & Reset Password
    const editBtn = page.locator('table tbody tr').first().locator('button:has-text("Edit")');
    await editBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/03-edit-user-reset-password.png') });
    await page.click('button:has-text("Cancel")');

    // 04. Safety check (Self-deactivation disabled)
    const ownRow = page.locator('table tbody tr', { hasText: 'John Smith' });
    await ownRow.locator('button:has-text("Edit")').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'user-management/04-self-deactivation-safety.png') });
    await page.click('button:has-text("Cancel")');
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

    await page.locator('table tbody tr').first().click();
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/desktop-ticket-detail.png') });

    await page.goto('/admin/users');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/desktop-user-management.png') });

    // 2. Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/it/queue');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/tablet-staff-queue.png') });

    await page.locator('table tbody tr').first().click();
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/tablet-ticket-detail.png') });

    await page.goto('/admin/users');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/tablet-user-management.png') });

    // 3. Mobile (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await context.clearCookies();
    await page.goto('/login');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-login.png') });

    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('John Smith');

    await page.goto('/it/queue');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-staff-queue.png') });

    await page.locator('table tbody tr').first().click();
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-ticket-detail.png') });

    await page.goto('/admin/users');
    await page.screenshot({ path: path.join(SCREENSHOT_BASE, 'responsive/mobile-user-management.png') });
  });
});
