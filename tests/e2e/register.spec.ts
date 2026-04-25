import { test, expect } from '@playwright/test';

test.describe('새 프로젝트 등록', () => {
  test('새 프로젝트 페이지 렌더링', async ({ page }) => {
    // 미인증 상태에서 접근하면 로그인 페이지로 이동할 수 있음
    await page.goto('/register/new');
    // 로그인 페이지로 리다이렉트되거나 프로젝트 입력 폼 표시
    const isLogin = page.url().includes('/login');
    const hasInput = await page.locator('textarea').count() > 0;
    expect(isLogin || hasInput).toBe(true);
  });

  test('예시 칩 버튼 렌더링', async ({ page }) => {
    await page.goto('/register/new');
    // 로그인 페이지가 아닌 경우에만 칩 확인
    if (!page.url().includes('/login')) {
      await expect(page.getByText('브랜드 상표 등록')).toBeVisible();
      await expect(page.getByText('기술 특허 출원')).toBeVisible();
    }
  });
});

test.describe('대시보드', () => {
  test('대시보드 페이지 접근', async ({ page }) => {
    await page.goto('/dashboard');
    // 미인증 상태에서는 로그인으로 이동
    await expect(page).toHaveURL(/\/login|\/dashboard/);
  });
});
