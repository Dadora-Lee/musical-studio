import { expect, test } from '@playwright/test';

test.describe('Practice Studio recording stabilization', () => {
  test('records with a selected source and saves a local take', async ({ page }) => {
    await page.addInitScript(() => {
      class FakeMediaRecorder {
        static isTypeSupported() {
          return true;
        }

        state = 'inactive';
        mimeType = 'audio/webm';
        ondataavailable: ((event: { data: Blob }) => void) | null = null;
        onstop: (() => void) | null = null;

        constructor(public stream: MediaStream) {}

        start() {
          this.state = 'recording';
        }

        pause() {
          this.state = 'paused';
        }

        resume() {
          this.state = 'recording';
        }

        requestData() {
          this.ondataavailable?.({ data: new Blob(['recording'], { type: 'audio/webm' }) });
        }

        stop() {
          this.state = 'inactive';
          this.ondataavailable?.({ data: new Blob(['recording'], { type: 'audio/webm' }) });
          this.onstop?.();
        }
      }

      Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: FakeMediaRecorder });
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }),
          enumerateDevices: async () => [
            { kind: 'audioinput', deviceId: 'mic-1', label: 'E2E Microphone' },
            { kind: 'audiooutput', deviceId: 'out-1', label: 'E2E Output' },
          ],
        },
      });
    });

    const consoleIssues: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleIssues.push(message.text());
    });

    await page.goto('/work');
    await expect(page.getByRole('button', { name: 'MR', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '녹음 시작' })).toBeEnabled();

    await page.getByRole('button', { name: '녹음 시작' }).click();
    await expect(page.getByText(/녹음 중입니다/)).toBeVisible();
    await expect(page.getByRole('button', { name: '녹음 시작' })).toBeDisabled();

    await page.getByRole('button', { name: '녹음 일시정지' }).click();
    await expect(page.getByText('녹음을 일시정지했습니다.')).toBeVisible();

    await page.getByRole('button', { name: '녹음 일시정지' }).click();
    await expect(page.getByText('녹음을 다시 진행합니다.')).toBeVisible();

    await page.getByRole('button', { name: '녹음 정지' }).click();
    await expect(page.getByText('WAV Take가 준비되었습니다. 저장하면 오른쪽 녹음 Take 목록에 추가됩니다.')).toBeVisible();

    await page.getByRole('button', { name: '녹음 저장' }).click();
    await expect(page.getByText('WAV Take를 목록에 추가했습니다. 제출은 local prototype 상태입니다.')).toBeVisible();
    await expect(page.getByRole('region', { name: '녹음 Take 목록' }).getByText(/take_\d+\.wav/).first()).toBeVisible();

    expect(consoleIssues.filter((message) => message.includes('play() request was interrupted'))).toEqual([]);
  });
});

