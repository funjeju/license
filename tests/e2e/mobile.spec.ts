import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('모바일 반응형', () => {
  test('로그인 페이지 모바일 레이아웃', async ({ page }) => {
    await page.goto('/login');
    // 모바일에서 페이지가 정상 렌더링됨
    await expect(page.locator('body')).toBeVisible();
    // 가로 스크롤 없음
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('새 프로젝트 페이지 모바일', async ({ page }) => {
    await page.goto('/register/new');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
