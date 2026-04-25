import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test('로그인 페이지 렌더링', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/IP-Assist/);
    await expect(page.getByRole('textbox', { name: /이메일/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /비밀번호/i })).toBeVisible();
  });

  test('빈 폼 제출 시 유효성 오류', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /로그인/i }).click();
    // 브라우저 기본 required 유효성 또는 커스텀 오류 메시지 확인
    const emailInput = page.getByRole('textbox', { name: /이메일/i });
    await expect(emailInput).toBeFocused();
  });

  test('미인증 상태에서 대시보드 접근 시 로그인으로 리다이렉트', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
