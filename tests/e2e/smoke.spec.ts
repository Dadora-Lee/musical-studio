/**
 * E2E smoke test — Next.js dev server 정상 동작 검증.
 * 더 자세한 시나리오는 PR 단위로 추가.
 */
import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows hero + login link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Musical Studio/i })).toBeVisible();
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible();
  });

  test('health check API returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.name).toBe('musical-studio');
  });
});
