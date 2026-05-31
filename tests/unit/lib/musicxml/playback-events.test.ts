import { describe, expect, it } from 'vitest';
import { parseMusicXmlPlaybackEvents } from '@/lib/musicxml/playback-events';

const scoreWithNotes = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>Hikaru</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>120</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="120"/>
      </direction>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <rest/>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>E</step><alter>-1</alter><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <chord/>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

describe('parseMusicXmlPlaybackEvents', () => {
  it('converts notes, rests, chords, tempo, and measure timing into a playback map', () => {
    const map = parseMusicXmlPlaybackEvents(scoreWithNotes);

    expect(map.tempoBpm).toBe(120);
    expect(map.durationSeconds).toBe(2.5);
    expect(map.measures).toEqual([
      { measureNumber: 1, startSeconds: 0, durationSeconds: 2 },
      { measureNumber: 2, startSeconds: 2, durationSeconds: 0.5 },
    ]);
    expect(map.events).toEqual([
      expect.objectContaining({
        id: 'P1-m1-n0',
        partId: 'P1',
        measureNumber: 1,
        startSeconds: 0,
        durationSeconds: 0.5,
        pitch: 'C4',
        midi: 60,
        isChord: false,
      }),
      expect.objectContaining({
        id: 'P1-m1-n2',
        partId: 'P1',
        measureNumber: 1,
        startSeconds: 1,
        durationSeconds: 1,
        pitch: 'D4',
        midi: 62,
        isChord: false,
      }),
      expect.objectContaining({
        id: 'P1-m2-n0',
        partId: 'P1',
        measureNumber: 2,
        startSeconds: 2,
        durationSeconds: 0.5,
        pitch: 'Eb4',
        midi: 63,
        isChord: false,
      }),
      expect.objectContaining({
        id: 'P1-m2-n1',
        partId: 'P1',
        measureNumber: 2,
        startSeconds: 2,
        durationSeconds: 0.5,
        pitch: 'G4',
        midi: 67,
        isChord: true,
      }),
    ]);
  });

  it('falls back to 120bpm and an empty playback map for invalid XML', () => {
    expect(parseMusicXmlPlaybackEvents('<score-partwise')).toEqual({
      tempoBpm: 120,
      durationSeconds: 0,
      events: [],
      measures: [],
    });
  });
});
