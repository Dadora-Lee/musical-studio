import type { MusicXmlPlaybackMap } from '@/lib/musicxml/playback-events';

export interface PianoSynth {
  triggerAttackRelease: (pitch: string, durationSeconds: number, time?: number) => void;
  dispose: () => void;
  toDestination?: () => PianoSynth;
}

export interface PianoToneModule {
  start: () => Promise<void>;
  Synth: unknown;
  PolySynth: unknown;
  Transport: {
    seconds: number;
    schedule: (callback: (time: number) => void, seconds: number) => unknown;
    start: (time?: unknown, offset?: number) => void;
    pause: () => void;
    stop: () => void;
    cancel: (after?: number) => void;
  };
}

export interface MusicXmlPianoPlayerOptions {
  tone: PianoToneModule;
  onTimeChange?: (seconds: number) => void;
  onMeasureChange?: (measureNumber: number) => void;
  maxEvents?: number;
}

export interface MusicXmlPianoPlayerSnapshot {
  isPlaying: boolean;
  currentTime: number;
  currentMeasure: number;
  durationSeconds: number;
}

const DEFAULT_MAX_EVENTS = 5000;

export async function createBrowserMusicXmlPianoPlayer(
  options: Omit<MusicXmlPianoPlayerOptions, 'tone'>,
) {
  const tone = (await import('tone')) as unknown as PianoToneModule;
  return createMusicXmlPianoPlayer({ ...options, tone });
}

export function createMusicXmlPianoPlayer({
  tone,
  onTimeChange,
  onMeasureChange,
  maxEvents = DEFAULT_MAX_EVENTS,
}: MusicXmlPianoPlayerOptions) {
  let map: MusicXmlPlaybackMap | null = null;
  let synth: PianoSynth | null = createSynth(tone);
  let currentTime = 0;
  let currentMeasure = 1;
  let isPlaying = false;
  let progressTimer: ReturnType<typeof setInterval> | null = null;

  function notify(seconds: number) {
    currentTime = clamp(seconds, 0, map?.durationSeconds ?? 0);
    currentMeasure = findActiveMeasure(map, currentTime);
    onTimeChange?.(currentTime);
    onMeasureChange?.(currentMeasure);
  }

  function clearSchedule() {
    tone.Transport.cancel(0);
  }

  function clearProgressTimer() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function startProgressTimer() {
    clearProgressTimer();
    progressTimer = setInterval(() => notify(tone.Transport.seconds), 250);
  }

  function schedule() {
    if (!map || !synth) return;
    clearSchedule();

    map.events.slice(0, maxEvents).forEach((event) => {
      tone.Transport.schedule((time) => {
        synth?.triggerAttackRelease(event.pitch, event.durationSeconds, time);
        notify(event.startSeconds);
      }, event.startSeconds);
    });
  }

  return {
    load(nextMap: MusicXmlPlaybackMap) {
      map = nextMap;
      notify(0);
    },
    async play() {
      if (!map) return;
      await tone.start();
      schedule();
      tone.Transport.start(undefined, currentTime);
      isPlaying = true;
      startProgressTimer();
    },
    pause() {
      tone.Transport.pause();
      clearProgressTimer();
      isPlaying = false;
    },
    stop() {
      tone.Transport.stop();
      clearProgressTimer();
      notify(0);
      isPlaying = false;
    },
    seek(seconds: number) {
      notify(seconds);
      tone.Transport.seconds = currentTime;
    },
    dispose() {
      clearSchedule();
      clearProgressTimer();
      tone.Transport.stop();
      synth?.dispose();
      synth = null;
      map = null;
      currentTime = 0;
      currentMeasure = 1;
      isPlaying = false;
    },
    getSnapshot(): MusicXmlPianoPlayerSnapshot {
      return {
        isPlaying,
        currentTime,
        currentMeasure,
        durationSeconds: map?.durationSeconds ?? 0,
      };
    },
  };
}

function createSynth(tone: PianoToneModule): PianoSynth {
  const PolySynth = tone.PolySynth as {
    new (voice: unknown): PianoSynth;
    (voice: unknown): PianoSynth;
  };

  let synth: PianoSynth;
  try {
    synth = new PolySynth(tone.Synth);
  } catch {
    synth = PolySynth(tone.Synth);
  }

  return synth.toDestination?.() ?? synth;
}

function findActiveMeasure(map: MusicXmlPlaybackMap | null, seconds: number) {
  if (!map || map.measures.length === 0) return 1;

  const activeMeasure = map.measures.find((measure) => {
    const endSeconds = measure.startSeconds + measure.durationSeconds;
    return seconds >= measure.startSeconds && seconds < endSeconds;
  });

  return activeMeasure?.measureNumber ?? map.measures.at(-1)?.measureNumber ?? 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
