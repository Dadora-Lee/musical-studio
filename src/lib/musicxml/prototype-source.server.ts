import { readFile } from 'node:fs/promises';

export type PrototypeAudioKind = 'mr' | 'ar';

export interface PrototypeMusicXmlSource {
  path: string;
  label: string;
}

export interface PrototypeAudioSource {
  path: string;
  label: string;
  contentType: string;
}

export interface LoadedPrototypeMusicXml {
  xml: string | null;
  label: string;
  error?: string;
}

const prototypeMusicXmlSources: Record<string, PrototypeMusicXmlSource> = {
  'song07-lie': {
    path: '/mnt/e/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_MUSIC_SHEET.musicxml.xml',
    label: 'SONG07_MUSIC_SHEET.musicxml.xml',
  },
  'song16-mirror': {
    path: '/mnt/e/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_MUSIC_SHEET.musicxml.xml',
    label: 'SONG16_MUSIC_SHEET.musicxml.xml',
  },
};

const prototypeAudioSources: Record<string, Record<PrototypeAudioKind, PrototypeAudioSource>> = {
  'song07-lie': {
    mr: {
      path: '/mnt/e/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_MR.mp3',
      label: 'SONG07_MR.mp3',
      contentType: 'audio/mpeg',
    },
    ar: {
      path: '/mnt/e/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_AR.mp3',
      label: 'SONG07_AR.mp3',
      contentType: 'audio/mpeg',
    },
  },
  'song16-mirror': {
    mr: {
      path: '/mnt/e/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_MR.mp3',
      label: 'SONG16_MR.mp3',
      contentType: 'audio/mpeg',
    },
    ar: {
      path: '/mnt/e/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_AR.mp3',
      label: 'SONG16_AR.mp3',
      contentType: 'audio/mpeg',
    },
  },
};

export function getPrototypeMusicXmlSource(numberId: string) {
  return prototypeMusicXmlSources[numberId] ?? null;
}

export function getPrototypeAudioSource(numberId: string, kind: string) {
  if (kind !== 'mr' && kind !== 'ar') return null;
  return prototypeAudioSources[numberId]?.[kind] ?? null;
}

export async function loadPrototypeMusicXml(numberId: string): Promise<LoadedPrototypeMusicXml> {
  const source = getPrototypeMusicXmlSource(numberId);
  if (!source) {
    return {
      xml: null,
      label: 'MusicXML 미등록',
      error: '이 Number에는 prototype MusicXML 경로가 아직 연결되지 않았습니다.',
    };
  }

  try {
    return {
      xml: await readFile(source.path, 'utf8'),
      label: source.label,
    };
  } catch (error) {
    return {
      xml: null,
      label: source.label,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
