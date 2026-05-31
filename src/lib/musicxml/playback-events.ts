export interface MusicXmlPlaybackEvent {
  id: string;
  partId: string;
  measureNumber: number;
  startSeconds: number;
  durationSeconds: number;
  pitch: string;
  midi: number;
  isChord: boolean;
}

export interface MusicXmlPlaybackMap {
  tempoBpm: number;
  durationSeconds: number;
  events: MusicXmlPlaybackEvent[];
  measures: Array<{
    measureNumber: number;
    startSeconds: number;
    durationSeconds: number;
  }>;
}

const DEFAULT_TEMPO_BPM = 120;
const PITCH_CLASS: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export function parseMusicXmlPlaybackEvents(xml: string): MusicXmlPlaybackMap {
  const emptyMap: MusicXmlPlaybackMap = {
    tempoBpm: DEFAULT_TEMPO_BPM,
    durationSeconds: 0,
    events: [],
    measures: [],
  };

  if (!xml.trim()) return emptyMap;

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, 'application/xml');
  } catch {
    return emptyMap;
  }

  if (doc.querySelector('parsererror')) return emptyMap;

  const tempoBpm = readTempo(doc) ?? DEFAULT_TEMPO_BPM;
  const secondsPerQuarter = 60 / tempoBpm;
  const events: MusicXmlPlaybackEvent[] = [];
  const measureTimings = new Map<number, { startSeconds: number; durationSeconds: number }>();

  doc.querySelectorAll('part').forEach((part) => {
    const partId = part.getAttribute('id') ?? 'part';
    let divisions = 1;
    let partTime = 0;

    part.querySelectorAll(':scope > measure').forEach((measure, measureIndex) => {
      const divisionsText = measure.querySelector(':scope > attributes > divisions')?.textContent;
      const nextDivisions = Number(divisionsText);
      if (Number.isFinite(nextDivisions) && nextDivisions > 0) divisions = nextDivisions;

      const measureNumber = readMeasureNumber(measure, measureIndex);
      const measureStart = partTime;
      let measureDuration = 0;
      let lastNoteStart = partTime;

      measure.querySelectorAll(':scope > note').forEach((note, noteIndex) => {
        const duration = readDurationSeconds(note, divisions, secondsPerQuarter);
        const isChord = Boolean(note.querySelector(':scope > chord'));
        const startsAt = isChord ? lastNoteStart : partTime;
        const pitch = readPitch(note);

        if (pitch) {
          events.push({
            id: `${partId}-m${measureNumber}-n${noteIndex}`,
            partId,
            measureNumber,
            startSeconds: roundSeconds(startsAt),
            durationSeconds: roundSeconds(duration),
            pitch: pitch.name,
            midi: pitch.midi,
            isChord,
          });
        }

        if (!isChord) {
          lastNoteStart = partTime;
          partTime += duration;
          measureDuration += duration;
        }
      });

      const currentMeasure = measureTimings.get(measureNumber);
      const nextTiming = {
        startSeconds: roundSeconds(currentMeasure ? Math.min(currentMeasure.startSeconds, measureStart) : measureStart),
        durationSeconds: roundSeconds(Math.max(currentMeasure?.durationSeconds ?? 0, measureDuration)),
      };
      measureTimings.set(measureNumber, nextTiming);
    });
  });

  const measures = Array.from(measureTimings.entries())
    .sort(([left], [right]) => left - right)
    .map(([measureNumber, timing]) => ({ measureNumber, ...timing }));

  return {
    tempoBpm,
    durationSeconds: roundSeconds(Math.max(...[0, ...measures.map((measure) => measure.startSeconds + measure.durationSeconds)])),
    events,
    measures,
  };
}

function readTempo(doc: Document) {
  const soundTempo = Number(doc.querySelector('sound[tempo]')?.getAttribute('tempo'));
  if (Number.isFinite(soundTempo) && soundTempo > 0) return soundTempo;

  const perMinute = Number(doc.querySelector('per-minute')?.textContent);
  if (Number.isFinite(perMinute) && perMinute > 0) return perMinute;

  return null;
}

function readMeasureNumber(measure: Element, index: number) {
  const measureNumber = Number(measure.getAttribute('number'));
  return Number.isFinite(measureNumber) && measureNumber > 0 ? measureNumber : index + 1;
}

function readDurationSeconds(note: Element, divisions: number, secondsPerQuarter: number) {
  const duration = Number(note.querySelector(':scope > duration')?.textContent);
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return (duration / divisions) * secondsPerQuarter;
}

function readPitch(note: Element) {
  const pitch = note.querySelector(':scope > pitch');
  if (!pitch) return null;

  const step = pitch.querySelector(':scope > step')?.textContent?.trim().toUpperCase();
  const octave = Number(pitch.querySelector(':scope > octave')?.textContent);
  const alter = Number(pitch.querySelector(':scope > alter')?.textContent ?? 0);

  if (!step || !(step in PITCH_CLASS) || !Number.isFinite(octave) || !Number.isFinite(alter)) return null;

  return {
    name: `${step}${formatAlter(alter)}${octave}`,
    midi: (octave + 1) * 12 + PITCH_CLASS[step] + alter,
  };
}

function formatAlter(alter: number) {
  if (alter === 1) return '#';
  if (alter === -1) return 'b';
  if (alter > 1) return '#'.repeat(alter);
  if (alter < -1) return 'b'.repeat(Math.abs(alter));
  return '';
}

function roundSeconds(value: number) {
  return Math.round(value * 10000) / 10000;
}
