import { test, expect } from '@playwright/test';

test.describe('Sprint 3 Authentication & Session Flow', () => {
  test('E2E-01: Valid login displays authenticated user shell and role', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // ตรวจสอบว่าเข้าระบบสำเร็จและเห็นชื่อ/บทบาทใน Navigation shell
    await expect(page.locator('header')).toContainText('John Smith');
    await expect(page.locator('header')).toContainText(/ADMINISTRATOR/i);
  });

  test('E2E-02: Mandatory first-login password change redirects and unlocks application', async ({ page }) => {
    // บัญชี emily.davis ถูก seed ไว้พร้อม flag mustChangePassword: true
    await page.goto('/login');

    await page.fill('input[type="email"]', 'emily.davis@tiktockit.com');
    await page.fill('input[type="password"]', 'InitialPassword123!');
    await page.click('button[type="submit"]');

    // ต้องถูกพาไปหน้า /change-password ทันที
    await expect(page).toHaveURL(/.*change-password/);
    await expect(page.locator('h1, h2')).toContainText(/password/i);

    // กรอกรหัสผ่านใหม่
    const currentPassInput = page.locator('input[name="currentPassword"]');
    if (await currentPassInput.isVisible()) {
      await currentPassInput.fill('InitialPassword123!');
    }
    await page.fill('input[name="newPassword"]', 'NewEmilySecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'NewEmilySecurePass123!');
    await page.click('button[type="submit"]');

    // หลังเปลี่ยนผ่าน ต้องสามารถเข้าใช้งานระบบหลักได้
    await expect(page).not.toHaveURL(/.*change-password/, { timeout: 10000 });
    await expect(page.locator('header')).toContainText('Emily Davis');
  });

  test('E2E-03: Safe failure on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong.user@tiktockit.com');
    await page.fill('input[type="password"]', 'InvalidPassword!');
    await page.click('button[type="submit"]');

    // ต้องแสดงข้อความแจ้งเตือนที่ปลอดภัย
    await expect(page.locator('body')).toContainText(/invalid email or password/i);
  });
});
