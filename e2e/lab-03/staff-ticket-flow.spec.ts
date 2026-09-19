import { test, expect } from '@playwright/test';

test.describe('Sprint 3 IT Staff Operational Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ล็อกอินในฐานะ IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('header')).toContainText('Michael Brown');
  });

  test('E2E-04: Filter queue, navigate to ticket detail, and add notes', async ({ page }) => {
    await page.goto('/it/queue');

    // ทดสอบ Search / Filter ในตาราง
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Laptop');
      await page.keyboard.press('Enter');
    }

    // คลิกเข้าไปดู Ticket Detail แถวแรก
    const firstTicketLink = page.locator('table tbody tr td a, table tbody tr td button, table tbody tr').first();
    await firstTicketLink.click();

    await expect(page).toHaveURL(/.*\/it\/tickets\/\d+/);

    // ตรวจสอบแท็บ Public Comments และ Internal Notes
    await expect(page.locator('text=Public Comments')).toBeVisible();
    await expect(page.locator('text=Internal Notes')).toBeVisible();

    // ทดสอบโพสต์ Internal Note
    await page.click('text=Internal Notes');
    await page.fill('textarea[placeholder*="internal"]', 'Verified automated test note.');
    await page.click('button:has-text("Add Internal Note"), button:has-text("Post Note"), button:has-text("Save Note")');

    await expect(page.locator('body')).toContainText('Verified automated test note.');
  });
});
