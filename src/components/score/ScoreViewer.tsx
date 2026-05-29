/**
 * ScoreViewer — OSMD 기반 MusicXML 렌더링 컴포넌트.
 * REQ-A-001: 곡 상세에서 MusicXML을 OSMD로 렌더링, 3초 이내 표시.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export interface ScorePlaybackController {
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepBack: () => void;
  stepForward: () => void;
}

interface ScoreViewerProps {
  source: string | { raw: string } | { url: string };
  visiblePartIds?: string[];
  currentPage?: number;
  onPageCountChange?: (pageCount: number) => void;
  onCurrentPageChange?: (page: number) => void;
  onReady?: (osmd: OpenSheetMusicDisplay) => void;
  onError?: (err: Error) => void;
  onPlaybackControllerChange?: (controller: ScorePlaybackController | null) => void;
  className?: string;
}



async function fetchMusicXml(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`MusicXML fetch failed: ${response.status}`);
  return response.text();
}
async function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

function applyPracticeEngravingRules(osmd: OpenSheetMusicDisplay) {
  const rules = osmd.EngravingRules;

  osmd.setCustomPageFormat(840, 1188);
  rules.CompactMode = true;
  rules.NewSystemAtXMLNewSystemAttribute = false;
  rules.NewSystemAtXMLNewPageAttribute = false;
  rules.NewPageAtXMLNewPageAttribute = false;
  rules.RenderXMeasuresPerLineAkaSystem = 4;
  rules.PageTopMargin = 8;
  rules.PageBottomMargin = 8;
  rules.PageLeftMargin = 8;
  rules.PageRightMargin = 8;
  rules.TitleTopDistance = 3;
  rules.TitleBottomDistance = 3;
  rules.MinimumDistanceBetweenSystems = 3;
  rules.MinSkyBottomDistBetweenSystems = 2;
  rules.StaffDistance = 4;
  rules.BetweenStaffDistance = 3;
  rules.StretchLastSystemLine = false;
}

function normalizePracticeMusicXml(xml: string) {
  return xml
    .replace(/<print\b[^>]*\/>/g, '')
    .replace(/<print\b[^>]*>[\s\S]*?<\/print>/g, '')
    .replace(/\snew-system="yes"/g, '')
    .replace(/\snew-system="no"/g, '')
    .replace(/\snew-page="yes"/g, '')
    .replace(/\snew-page="no"/g, '');
}

function pageElements(container: HTMLDivElement) {
  const directChildren = Array.from(container.children) as HTMLElement[];
  const pageLike = directChildren.filter((child) => {
    const tag = child.tagName.toLowerCase();
    return tag === 'svg' || child.querySelector('svg');
  });

  if (pageLike.length > 0) return pageLike;

  return Array.from(container.querySelectorAll<HTMLElement>('svg'));
}

function setPageVisibility(container: HTMLDivElement, currentPage: number) {
  const pages = pageElements(container);
  if (pages.length === 0) return;

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    page.style.display = pageNumber === currentPage ? 'flex' : 'none';
    page.style.alignItems = 'center';
    page.style.justifyContent = 'center';
    page.style.width = '100%';
    page.style.height = '100%';
    page.style.margin = '0 auto';
    page.style.marginBottom = '0';
    page.style.overflow = 'hidden';
    page.setAttribute('data-score-page', String(pageNumber));
    page.toggleAttribute('data-active-score-page', pageNumber === currentPage);
  });
}

function normalizeA4Pages(container: HTMLDivElement) {
  pageElements(container).forEach((page) => {
    page.style.width = '100%';
    page.style.maxWidth = '100%';
    page.style.height = '100%';
    page.style.maxHeight = '100%';
    page.style.overflow = 'hidden';

    const svg = page.tagName.toLowerCase() === 'svg' ? page : page.querySelector<SVGSVGElement>('svg');
    if (svg) {
      svg.style.display = 'block';
      svg.style.width = '100%';
      svg.style.maxWidth = '100%';
      svg.style.height = '100%';
      svg.style.maxHeight = '100%';
      svg.style.overflow = 'visible';
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  });
}

export function ScoreViewer({
  source,
  visiblePartIds,
  currentPage = 1,
  onPageCountChange,
  onCurrentPageChange,
  onReady,
  onError,
  onPlaybackControllerChange,
  className = '',
}: ScoreViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const currentPageRef = useRef(currentPage);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    currentPageRef.current = currentPage;
    if (!containerRef.current || loading || error) return;
    setPageVisibility(containerRef.current, currentPage);
  }, [currentPage, loading, error]);

  useEffect(() => {
    let cancelled = false;

    function clearPlaybackTimer() {
      if (playbackTimerRef.current !== null) {
        window.clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    async function render() {
      if (!containerRef.current) return;

      try {
        clearPlaybackTimer();
        onPlaybackControllerChange?.(null);
        setLoading(true);
        setStage('importing');
        setError(null);
        containerRef.current.innerHTML = '';

        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
        setStage('loading-xml');

        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: false,
          backend: 'svg',
          drawingParameters: 'compacttight',
          drawTitle: false,
          drawSubtitle: false,
          drawComposer: true,
          followCursor: true,
          newPageFromXML: false,
          newSystemFromNewPageInXML: false,
          newSystemFromXML: false,
          pageFormat: 'A4_P',
        });
        osmdRef.current = osmd;
        applyPracticeEngravingRules(osmd);

        const xml = normalizePracticeMusicXml(
          typeof source === 'string' ? source : 'url' in source ? await fetchMusicXml(source.url) : source.raw,
        );
        await withTimeout(osmd.load(xml), 20000, 'MusicXML load timed out after 20 seconds.');
        applyPracticeEngravingRules(osmd);
        setStage('rendering');

        if (cancelled) return;

        if (visiblePartIds && visiblePartIds.length > 0) {
          osmd.Sheet.Parts.forEach((part) => {
            const visible = visiblePartIds.includes(part.NameLabel?.text ?? '');
            part.Visible = visible;
          });
        }

        osmd.render();
        normalizeA4Pages(containerRef.current);

        if (cancelled || !containerRef.current) return;

        const renderedPages = Math.max(
          pageElements(containerRef.current).length,
          osmd.GraphicSheet.MusicPages.length,
          1,
        );
        setPageVisibility(containerRef.current, Math.min(currentPageRef.current, renderedPages));
        setStage('ready');
        setLoading(false);
        onPageCountChange?.(renderedPages);

        try {
          osmd.cursor.show();
          osmd.cursor.reset();
        } catch {
          // The score is already rendered; cursor setup can recover on explicit playback.
        }

        const revealCursor = () => {
          const nextPage = Math.max(1, osmd.cursor.updateCurrentPage() || osmd.cursor.currentPageNumber || 1);
          currentPageRef.current = nextPage;
          onCurrentPageChange?.(nextPage);

          if (containerRef.current) setPageVisibility(containerRef.current, nextPage);

          window.requestAnimationFrame(() => {
            osmd.cursor.cursorElement?.scrollIntoView({ block: 'center', inline: 'center' });
          });
        };

        const controller: ScorePlaybackController = {
          play: () => {
            clearPlaybackTimer();
            osmd.cursor.show();
            playbackTimerRef.current = window.setInterval(() => {
              osmd.cursor.nextMeasure();
              revealCursor();
            }, 620);
          },
          pause: clearPlaybackTimer,
          stop: () => {
            clearPlaybackTimer();
            osmd.cursor.reset();
            osmd.cursor.show();
            revealCursor();
          },
          stepBack: () => {
            osmd.cursor.previousMeasure();
            osmd.cursor.show();
            revealCursor();
          },
          stepForward: () => {
            osmd.cursor.nextMeasure();
            osmd.cursor.show();
            revealCursor();
          },
        };

        onPlaybackControllerChange?.(controller);
        onReady?.(osmd);
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof Error ? e : new Error(String(e));
        setStage('error');
        setError(err.message);
        setLoading(false);
        onPlaybackControllerChange?.(null);
        onError?.(err);
      }
    }

    render();

    return () => {
      cancelled = true;
      clearPlaybackTimer();
      onPlaybackControllerChange?.(null);
      osmdRef.current = null;
    };
  }, [source, visiblePartIds, onReady, onError, onPageCountChange, onCurrentPageChange, onPlaybackControllerChange]);

  return (
    <div className={`relative h-full ${className}`} data-score-stage={stage}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <div className="text-sm text-slate-500">악보 로딩 중... {stage}</div>
        </div>
      )}
      {error && (
        <div className="my-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <strong className="block">악보 렌더링 실패</strong>
          <span className="text-sm">{error}</span>
        </div>
      )}
      <div className="grid h-full min-h-0 place-items-center overflow-hidden rounded-md bg-slate-200 p-3 sm:p-4" aria-label="A4 악보 보기">
        <div className="aspect-[210/297] w-[min(100%,440px)] max-h-full overflow-hidden border border-slate-300 bg-white p-3 shadow-lg sm:p-4">
          <div
            ref={containerRef}
            className="osmd-canvas h-[350%] w-[350%] max-w-none origin-top-left scale-[0.285714] overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
}







