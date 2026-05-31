import { expect, test } from '@playwright/test';

test.describe('Practice Studio piano playback', () => {
  test('renders MusicXML and exposes piano playback transport', async ({ page }) => {
    const consoleIssues: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleIssues.push(message.text());
    });

    await page.goto('/work');
    await expect(page.getByRole('button', { name: '피아노 연주' })).toBeVisible();
    await expect(page.locator('.osmd-canvas svg').first()).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: '피아노 연주' }).click();
    const pianoSlider = page.getByRole('slider', { name: '피아노 연주 위치' });

    await expect(pianoSlider).toBeEnabled();
    await expect(pianoSlider).not.toHaveAttribute('max', '0');
    await page.getByLabel('재생').click();
    await page.waitForTimeout(500);

    expect(consoleIssues.filter((message) => message.includes('play() request was interrupted'))).toEqual([]);
  });
});
