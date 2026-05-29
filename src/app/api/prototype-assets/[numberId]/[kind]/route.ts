import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { getPrototypeAudioSource, getPrototypeMusicXmlSource } from '@/lib/musicxml/prototype-source.server';

interface RouteContext {
  params: Promise<{
    numberId: string;
    kind: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
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
    const file = await readFile(source.path);
    return new Response(file, {
      headers: {
        'Content-Type': source.contentType,
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
