import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PracticeStudioLayout } from '@/components/practice/PracticeStudioLayout';
import { practiceStudioPrototype } from '@/lib/practice/prototype-data';

describe('PracticeStudioLayout', () => {
  it('shows submission status before the take list', () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    const status = screen.getByRole('region', { name: '제출 상태' });
    const takes = screen.getByRole('region', { name: '녹음 Take 목록' });

    expect(status.compareDocumentPosition(takes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(status).getByText('재제출 필요')).toBeInTheDocument();
    expect(within(takes).getByText('take_03.wav')).toBeInTheDocument();
  });

  it('shows score pagination and MR/AR/score playback sources', () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'MR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '악보재생' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'AR' }));

    expect(screen.getByText(/AR · SONG07_AR.mp3/)).toBeInTheDocument();
  });

  it('allows every member to select any number from the left list', async () => {
    const user = userEvent.setup();

    render(
      <PracticeStudioLayout
        data={practiceStudioPrototype}
        scoreSources={{
          'song07-lie': { url: '/api/prototype-assets/song07-lie/musicxml', label: 'SONG07_MUSIC_SHEET.musicxml.xml' },
          'song16-mirror': { url: '/api/prototype-assets/song16-mirror/musicxml', label: 'SONG16_MUSIC_SHEET.musicxml.xml' },
        }}
      />,
    );

    expect(screen.getByRole('button', { name: /SONG07_거짓말이아니야/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SONG16_거울/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SONG05_눈물이나/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /SONG16_거울/ }));

    expect(screen.getByRole('heading', { name: 'SONG16_거울' })).toBeInTheDocument();
    expect(screen.getByText(/MR · SONG16_MR.mp3/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /SONG05_눈물이나/ }));

    expect(screen.getByRole('heading', { name: 'SONG05_눈물이나' })).toBeInTheDocument();
    expect(screen.getByText('MusicXML 미등록')).toBeInTheDocument();
    expect(screen.getByText(/MR 파일 미등록/)).toBeInTheDocument();
  });

  it('uses NickName as the practice subject without filtering the number list', async () => {
    const user = userEvent.setup();

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    await user.selectOptions(screen.getByLabelText('Member NickName 선택'), '카일');

    expect(screen.getByText(/Recording lanes · 카일 · Role 히카루/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SONG07_거짓말이아니야/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SONG16_거울/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SONG05_눈물이나/ })).toBeInTheDocument();
  });

  it('shows recording tracks, device controls, and unsupported recording state', () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    expect(screen.getByText('MR Track')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
    expect(screen.getByLabelText('녹음 시작')).toBeInTheDocument();
    expect(screen.getByLabelText('녹음 저장')).toBeDisabled();
    expect(screen.getByLabelText('Microphone')).toBeInTheDocument();
    expect(screen.getByLabelText('Output')).toBeInTheDocument();
    expect(screen.getByText(/브라우저 녹음 기능을 확인 중입니다|이 브라우저에서는 녹음을 지원하지 않습니다/)).toBeInTheDocument();
  });

  it('shows unavailable reason when a number has no MR file', () => {
    const data = { ...practiceStudioPrototype, activeNumberId: 'song05-tears' };

    render(<PracticeStudioLayout data={data} score={<div>Score preview</div>} />);

    expect(screen.getByText(/MR 파일 미등록/)).toBeInTheDocument();
    expect(screen.getByText(/선택한 오디오 파일이 아직 연결되지 않았습니다/)).toBeInTheDocument();
    expect(screen.getByLabelText('재생')).toBeDisabled();
  });

  it('lets members seek the selected MR or AR track directly', () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    const mrSeek = screen.getByRole('slider', { name: 'MR Track 위치' });
    expect(mrSeek).toBeEnabled();
    expect(mrSeek).toHaveAttribute('max', '198');

    fireEvent.change(mrSeek, { target: { value: '42' } });
    expect(screen.getByText('00:42 / 03:18')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'AR' }));

    const arSeek = screen.getByRole('slider', { name: 'AR Track 위치' });
    expect(arSeek).toBeEnabled();
    fireEvent.change(arSeek, { target: { value: '66' } });
    expect(screen.getByText('01:06 / 03:18')).toBeInTheDocument();
  });

  it('disables track seeking when the selected audio file is missing', () => {
    const data = { ...practiceStudioPrototype, activeNumberId: 'song05-tears' };

    render(<PracticeStudioLayout data={data} score={<div>Score preview</div>} />);

    expect(screen.getByRole('slider', { name: 'MR Track 위치' })).toBeDisabled();
  });

  it('opens comments only after selecting a submitted take', async () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    expect(screen.queryByRole('region', { name: '제출 피드백' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /take_03.wav 피드백 보기/ }));

    expect(screen.getByRole('region', { name: '제출 피드백' })).toBeInTheDocument();
    expect(screen.getByText('00:42')).toBeInTheDocument();
    expect(screen.getByText(/진입 박자가 MR보다 조금 늦어요/)).toBeInTheDocument();
  });
});


