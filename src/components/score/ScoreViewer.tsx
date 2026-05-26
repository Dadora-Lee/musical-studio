/**
 * ScoreViewer — OSMD 기반 MusicXML 렌더링 컴포넌트.
 * REQ-A-001: 곡 상세에서 MusicXML을 OSMD로 렌더링, 3초 이내 표시.
 *
 * SSR 불가 (OSMD가 browser DOM 의존) → 'use client'.
 * dynamic import로 OSMD lazy load.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface ScoreViewerProps {
  /** MusicXML URL 또는 raw string */
  source: string | { raw: string };
  /** 본인 배역 partId — 다른 파트는 숨김 (REQ-A-002) */
  visiblePartIds?: string[];
  /** 렌더링 완료 콜백 */
  onReady?: (osmd: OpenSheetMusicDisplay) => void;
  /** 에러 콜백 */
  onError?: (err: Error) => void;
  className?: string;
}

export function ScoreViewer({
  source,
  visiblePartIds,
  onReady,
  onError,
  className = '',
}: ScoreViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setError(null);

        // Lazy load OSMD
        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');

        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',
          drawTitle: true,
          drawSubtitle: false,
          drawComposer: true,
          drawingParameters: 'compact',
        });
        osmdRef.current = osmd;

        // Load source (URL or raw string)
        const xml = typeof source === 'string' ? source : source.raw;
        await osmd.load(xml);

        if (cancelled) return;

        // REQ-A-002: visible parts filter
        if (visiblePartIds && visiblePartIds.length > 0) {
          osmd.Sheet.Parts.forEach((part) => {
            const visible = visiblePartIds.includes(part.NameLabel?.text ?? '');
            part.Visible = visible;
          });
        }

        osmd.render();

        if (cancelled) return;
        setLoading(false);
        onReady?.(osmd);
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err.message);
        setLoading(false);
        onError?.(err);
      }
    }

    render();

    return () => {
      cancelled = true;
      // OSMD에 명시적 cleanup API는 없음. ref만 해제.
      osmdRef.current = null;
    };
  }, [source, visiblePartIds, onReady, onError]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-slate-500 text-sm">악보 로딩 중...</div>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-lg my-4">
          <strong className="block">악보 렌더링 실패</strong>
          <span className="text-sm">{error}</span>
        </div>
      )}
      <div ref={containerRef} className="osmd-canvas" />
    </div>
  );
}
