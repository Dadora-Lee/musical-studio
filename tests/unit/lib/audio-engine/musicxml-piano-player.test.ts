import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMusicXmlPianoPlayer, type PianoToneModule } from '@/lib/audio-engine/musicxml-piano-player';
import type { MusicXmlPlaybackMap } from '@/lib/musicxml/playback-events';

function playbackMap(): MusicXmlPlaybackMap {
  return {
    tempoBpm: 120,
    durationSeconds: 3,
    events: [
      { id: 'n1', partId: 'P1', measureNumber: 1, startSeconds: 0, durationSeconds: 0.5, pitch: 'C4', midi: 60, isChord: false },
      { id: 'n2', partId: 'P1', measureNumber: 2, startSeconds: 1, durationSeconds: 0.5, pitch: 'D4', midi: 62, isChord: false },
    ],
    measures: [
      { measureNumber: 1, startSeconds: 0, durationSeconds: 1 },
      { measureNumber: 2, startSeconds: 1, durationSeconds: 2 },
    ],
  };
}

function fakeToneModule() {
  const scheduled: Array<{ callback: (time: number) => void; seconds: number }> = [];
  const synth = {
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    toDestination: vi.fn(),
  };
  synth.toDestination.mockReturnValue(synth);

  const tone: PianoToneModule = {
    start: vi.fn().mockResolvedValue(undefined),
    Synth: vi.fn(),
    PolySynth: vi.fn(() => synth),
    Transport: {
      seconds: 0,
      schedule: vi.fn((callback: (time: number) => void, seconds: number) => {
        scheduled.push({ callback, seconds });
        return scheduled.length;
      }),
      start: vi.fn((_time?: unknown, offset?: number) => {
        if (typeof offset === 'number') tone.Transport.seconds = offset;
      }),
      pause: vi.fn(),
      stop: vi.fn(() => {
        tone.Transport.seconds = 0;
      }),
      cancel: vi.fn(),
    },
  };

  return { tone, synth, scheduled };
}

describe('createMusicXmlPianoPlayer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads a playback map and schedules notes when playback starts', async () => {
    const { tone, synth, scheduled } = fakeToneModule();
    const onTimeChange = vi.fn();
    const onMeasureChange = vi.fn();
    const player = createMusicXmlPianoPlayer({ tone, onTimeChange, onMeasureChange });

    player.load(playbackMap());
    await player.play();

    expect(tone.start).toHaveBeenCalled();
    expect(tone.Transport.cancel).toHaveBeenCalledWith(0);
    expect(tone.Transport.schedule).toHaveBeenCalledTimes(2);
    expect(tone.Transport.start).toHaveBeenCalledWith(undefined, 0);

    scheduled[0]?.callback(0);

    expect(synth.triggerAttackRelease).toHaveBeenCalledWith('C4', 0.5, 0);
    expect(onTimeChange).toHaveBeenCalledWith(0);
    expect(onMeasureChange).toHaveBeenCalledWith(1);
  });

  it('seeks, pauses, stops, and disposes the underlying Tone objects', async () => {
    const { tone, synth } = fakeToneModule();
    const onTimeChange = vi.fn();
    const onMeasureChange = vi.fn();
    const player = createMusicXmlPianoPlayer({ tone, onTimeChange, onMeasureChange });

    player.load(playbackMap());
    player.seek(1.4);

    expect(onTimeChange).toHaveBeenLastCalledWith(1.4);
    expect(onMeasureChange).toHaveBeenLastCalledWith(2);
    expect(player.getSnapshot()).toMatchObject({ currentTime: 1.4, currentMeasure: 2, durationSeconds: 3 });

    await player.play();
    player.pause();
    player.stop();
    player.dispose();

    expect(tone.Transport.pause).toHaveBeenCalled();
    expect(tone.Transport.stop).toHaveBeenCalled();
    expect(tone.Transport.cancel).toHaveBeenCalledWith(0);
    expect(synth.dispose).toHaveBeenCalled();
    expect(player.getSnapshot()).toMatchObject({ isPlaying: false, currentTime: 0, currentMeasure: 1 });
  });

  it('polls Tone transport seconds while playing so the UI time can advance', async () => {
    vi.useFakeTimers();
    const { tone } = fakeToneModule();
    const onTimeChange = vi.fn();
    const player = createMusicXmlPianoPlayer({ tone, onTimeChange });

    player.load(playbackMap());
    await player.play();
    tone.Transport.seconds = 1.2;
    vi.advanceTimersByTime(250);

    expect(onTimeChange).toHaveBeenLastCalledWith(1.2);

    player.pause();
    tone.Transport.seconds = 2.2;
    vi.advanceTimersByTime(250);

    expect(onTimeChange).not.toHaveBeenLastCalledWith(2.2);
  });
});
