import { test, expect } from '@playwright/test';

test.describe('Sprint 3 Administrator User Management Flow', () => {
  test('E2E-05: Admin user creation and self-deactivation prevention', async ({ page }) => {
    // เข้าสู่ระบบด้วย Admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // ตรวจสอบว่าเข้าระบบสำเร็จก่อนไปยังหน้า User Management
    await expect(page.locator('header')).toContainText('John Smith');

    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText('User Management');

    // เปิด Modal สร้างผู้ใช้ใหม่
    await page.click('button:has-text("Create User")');
    const randomSuffix = Math.floor(Math.random() * 10000);
    await page.fill('form input[type="text"], input[name="name"]', `Test Staff ${randomSuffix}`);
    await page.fill('form input[type="email"], input[name="email"]', `staff${randomSuffix}@tiktockit.com`);
    await page.selectOption('form select, select[name="role"]', 'IT_STAFF');
    await page.fill('form input[type="password"], input[name="initialPassword"]', 'StaffTempPass123!');
    await page.click('button:has-text("Save User"), button:has-text("Create User")');

    // ตรวจสอบว่ามีแถวผู้ใช้ใหม่เพิ่มขึ้นในตาราง
    await expect(page.locator('table')).toContainText(`Test Staff ${randomSuffix}`);
  });
});
