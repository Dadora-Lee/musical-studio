import { readFile, stat } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { getPrototypeAudioSource, getPrototypeMusicXmlSource } from '@/lib/musicxml/prototype-source.server';

interface RouteContext {
  params: Promise<{
    numberId: string;
    kind: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { numberId, kind } = await context.params;
  if (kind === 'musicxml') {
    const source = getPrototypeMusicXmlSource(numberId);

    if (!source) {
      return NextResponse.json({ error: 'prototype MusicXML source not found' }, { status: 404 });
    }

    try {
      const file = await readFile(source.path, 'utf8');
      return new Response(file, {
        headers: {
          'Content-Type': 'application/vnd.recordare.musicxml+xml; charset=utf-8',
          'Content-Disposition': `inline; filename="${encodeURIComponent(source.label)}"`,
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    }
  }

  const source = getPrototypeAudioSource(numberId, kind);

  if (!source) {
    return NextResponse.json({ error: 'prototype audio source not found' }, { status: 404 });
  }

  try {
    const fileStat = await stat(source.path);
    const range = request.headers.get('range');
    const baseHeaders = {
      'Accept-Ranges': 'bytes',
      'Content-Type': source.contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(source.label)}"`,
      'Cache-Control': 'no-store',
    };

    if (range) {
      const parsedRange = parseByteRange(range, fileStat.size);

      if (!parsedRange) {
        return new Response(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes */${fileStat.size}`,
          },
        });
      }

      const file = await readFile(source.path);
      const chunk = file.subarray(parsedRange.start, parsedRange.end + 1);

      return new Response(chunk, {
        status: 206,
        headers: {
          ...baseHeaders,
          'Content-Length': String(chunk.byteLength),
          'Content-Range': `bytes ${parsedRange.start}-${parsedRange.end}/${fileStat.size}`,
        },
      });
    }

    const file = await readFile(source.path);
    return new Response(file, {
      headers: {
        ...baseHeaders,
        'Content-Length': String(fileStat.size),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

function parseByteRange(range: string, fileSize: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match || fileSize <= 0) return null;

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    const start = Math.max(fileSize - suffixLength, 0);
    return { start, end: fileSize - 1 };
  }

  const start = Number(rawStart);
  const end = rawEnd ? Number(rawEnd) : fileSize - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= fileSize) return null;

  return { start, end: Math.min(end, fileSize - 1) };
}
