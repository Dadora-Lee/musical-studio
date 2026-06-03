import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PracticeStudioLayout } from '@/components/practice/PracticeStudioLayout';
import { practiceStudioPrototype } from '@/lib/practice/prototype-data';

const pianoMocks = vi.hoisted(() => {
  const scoreController = {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    stepBack: vi.fn(),
    stepForward: vi.fn(),
    highlightMeasure: vi.fn(),
    goToMeasure: vi.fn(),
  };
  const player = {
    load: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    stop: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    dispose: vi.fn(),
    getSnapshot: vi.fn(() => ({ isPlaying: false, currentTime: 0, currentMeasure: 1, durationSeconds: 2 })),
  };
  return {
    scoreController,
    player,
    createBrowserMusicXmlPianoPlayer: vi.fn().mockResolvedValue(player),
  };
});

vi.mock('@/components/score/ScoreViewer', async () => {
  const React = await import('react');
  const rawXml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Hikaru</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions></attributes>
      <sound tempo="120"/>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration></note>
    </measure>
  </part>
</score-partwise>`;

  return {
    ScoreViewer: (props: {
      title?: string;
      className?: string;
      onMusicXmlLoaded?: (xml: string) => void;
      onPlaybackControllerChange?: (controller: typeof pianoMocks.scoreController) => void;
    }) => {
      React.useEffect(() => {
        props.onMusicXmlLoaded?.(rawXml);
        props.onPlaybackControllerChange?.(pianoMocks.scoreController);
      }, [props]);

      return React.createElement('div', { className: props.className, 'data-testid': 'mock-score-viewer' }, props.title);
    },
  };
});

vi.mock('@/lib/audio-engine/musicxml-piano-player', () => ({
  createBrowserMusicXmlPianoPlayer: pianoMocks.createBrowserMusicXmlPianoPlayer,
}));

class FakeMediaRecorder {
  static isTypeSupported = () => true;
  static stopSpy = vi.fn();
  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
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

  stop() {
    FakeMediaRecorder.stopSpy();
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['recording'], { type: 'audio/webm' }) } as BlobEvent);
    this.onstop?.();
  }
}

async function readWavPcmSamples(blob: Blob) {
  const buffer = await readBlobForTest(blob);
  const view = new DataView(buffer);
  const samples: number[] = [];
  for (let offset = 44; offset < view.byteLength; offset += 2) {
    samples.push(view.getInt16(offset, true));
  }
  return samples;
}

function readBlobForTest(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Blob 읽기에 실패했습니다.'));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}

function installRecorderMocks() {
  const stop = vi.fn();
  const recorderStop = vi.fn();
  FakeMediaRecorder.stopSpy = recorderStop;
  const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] });
  const enumerateDevices = vi.fn().mockResolvedValue([
    { kind: 'audioinput', deviceId: 'mic-1', label: 'USB Mic' },
    { kind: 'audiooutput', deviceId: 'out-1', label: 'Headphones' },
  ]);
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:local-take');
  const revokeObjectURL = vi.fn();
  const close = vi.fn().mockResolvedValue(undefined);
  const decodeAudioData = vi.fn().mockResolvedValue({
    numberOfChannels: 1,
    sampleRate: 44100,
    length: 4,
    getChannelData: () => new Float32Array([0, 0.35, -0.25, 0.12]),
  });
  class FakeAudioContext {
    decodeAudioData = decodeAudioData;
    close = close;
  }

  Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: FakeMediaRecorder });
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia, enumerateDevices } });
  Object.defineProperty(window.URL, 'createObjectURL', { configurable: true, value: createObjectURL });
  Object.defineProperty(window.URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
  Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: FakeAudioContext });

  return { getUserMedia, enumerateDevices, createObjectURL, revokeObjectURL, stop, recorderStop, decodeAudioData };
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  pianoMocks.createBrowserMusicXmlPianoPlayer.mockResolvedValue(pianoMocks.player);
  pianoMocks.player.play.mockResolvedValue(undefined);
  pianoMocks.scoreController.play.mockClear();
  pianoMocks.scoreController.pause.mockClear();
  pianoMocks.scoreController.stop.mockClear();
  pianoMocks.scoreController.stepBack.mockClear();
  pianoMocks.scoreController.stepForward.mockClear();
  pianoMocks.scoreController.highlightMeasure.mockClear();
  pianoMocks.scoreController.goToMeasure.mockClear();
  pianoMocks.player.load.mockClear();
  pianoMocks.player.play.mockClear();
  pianoMocks.player.pause.mockClear();
  pianoMocks.player.stop.mockClear();
  pianoMocks.player.seek.mockClear();
  pianoMocks.player.setVolume.mockClear();
  pianoMocks.player.dispose.mockClear();
  pianoMocks.player.getSnapshot.mockClear();
  pianoMocks.createBrowserMusicXmlPianoPlayer.mockClear();
});

describe('PracticeStudioLayout', () => {
  it('shows submission status before the take list', () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    const status = screen.getByRole('region', { name: '제출 상태' });
    const takes = screen.getByRole('region', { name: '녹음 Take 목록' });

    expect(status.compareDocumentPosition(takes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(status).getByText('재제출 필요')).toBeInTheDocument();
    expect(within(takes).getByText('take_03.wav')).toBeInTheDocument();
  });

  it('shows score pagination and MR/AR/piano playback sources', () => {
    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'MR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '피아노 연주' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'AR' }));

    expect(screen.getByText(/AR · SONG07_AR.mp3/)).toBeInTheDocument();
  });

  it('plays and seeks MusicXML piano playback with fixed score measure highlight sync', async () => {
    const user = userEvent.setup();

    render(
      <PracticeStudioLayout
        data={practiceStudioPrototype}
        scoreSources={{
          'song07-lie': { url: '/api/prototype-assets/song07-lie/musicxml', label: 'SONG07_MUSIC_SHEET.musicxml.xml' },
        }}
      />,
    );

    await screen.findByTestId('mock-score-viewer');
    await waitFor(() => expect(pianoMocks.createBrowserMusicXmlPianoPlayer).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: '피아노 연주' }));

    expect(screen.getByText(/피아노 연주 · MusicXML piano reference/)).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: '피아노 연주 위치' })).toBeEnabled();

    await user.click(screen.getByLabelText('재생'));

    expect(pianoMocks.player.play).toHaveBeenCalled();

    fireEvent.change(screen.getByRole('slider', { name: '피아노 연주 위치' }), { target: { value: '1' } });

    expect(pianoMocks.player.seek).toHaveBeenCalledWith(1);
    expect(pianoMocks.scoreController.highlightMeasure).toHaveBeenCalledWith(2);
    expect(pianoMocks.scoreController.goToMeasure).not.toHaveBeenCalled();
  });

  it('lets users choose score measure rendering density and control lane sound', async () => {
    const user = userEvent.setup();

    render(
      <PracticeStudioLayout
        data={practiceStudioPrototype}
        scoreSources={{
          'song07-lie': { url: '/api/prototype-assets/song07-lie/musicxml', label: 'SONG07_MUSIC_SHEET.musicxml.xml' },
        }}
      />,
    );

    expect(screen.getByRole('radio', { name: '균형' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: '가사 크게' }));

    expect(screen.getByRole('radio', { name: '가사 크게' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: '피아노 연주' }));
    await user.click(screen.getByRole('button', { name: '피아노 연주 소리 끄기' }));

    expect(screen.getByRole('button', { name: '피아노 연주 소리 켜기' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.change(screen.getByRole('slider', { name: '피아노 연주 소리 볼륨' }), { target: { value: '42' } });

    expect(pianoMocks.player.setVolume).toHaveBeenCalledWith(0);
    await user.click(screen.getByRole('button', { name: '피아노 연주 소리 켜기' }));
    expect(pianoMocks.player.setVolume).toHaveBeenCalledWith(42);
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

    expect(screen.getByLabelText('MR 소리 끄기')).toBeInTheDocument();
    expect(screen.getByLabelText('Recording 소리 끄기')).toBeInTheDocument();
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
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

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
    expect(screen.getByTestId('active-audio-track-fill')).toHaveAttribute('data-progress', '33.3333');
    expect(screen.getByTestId('active-audio-track-playhead')).toHaveAttribute('data-progress', '33.3333');
    expect(screen.getByRole('slider', { name: 'AR Track 위치' })).toHaveClass('seek-range--line-only');

    play.mockRestore();
  });

  it('uses real audio metadata duration and plays from the dragged tracker position', () => {
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    const audio = document.querySelector('audio');
    expect(audio).not.toBeNull();
    if (!audio) return;

    Object.defineProperty(audio, 'duration', { configurable: true, value: 196 });
    fireEvent.loadedMetadata(audio);

    expect(screen.getByText('현재 00:00 / 03:16')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'MR Track 위치' }), { target: { value: '74' } });

    expect(audio.currentTime).toBe(74);
    expect(screen.getByText('01:14 / 03:16')).toBeInTheDocument();
    expect(play).toHaveBeenCalled();

    play.mockRestore();
  });

  it('resets playback state when switching between MR and AR sources', async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    const audio = document.querySelector('audio');
    expect(audio).not.toBeNull();
    if (!audio) return;

    Object.defineProperty(audio, 'duration', { configurable: true, value: 196 });
    fireEvent.loadedMetadata(audio);
    fireEvent.change(screen.getByRole('slider', { name: 'MR Track 위치' }), { target: { value: '40' } });

    expect(screen.getByText('00:40 / 03:16')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'AR' }));

    expect(screen.getByText('현재 00:00 / 03:18')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'AR Track 위치' })).toBeEnabled();
    expect(play).toHaveBeenCalledTimes(1);

    play.mockRestore();
  });

  it('previews tracker drag without repeatedly calling play before commit', () => {
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    const audio = document.querySelector('audio');
    expect(audio).not.toBeNull();
    if (!audio) return;

    Object.defineProperty(audio, 'duration', { configurable: true, value: 196 });
    fireEvent.loadedMetadata(audio);

    const mrSeek = screen.getByRole('slider', { name: 'MR Track 위치' });
    fireEvent.pointerDown(mrSeek);
    fireEvent.input(mrSeek, { target: { value: '24' } });
    fireEvent.input(mrSeek, { target: { value: '48' } });
    fireEvent.input(mrSeek, { target: { value: '72' } });

    expect(audio.currentTime).toBe(72);
    expect(screen.getByText('01:12 / 03:16')).toBeInTheDocument();
    expect(play).not.toHaveBeenCalled();

    fireEvent.input(mrSeek, { target: { value: '84' } });
    expect(play).not.toHaveBeenCalled();
    fireEvent.pointerUp(mrSeek);

    expect(audio.currentTime).toBe(84);
    expect(screen.getByText('01:24 / 03:16')).toBeInTheDocument();
    expect(play).toHaveBeenCalledTimes(1);

    play.mockRestore();
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

  it('records with the selected audio source and saves a local WAV take', async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const mocks = installRecorderMocks();

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());

    await user.click(screen.getByLabelText('녹음 시작'));

    expect(mocks.getUserMedia).toHaveBeenCalled();
    expect(play).toHaveBeenCalled();
    expect(await screen.findByText(/녹음 중입니다/)).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 일시정지'));
    expect(screen.getByText('녹음을 일시정지했습니다.')).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 일시정지'));
    expect(screen.getByText('녹음을 다시 진행합니다.')).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 정지'));

    await waitFor(() => expect(mocks.stop).toHaveBeenCalled());
    await waitFor(() => expect(mocks.createObjectURL).toHaveBeenCalled());
    expect(await screen.findByText('WAV Take가 준비되었습니다. 저장하면 오른쪽 녹음 Take 목록에 추가됩니다.')).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 저장'));

    expect(screen.getByText('WAV Take를 목록에 추가했습니다. 제출은 local prototype 상태입니다.')).toBeInTheDocument();
    expect(screen.getAllByText(/take_\d+\.wav/).length).toBeGreaterThan(0);

    play.mockRestore();
  });

  it('saves decoded recording audio as a non-silent WAV', async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const mocks = installRecorderMocks();

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());
    await user.click(screen.getByLabelText('녹음 시작'));
    await user.click(screen.getByLabelText('녹음 정지'));

    await waitFor(() => expect(mocks.createObjectURL).toHaveBeenCalledWith(expect.any(Blob)));

    const wavBlob = mocks.createObjectURL.mock.calls.at(-1)?.[0] as Blob;
    const samples = await readWavPcmSamples(wavBlob);

    expect(mocks.decodeAudioData).toHaveBeenCalled();
    expect(wavBlob.type).toBe('audio/wav');
    expect(samples.some((sample) => sample !== 0)).toBe(true);

    play.mockRestore();
  });

  it('records with the selected piano source and synchronizes pause and resume', async () => {
    const user = userEvent.setup();
    const mocks = installRecorderMocks();

    render(
      <PracticeStudioLayout
        data={practiceStudioPrototype}
        scoreSources={{
          'song07-lie': { url: '/api/prototype-assets/song07-lie/musicxml', label: 'SONG07_MUSIC_SHEET.musicxml.xml' },
        }}
      />,
    );

    await screen.findByTestId('mock-score-viewer');
    await waitFor(() => expect(pianoMocks.createBrowserMusicXmlPianoPlayer).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: '피아노 연주' }));
    await waitFor(() => expect(screen.getByRole('slider', { name: '피아노 연주 위치' })).toBeEnabled());
    await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());

    await user.click(screen.getByLabelText('녹음 시작'));

    expect(mocks.getUserMedia).toHaveBeenCalled();
    expect(pianoMocks.player.play).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/녹음 중입니다/)).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 일시정지'));

    expect(pianoMocks.player.pause).toHaveBeenCalled();
    expect(screen.getByLabelText('녹음 시작')).toBeDisabled();
    expect(screen.getByText('녹음을 일시정지했습니다.')).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 일시정지'));

    expect(pianoMocks.player.play).toHaveBeenCalledTimes(2);
    expect(screen.getByText('녹음을 다시 진행합니다.')).toBeInTheDocument();

    await user.click(screen.getByLabelText('녹음 정지'));

    await waitFor(() => expect(mocks.stop).toHaveBeenCalled());
    expect(pianoMocks.player.pause).toHaveBeenCalled();
  });

  it('does not finalize a recording after unmount while recorder is active', async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const mocks = installRecorderMocks();

    const { unmount } = render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());
    await user.click(screen.getByLabelText('녹음 시작'));

    unmount();

    expect(mocks.stop).toHaveBeenCalled();
    expect(mocks.recorderStop).toHaveBeenCalled();
    expect(mocks.createObjectURL).not.toHaveBeenCalled();

    play.mockRestore();
  });

  it('shows a recording error when microphone permission fails', async () => {
    const user = userEvent.setup();
    const mocks = installRecorderMocks();
    mocks.getUserMedia.mockRejectedValueOnce(new Error('permission denied'));

    render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());
    await user.click(screen.getByLabelText('녹음 시작'));

    expect(await screen.findByText(/마이크 권한 또는 녹음 시작에 실패했습니다: permission denied/)).toBeInTheDocument();
  });

  it('plays a saved local take and revokes its object URL on unmount', async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const mocks = installRecorderMocks();

    const { unmount } = render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

    await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());
    await user.click(screen.getByLabelText('녹음 시작'));
    await user.click(screen.getByLabelText('녹음 정지'));
    await waitFor(() => expect(mocks.createObjectURL).toHaveBeenCalledWith(expect.any(Blob)));
    await user.click(screen.getByLabelText('녹음 저장'));

    const takePlayButtons = screen.getAllByRole('button', { name: '재생' });
    await user.click(takePlayButtons[takePlayButtons.length - 1]);

    expect(play).toHaveBeenCalled();

    unmount();

    expect(mocks.revokeObjectURL).toHaveBeenCalledWith('blob:local-take');
    play.mockRestore();
  });
});

