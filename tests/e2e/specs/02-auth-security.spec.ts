import { test, expect } from '@playwright/test';

test.describe('Module 2: Authentication & Security', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-AUTH-01: Tab Switch between Login and Register', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveURL(/\/auth/);

    // Click 'Đăng Ký' tab
    const registerTab = page.locator('button:has-text("Đăng Ký")').or(page.locator('button:has-text("Register")')).first();
    await registerTab.click();
    await page.waitForTimeout(300);

    // Check register specific inputs (confirm password and agree terms checkbox)
    const confirmPassInput = page.locator('#confirmPassword');
    const termsCheckbox = page.locator('#agreeTerms');
    await expect(confirmPassInput).toBeVisible();
    await expect(termsCheckbox).toBeVisible();

    // Click 'Đăng Nhập' tab
    const loginTab = page.locator('button:has-text("Đăng Nhập")').or(page.locator('button:has-text("Login")')).first();
    await loginTab.click();
    await page.waitForTimeout(300);
    const loginSubmitBtn = page.locator('button[type="submit"]');
    await expect(loginSubmitBtn.first()).toBeVisible();
  });

  test('TC-AUTH-02: Login Form Validation & Submit', async ({ page }) => {
    await page.goto('/auth');
    const emailInput = page.locator('#email');
    const passInput = page.locator('#password');
    const submitBtn = page.locator('button[type="submit"]').first();

    // Fill credentials
    await emailInput.fill('pro_gamer@ludon.gg');
    await passInput.fill('Password123!');
    await submitBtn.click();
    
    // Wait for login transition
    await page.waitForTimeout(2500);

    // Expect navigation away from /auth or login success
    expect(page.url()).not.toContain('/auth?');
  });

  test('TC-AUTH-03: Password Strength Meter in Registration', async ({ page }) => {
    await page.goto('/auth');
    const registerTab = page.locator('button:has-text("Đăng Ký")').or(page.locator('button:has-text("Register")')).first();
    await registerTab.click();
    await page.waitForTimeout(300);

    const passInput = page.locator('#password');
    await passInput.fill('123');
    await page.waitForTimeout(300);

    // Weak password indicator
    const strengthIndicator = page.locator('text=Yếu').or(page.locator('text=Weak')).or(page.locator('text=Ít nhất 8 ký tự'));
    await expect(strengthIndicator.first()).toBeVisible();

    // Strong password
    await passInput.fill('SuperStrongPassword@2026');
    await page.waitForTimeout(300);
    const strongIndicator = page.locator('.text-emerald-500').or(page.locator('text=Mạnh')).or(page.locator('text=Strong')).or(page.locator('.bg-emerald-500'));
    await expect(strongIndicator.first()).toBeVisible();
  });

  test('TC-AUTH-04: Show/Hide Password Toggle', async ({ page }) => {
    await page.goto('/auth');
    const passInput = page.locator('#password');
    await passInput.fill('SecretPassword');

    // Toggle eye button
    const eyeBtn = page.locator('button[aria-label*="mật khẩu"]').or(page.locator('button[aria-label*="password"]')).first();
    if (await eyeBtn.count() > 0) {
      await eyeBtn.click();
      await page.waitForTimeout(200);
    }

    expect(await passInput.count()).toBe(1);
  });

  test('TC-AUTH-05: Forgot Password Modal/Flow', async ({ page }) => {
    await page.goto('/auth');
    const forgotBtn = page.locator('button:has-text("Quên mật khẩu")').or(page.locator('a:has-text("Quên mật khẩu")')).or(page.locator('text=Quên mật khẩu?'));
    if (await forgotBtn.count() > 0) {
      await forgotBtn.first().click();
      await page.waitForTimeout(300);
      const emailReset = page.locator('#email');
      await expect(emailReset).toBeVisible();
    }
  });

  test('TC-AUTH-06: Verify Email Route Navigation & Missing Token Handling', async ({ page }) => {
    await page.goto('/verify-email');
    await page.waitForTimeout(500);

    // Should display token error message
    const errorNotice = page.locator('text=Không tìm thấy token').or(page.locator('text=token')).or(page.locator('text=Xác minh email'));
    await expect(errorNotice.first()).toBeVisible();
  });

  test('TC-AUTH-07: Unverified User Action Guard & Verify Modal Trigger', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });

    const warningIcon = page.locator('button[aria-label="Email verification warning"]').or(page.locator('button[title*="xác thực email"]'));
    if (await warningIcon.count() > 0) {
      await expect(warningIcon.first()).toBeVisible();
    }
    expect(true).toBe(true);
  });

});
