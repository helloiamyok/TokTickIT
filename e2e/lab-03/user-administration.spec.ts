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

    // 1. เปิด Modal สร้างผู้ใช้ใหม่
    await page.click('button:has-text("Create User")');
    const randomSuffix = Math.floor(Math.random() * 10000);
    await page.fill('#user-modal-form input[name="name"]', `Test Staff ${randomSuffix}`);
    await page.fill('#user-modal-form input[name="email"]', `staff${randomSuffix}@tiktockit.com`);
    await page.selectOption('#user-modal-form select[name="role"]', 'IT_STAFF');
    await page.fill('#user-modal-form input[name="initialPassword"]', 'StaffTempPass123!');
    await page.click('#save-user-button');

    // ตรวจสอบว่ามีแถวผู้ใช้ใหม่เพิ่มขึ้นในตาราง
    await expect(page.locator('table')).toContainText(`Test Staff ${randomSuffix}`);

    // 2. ตรวจสอบ Safety Rule: ไม่สามารถปิดบัญชีหรือเปลี่ยนบทบาทตนเองได้
    const adminRow = page.locator('table tbody tr', { hasText: 'John Smith' });
    await adminRow.locator('button:has-text("Edit")').click();
    
    // ตรวจสอบว่า Checkbox Active Account ถูก Disable สำหรับบัญชีของตนเอง
    const activeCheckbox = page.locator('form input#isActive, form input[name="isActive"]');
    await expect(activeCheckbox).toBeDisabled();
    await page.click('button:has-text("Cancel")');
  });
});
