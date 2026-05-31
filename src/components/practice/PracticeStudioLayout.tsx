'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ScoreViewer, type ScorePlaybackController } from '@/components/score/ScoreViewer';
import {
  practiceStudioPrototype,
  submissionStateLabel,
  type PracticeNumber,
  type PracticeStudioData,
  type PracticeTake,
} from '@/lib/practice/prototype-data';

type PlaybackSource = 'mr' | 'ar' | 'score';
type RecorderState = 'checking' | 'idle' | 'recording' | 'paused' | 'ready' | 'unsupported' | 'error';
type DeviceOption = { deviceId: string; label: string };
type ReadyRecording = { blob: Blob; url: string; duration: number };
type AudioElementWithSink = HTMLAudioElement & { setSinkId?: (sinkId: string) => Promise<void> };

const prototypeMembers = [
  '주언',
  '카일',
  '기묘',
  '재럼',
  '두기 이켄가',
  '듀이',
  '폴라리스',
  '까미',
  '종욱',
  '윤슬',
  '북구',
  '죠죠',
  '지예',
  '앙리',
  '도마',
  '에반',
  '레이',
  '머피',
  '타니',
  '아리',
  '뇽뇽',
];

interface PracticeStudioLayoutProps {
  data?: PracticeStudioData;
  score?: ReactNode;
  scoreSource?: { raw?: string; url?: string; label: string };
  scoreSources?: Record<string, { raw?: string; url?: string; label: string }>;
  scoreError?: { label: string; message?: string };
}

export function PracticeStudioLayout({ data = practiceStudioPrototype, score, scoreSource, scoreSources, scoreError }: PracticeStudioLayoutProps) {
  const [selectedMember, setSelectedMember] = useState('듀이');
  const [selectedNumberId, setSelectedNumberId] = useState(data.activeNumberId);
  const [selectedSubmissionTakeId, setSelectedSubmissionTakeId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [scoreController, setScoreController] = useState<ScorePlaybackController | null>(null);
  const [localTakes, setLocalTakes] = useState<PracticeTake[]>(data.takes);
  const activeNumber = data.numbers.find((number) => number.id === selectedNumberId) ?? data.numbers[0];
  const submittedTake = localTakes.find((take) => take.id === data.submission.takeId);
  const activeScoreSource = scoreSources?.[activeNumber.id] ?? scoreSource;
  const scoreSourceRaw = activeScoreSource?.raw;
  const scoreSourceUrl = activeScoreSource?.url;
  const scoreViewerSource = useMemo(
    () => (scoreSourceUrl ? { url: scoreSourceUrl } : (scoreSourceRaw ?? null)),
    [scoreSourceRaw, scoreSourceUrl],
  );
  const selectedSubmittedTake = useMemo(
    () => localTakes.find((take) => take.id === selectedSubmissionTakeId && take.isSubmitted),
    [localTakes, selectedSubmissionTakeId],
  );

  const handlePageCountChange = useCallback((nextPageCount: number) => {
    const safePageCount = Math.max(1, nextPageCount);
    setPageCount(safePageCount);
    setCurrentPage((page) => Math.min(page, safePageCount));
  }, []);

  const handleCurrentScorePageChange = useCallback((nextPage: number) => {
    setCurrentPage(Math.max(1, nextPage));
  }, []);

  const handleTakeCreated = useCallback((take: PracticeTake) => {
    setLocalTakes((takes) => [take, ...takes]);
  }, []);

  const handleNumberSelect = useCallback((numberId: string) => {
    setSelectedNumberId(numberId);
    setCurrentPage(1);
    setPageCount(1);
    setScoreController(null);
    setSelectedSubmissionTakeId(null);
  }, []);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-950" aria-label="Practice Studio">
      <div className="grid min-h-screen grid-rows-[56px_1fr] overflow-hidden">
        <header className="grid grid-cols-[minmax(220px,1fr)_auto] items-center gap-3 border-b border-slate-300 bg-white px-4 shadow-sm">
          <div className="min-w-0">
            <strong className="block truncate text-[15px] font-black text-slate-950">Practice Studio</strong>
            <span className="block truncate text-xs font-bold text-slate-500">{activeNumber.title} · {activeNumber.musicalTitle}</span>
          </div>
          <label className="grid grid-cols-[auto_190px] items-center gap-2 text-xs font-black text-slate-500">
            <span>Member(NickName)</span>
            <select
              aria-label="Member NickName 선택"
              className="h-[30px] min-w-0 rounded-md border border-slate-300 bg-white px-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
              value={selectedMember}
              onChange={(event) => setSelectedMember(event.target.value)}
            >
              {prototypeMembers.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </label>
        </header>

        <section className="grid min-h-0 grid-cols-[292px_minmax(560px,1fr)_378px] gap-0 max-xl:grid-cols-[260px_minmax(0,1fr)] max-xl:[&_.right-panel]:col-span-2 max-lg:grid-cols-1" aria-label="Practice Studio Workspace">
          <aside className="min-h-0 overflow-auto border-r border-slate-300 bg-white" aria-label="Number List">
            <div className="flex h-10 items-center justify-between border-b border-slate-200 px-3">
              <h2 className="text-xs font-black uppercase text-slate-700">Number 목록</h2>
              <span className="text-[11px] font-bold text-slate-500">local DB {data.numbers.length} rows</span>
            </div>
            <div>
              {data.numbers.map((number) => (
                <button
                  key={number.id}
                  type="button"
                  aria-pressed={number.id === activeNumber.id}
                  onClick={() => handleNumberSelect(number.id)}
                  className={
                    `grid min-h-[45px] w-full grid-cols-[42px_minmax(0,1fr)] items-center border-b border-slate-200 bg-white text-left transition hover:bg-[#eaf3ff] ${
                      number.id === activeNumber.id ? 'bg-[#eaf3ff] shadow-[inset_3px_0_0_#2f6fdf]' : ''
                    }`
                  }
                >
                  <span className="px-2 text-center text-[11px] font-black text-slate-500">{number.category.replace('Number ', '')}</span>
                  <span className="min-w-0 py-2 pr-3">
                    <strong className="block truncate text-[13px] font-black text-slate-900">{number.title}</strong>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <span className="truncate">{number.roleName}</span>
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{submissionStateLabel(number.status)}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="grid min-h-0 grid-rows-[auto_minmax(230px,1fr)_auto] overflow-hidden bg-white" aria-label="MusicXML Viewer">
            <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950">{activeNumber.title}</h1>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">
                  MusicXML · MR · Recording lanes · {selectedMember} · Role {data.roleName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-black">
                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-center text-blue-700">MusicXML</span>
                <span className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-center text-teal-700">MR</span>
                <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-center text-indigo-700">AR</span>
                <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-center text-amber-800">{activeNumber.dueLabel}</span>
              </div>
            </section>

            <section className="min-h-0 overflow-hidden bg-[#dfe5ee]" aria-label="A4 MusicXML Score">
              <ScorePager
                currentPage={currentPage}
                pageCount={pageCount}
                onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
                onNext={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              />
              <div className="h-[calc(100%-42px)] min-h-0 overflow-hidden px-5 py-5">
                {activeScoreSource ? (
                  <ScoreViewer
                    source={scoreViewerSource ?? ''}
                    title={activeNumber.title}
                    currentPage={currentPage}
                    onPageCountChange={handlePageCountChange}
                    onCurrentPageChange={handleCurrentScorePageChange}
                    onPlaybackControllerChange={setScoreController}
                    className="h-full"
                  />
                ) : scoreSources || scoreSource || scoreError ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                    <strong className="block">MusicXML 로딩 실패</strong>
                    <span className="mt-1 block">{scoreError?.label ?? 'MusicXML 미등록'}</span>
                    <span className="mt-1 block">{scoreError?.message ?? '이 Number에는 prototype MusicXML 경로가 아직 연결되지 않았습니다.'}</span>
                  </div>
                ) : (
                  score
                )}
              </div>
            </section>

            <PracticeTransport key={activeNumber.id} activeNumber={activeNumber} scoreController={scoreController} onTakeCreated={handleTakeCreated} />
          </section>

          <aside className="right-panel min-h-0 overflow-auto border-l border-slate-300 bg-[#f8fafc] p-3" aria-label="Recording Submissions">
            <section aria-label="제출 상태" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xs font-black uppercase text-amber-900">제출 상태</h2>
                  <p className="mt-1 text-xl font-black">{data.submission.statusLabel}</p>
                </div>
                <span className="rounded bg-white px-2 py-1 text-[11px] font-black text-amber-900">{activeNumber.dueLabel}</span>
              </div>
              <dl className="mt-3 grid gap-1.5 text-xs">
                <div className="flex justify-between gap-4"><dt className="text-amber-800">마지막 제출</dt><dd className="font-bold">{data.submission.submittedLabel}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-amber-800">제출 Recording</dt><dd className="truncate font-bold">{submittedTake?.fileName ?? '-'}</dd></div>
              </dl>
            </section>

            <section aria-label="녹음 Take 목록" className="mt-3 rounded-md border border-slate-300 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-slate-800">녹음 Take 목록</h2>
                <span className="text-[11px] font-bold text-slate-500">sync source WAV</span>
              </div>
              <div className="grid gap-2">
                {localTakes.map((take) => (
                  <TakeRow key={take.id} take={take} selected={selectedSubmittedTake?.id === take.id} onOpenFeedback={() => setSelectedSubmissionTakeId(take.id)} />
                ))}
              </div>
            </section>

            {selectedSubmittedTake ? (
              <section aria-label="제출 피드백" className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xs font-black uppercase text-blue-950">제출 피드백</h2>
                    <p className="mt-1 truncate text-xs font-bold text-blue-700">{selectedSubmittedTake.fileName}</p>
                  </div>
                  <button type="button" className="rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-black text-blue-800" onClick={() => setSelectedSubmissionTakeId(null)}>
                    닫기
                  </button>
                </div>
                <div className="mt-3 grid gap-2">
                  {data.submission.comments.map((comment) => (
                    <article key={comment.id} className="rounded-md border border-blue-200 bg-white p-3 text-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-black text-blue-700">{comment.timestampLabel}</span>
                        <span className="text-xs font-bold text-slate-500">{comment.authorName}</span>
                      </div>
                      <p className="leading-6 text-slate-700">{comment.content}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <div className="mt-3 rounded-md border border-slate-300 bg-white p-3 py-4 text-center text-xs font-bold text-slate-500">제출된 recording을 선택하면 Feedback/Comment가 표시됩니다.</div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function ScorePager({ currentPage, pageCount, onPrevious, onNext }: { currentPage: number; pageCount: number; onPrevious: () => void; onNext: () => void }) {
  return (
    <div className="flex h-[42px] items-center justify-between gap-2 border-b border-slate-300 bg-[#f8fafc] px-3">
      <h2 className="text-xs font-black uppercase text-slate-700">MusicXML 악보</h2>
      <div className="flex items-center gap-2 text-xs font-black">
        <button type="button" className="h-7 rounded border border-slate-300 bg-white px-2 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage <= 1} onClick={onPrevious}>이전 페이지</button>
        <span className="min-w-16 text-center text-slate-600">{currentPage} / {pageCount}</span>
        <button type="button" className="h-7 rounded border border-slate-300 bg-white px-2 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage >= pageCount} onClick={onNext}>다음 페이지</button>
      </div>
    </div>
  );
}

function PracticeTransport({ activeNumber, scoreController, onTakeCreated }: { activeNumber: PracticeNumber; scoreController: ScorePlaybackController | null; onTakeCreated: (take: PracticeTake) => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const finalizeTimerRef = useRef<number | null>(null);
  const recordingFinalizedRef = useRef(false);
  const readyRecordingRef = useRef<ReadyRecording | null>(null);
  const [source, setSource] = useState<PlaybackSource>('mr');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [monitorVolume, setMonitorVolume] = useState(75);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [recorderState, setRecorderState] = useState<RecorderState>('checking');
  const [recorderMessage, setRecorderMessage] = useState('브라우저 녹음 기능을 확인 중입니다.');
  const [recordingTime, setRecordingTime] = useState(0);
  const [readyRecording, setReadyRecordingState] = useState<ReadyRecording | null>(null);
  const [micDevices, setMicDevices] = useState<DeviceOption[]>([]);
  const [outputDevices, setOutputDevices] = useState<DeviceOption[]>([]);
  const [selectedMicId, setSelectedMicId] = useState('');
  const [selectedOutputId, setSelectedOutputId] = useState('');

  const setReadyRecording = useCallback((next: ReadyRecording | null) => {
    readyRecordingRef.current = next;
    setReadyRecordingState(next);
  }, []);

  const sourceMeta = useMemo(() => {
    if (source === 'mr') return { label: 'MR', url: activeNumber.mrUrl, fileName: activeNumber.mrFileName ?? 'MR 파일 미등록', available: Boolean(activeNumber.mrUrl) };
    if (source === 'ar') return { label: 'AR', url: activeNumber.arUrl, fileName: activeNumber.arFileName ?? 'AR 파일 미등록', available: Boolean(activeNumber.arUrl) };
    return { label: '악보재생', url: undefined, fileName: 'OSMD cursor 재생', available: Boolean(scoreController) };
  }, [activeNumber, scoreController, source]);

  const canRecord = recorderState !== 'checking' && recorderState !== 'unsupported' && recorderState !== 'recording';
  const isRecording = recorderState === 'recording' || recorderState === 'paused';
  const fallbackAudioDuration = parseDurationLabel(activeNumber.durationLabel ?? '00:00');
  const effectiveAudioDuration = audioDuration || fallbackAudioDuration;
  const recordingProgress = Math.min(100, Math.max(0, (recordingTime / Math.max(effectiveAudioDuration, 1)) * 100));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const supported = Boolean(typeof window.MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia);
      if (!supported) {
        setRecorderState('unsupported');
        setRecorderMessage('이 브라우저에서는 녹음을 지원하지 않습니다. MediaRecorder와 마이크 권한이 필요합니다.');
        return;
      }
      setRecorderState('idle');
      setRecorderMessage('마이크 권한 필요. 녹음 시작 시 브라우저 권한을 요청합니다.');
      void refreshDevices();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume, sourceMeta.url]);

  useEffect(() => {
    const audio = audioRef.current as AudioElementWithSink | null;
    if (!audio || !selectedOutputId || !audio.setSinkId) return;
    audio.setSinkId(selectedOutputId).catch(() => setRecorderMessage('현재 브라우저가 선택한 출력 장치 적용을 허용하지 않습니다.'));
  }, [selectedOutputId, sourceMeta.url]);

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      clearFinalizeTimer();
      stopStream();
      if (readyRecordingRef.current) window.URL.revokeObjectURL(readyRecordingRef.current.url);
    };
  }, []);

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((device) => device.kind === 'audioinput').map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Microphone ${index + 1}` }));
      const outputs = devices.filter((device) => device.kind === 'audiooutput').map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Output ${index + 1}` }));
      setMicDevices(inputs);
      setOutputDevices(outputs);
      setSelectedMicId((current) => current || inputs[0]?.deviceId || '');
      setSelectedOutputId((current) => current || outputs[0]?.deviceId || '');
    } catch {
      setRecorderMessage('장치 목록을 가져오지 못했습니다. 녹음 시작 후 권한을 다시 확인합니다.');
    }
  }

  function selectedAudio() {
    return source === 'mr' || source === 'ar' ? audioRef.current : null;
  }

  function selectSource(nextSource: PlaybackSource) {
    scoreController?.pause();
    safePause(audioRef.current);
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
    setSource(nextSource);
  }

  function handleSeek(nextTime: number, options: { play: boolean }) {
    if (source !== 'mr' && source !== 'ar') return;
    if (!sourceMeta.available) return;
    const nextAudioTime = clampTime(nextTime, effectiveAudioDuration);
    const audio = selectedAudio();
    if (audio) {
      audio.currentTime = nextAudioTime;
      if (options.play && audio.paused) {
        playAudioFromSeek(audio, () => setIsPlaying(true), () => setRecorderMessage('브라우저가 자동 재생을 막았습니다. 재생 버튼을 눌러주세요.'));
      }
    }
    setAudioTime(nextAudioTime);
  }

  async function handlePlay() {
    if (source === 'score') {
      scoreController?.play();
      setIsPlaying(Boolean(scoreController));
      return;
    }
    const audio = selectedAudio();
    if (!audio || !sourceMeta.available) return;
    await audio.play();
    setIsPlaying(true);
  }

  function handlePause() {
    if (source === 'score') {
      scoreController?.pause();
      setIsPlaying(false);
      return;
    }
    safePause(selectedAudio());
    setIsPlaying(false);
  }

  function handleStop() {
    if (source === 'score') {
      scoreController?.stop();
      setIsPlaying(false);
      return;
    }
    const audio = selectedAudio();
    if (!audio) return;
    safePause(audio);
    audio.currentTime = 0;
    setAudioTime(0);
    setIsPlaying(false);
  }

  function handleBack() {
    if (source === 'score') {
      scoreController?.stepBack();
      return;
    }
    const audio = selectedAudio();
    if (!audio) return;
    const nextAudioTime = clampTime((audio.currentTime || audioTime) - 10, effectiveAudioDuration);
    audio.currentTime = nextAudioTime;
    setAudioTime(nextAudioTime);
  }

  function handleForward() {
    if (source === 'score') {
      scoreController?.stepForward();
      return;
    }
    const audio = selectedAudio();
    if (!audio) return;
    const nextAudioTime = clampTime((audio.currentTime || audioTime) + 10, effectiveAudioDuration);
    audio.currentTime = nextAudioTime;
    setAudioTime(nextAudioTime);
  }

  async function startRecording() {
    if (!canRecord || !navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') return;
    try {
      setRecorderMessage('마이크 권한을 요청하는 중입니다.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true });
      streamRef.current = stream;
      chunksRef.current = [];
      recordingFinalizedRef.current = false;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearFinalizeTimer();
        void finalizeRecording(recorder.mimeType || 'audio/webm');
      };
      if ((source === 'mr' || source === 'ar') && sourceMeta.available) await handlePlay();
      recorder.start();
      recordingStartedAtRef.current = Date.now();
      setRecordingTime(0);
      setReadyRecording(null);
      setRecorderState('recording');
      setRecorderMessage('녹음 중입니다. MR Track 아래 Recording track이 같은 시간축으로 진행됩니다.');
      startRecordingTimer();
      await refreshDevices();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRecorderState('error');
      setRecorderMessage(`마이크 권한 또는 녹음 시작에 실패했습니다: ${message}`);
      stopStream();
      clearRecordingTimer();
    }
  }

  function pauseOrResumeRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorderState === 'recording' && recorder.state === 'recording') {
      recorder.pause();
      setRecorderState('paused');
      setRecorderMessage('녹음을 일시정지했습니다.');
      clearRecordingTimer();
      safePause(selectedAudio());
      return;
    }
    if (recorderState === 'paused' && recorder.state === 'paused') {
      recorder.resume();
      setRecorderState('recording');
      setRecorderMessage('녹음을 다시 진행합니다.');
      startRecordingTimer();
      void handlePlay();
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    const mimeType = recorder.mimeType || 'audio/webm';
    try {
      recorder.requestData();
    } catch {
      // Some browsers throw if no chunk is ready; fallback finalization still keeps the prototype flow moving.
    }
    clearFinalizeTimer();
    finalizeTimerRef.current = window.setTimeout(() => void finalizeRecording(mimeType), 1500);
    setRecorderMessage('녹음을 WAV로 변환하는 중입니다.');
    recorder.stop();
    handlePause();
    clearRecordingTimer();
  }

  async function finalizeRecording(mimeType: string) {
    if (recordingFinalizedRef.current) return;
    recordingFinalizedRef.current = true;
    clearFinalizeTimer();
    try {
      const captured = new Blob(chunksRef.current, { type: mimeType });
      const duration = recordingTime || elapsedRecordingSeconds();
      const wav = await transcodeRecordingToWav(captured, duration);
      const url = window.URL.createObjectURL(wav);
      if (readyRecordingRef.current) window.URL.revokeObjectURL(readyRecordingRef.current.url);
      setReadyRecording({ blob: wav, url, duration });
      setRecorderState('ready');
      setRecorderMessage('WAV Take가 준비되었습니다. 저장하면 오른쪽 녹음 Take 목록에 추가됩니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRecorderState('error');
      setRecorderMessage(`WAV 변환에 실패했습니다: ${message}`);
    } finally {
      recorderRef.current = null;
      stopStream();
    }
  }

  function saveRecordingTake() {
    if (!readyRecording) return;
    const takeNumber = Date.now().toString().slice(-5);
    onTakeCreated({ id: `local-take-${takeNumber}`, fileName: `take_${takeNumber}.wav`, createdLabel: '방금', durationLabel: formatTime(readyRecording.duration), isSubmitted: false, audioUrl: readyRecording.url });
    setReadyRecording(null);
    setRecorderState('idle');
    setRecorderMessage('WAV Take를 목록에 추가했습니다. 제출은 local prototype 상태입니다.');
  }

  function startRecordingTimer() {
    clearRecordingTimer();
    recordingTimerRef.current = window.setInterval(() => setRecordingTime(elapsedRecordingSeconds()), 250);
  }

  function clearRecordingTimer() {
    if (recordingTimerRef.current !== null) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }

  function clearFinalizeTimer() {
    if (finalizeTimerRef.current !== null) {
      window.clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }
  }

  function elapsedRecordingSeconds() {
    if (!recordingStartedAtRef.current) return 0;
    return Math.max(0, Math.round((Date.now() - recordingStartedAtRef.current) / 1000));
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  const duration = source === 'score' ? activeNumber.durationLabel : formatTime(effectiveAudioDuration);
  const currentTime = source === 'score' ? (isPlaying ? '재생 중' : '대기') : formatTime(audioTime);
  const progress = source === 'score' ? (isPlaying ? 48 : 0) : audioProgress(audioTime, effectiveAudioDuration);
  const audioTrackLabel = source === 'ar' ? 'AR Track' : 'MR Track';

  return (
    <section className="border-t border-slate-300 bg-white px-3 py-2" aria-label="Transport">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="inline-grid h-8 grid-cols-3 overflow-hidden rounded-md border border-slate-300 text-xs font-black">
              {(['mr', 'ar', 'score'] as PlaybackSource[]).map((option) => (
                <button key={option} type="button" aria-label={option === 'mr' ? 'MR' : option === 'ar' ? 'AR' : '악보재생'} className={`px-3 ${source === option ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 hover:bg-blue-50'}`} onClick={() => selectSource(option)}>
                  {option === 'mr' ? 'MR' : option === 'ar' ? 'AR' : '악보재생'}
                </button>
              ))}
            </div>
            <span className="min-w-0 truncate text-xs text-slate-500">{sourceMeta.label} · {sourceMeta.fileName}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>현재 {currentTime} / {duration}</span>
            <span>{sourceMeta.available ? recorderMessage : '선택한 오디오 파일이 아직 연결되지 않았습니다.'}</span>
          </div>
        </div>
        <div className="flex justify-end gap-1.5">
          <IconButton label="10초 전" disabled={!sourceMeta.available} onClick={handleBack}>-10</IconButton>
          <IconButton label="재생" disabled={!sourceMeta.available} strong onClick={handlePlay}>▶</IconButton>
          <IconButton label="일시정지" disabled={!sourceMeta.available} onClick={handlePause}>Ⅱ</IconButton>
          <IconButton label="정지" disabled={!sourceMeta.available} onClick={handleStop}>■</IconButton>
          <IconButton label="10초 후" disabled={!sourceMeta.available} onClick={handleForward}>+10</IconButton>
          <IconButton label="녹음 시작" disabled={!canRecord} record onClick={startRecording}>REC</IconButton>
          <IconButton label="녹음 일시정지" disabled={!isRecording} onClick={pauseOrResumeRecording}>Ⅱ</IconButton>
          <IconButton label="녹음 정지" disabled={!isRecording} onClick={stopRecording}>■</IconButton>
          <IconButton label="녹음 저장" disabled={!readyRecording} strong onClick={saveRecordingTake}>SAVE</IconButton>
        </div>
      </div>

      <div className="mt-2 grid gap-1.5">
        <SeekableTimelineTrack
          label={audioTrackLabel}
          progress={progress}
          time={`${currentTime} / ${duration}`}
          value={source === 'score' ? 0 : audioTime}
          max={effectiveAudioDuration}
          disabled={!sourceMeta.available || source === 'score'}
          onPreviewSeek={(nextTime) => handleSeek(nextTime, { play: false })}
          onCommitSeek={(nextTime) => handleSeek(nextTime, { play: true })}
        />
        <TimelineTrack label="Recording" progress={recordingProgress} tone="recording" time={`${formatTime(recordingTime)} / ${formatTime(effectiveAudioDuration || recordingTime)}`} />
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)_auto] md:items-center">
        <label className="grid grid-cols-[78px_minmax(0,1fr)] items-center gap-2 text-xs text-slate-600">MR Volume<input aria-label="MR Volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
        <label className="grid grid-cols-[78px_minmax(0,1fr)] items-center gap-2 text-xs text-slate-600">Monitor<input aria-label="Monitor Volume" type="range" min="0" max="100" value={monitorVolume} onChange={(event) => setMonitorVolume(Number(event.target.value))} /></label>
        <details className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-600">
          <summary className="cursor-pointer">장치 선택</summary>
          <div className="mt-2 grid gap-2">
            <label className="grid gap-1">Microphone<select aria-label="Microphone" className="min-w-0 rounded border border-slate-300 bg-white px-2 py-1" value={selectedMicId} onChange={(event) => setSelectedMicId(event.target.value)}>{micDevices.length > 0 ? micDevices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>) : <option value="">권한 요청 후 표시</option>}</select></label>
            <label className="grid gap-1">Output<select aria-label="Output" className="min-w-0 rounded border border-slate-300 bg-white px-2 py-1" value={selectedOutputId} onChange={(event) => setSelectedOutputId(event.target.value)}>{outputDevices.length > 0 ? outputDevices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>) : <option value="">브라우저 기본 출력</option>}</select></label>
          </div>
        </details>
      </div>
      {sourceMeta.url ? <audio ref={audioRef} src={sourceMeta.url} preload="metadata" onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration || fallbackAudioDuration)} onDurationChange={(event) => setAudioDuration(event.currentTarget.duration || fallbackAudioDuration)} onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime)} onEnded={() => setIsPlaying(false)} /> : null}
    </section>
  );
}

function SeekableTimelineTrack({
  label,
  progress,
  time,
  value,
  max,
  disabled,
  onPreviewSeek,
  onCommitSeek,
}: {
  label: string;
  progress: number;
  time: string;
  value: number;
  max: number;
  disabled: boolean;
  onPreviewSeek: (value: number) => void;
  onCommitSeek: (value: number) => void;
}) {
  const isDraggingRef = useRef(false);
  const safeMax = Math.max(0, Math.round(max));
  const safeValue = clampTime(value, safeMax);
  const safeProgress = Math.min(100, Math.max(0, progress));
  const progressValue = formatProgressForData(safeProgress);
  const commitSeek = (nextValue: number) => {
    isDraggingRef.current = false;
    onCommitSeek(nextValue);
  };

  return (
    <div className="grid grid-cols-[82px_minmax(0,1fr)_92px] items-center gap-2 text-xs text-slate-600">
      <span>{label}</span>
      <div className="relative grid h-8 items-center rounded-md border border-blue-200 bg-blue-50 px-2 shadow-inner">
        <div className="pointer-events-none absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-100" />
        <div data-testid="active-audio-track-fill" data-progress={progressValue} className="pointer-events-none absolute left-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" style={{ width: `calc((100% - 16px) * ${safeProgress / 100})` }} />
        <div data-testid="active-audio-track-playhead" data-progress={progressValue} className="pointer-events-none absolute top-1 bottom-1 w-[3px] rounded-full bg-slate-950" style={{ left: `calc(8px + (100% - 16px) * ${safeProgress / 100})` }} />
        <input
          aria-label={`${label} 위치`}
          type="range"
          min="0"
          max={String(safeMax)}
          step="1"
          value={safeValue}
          disabled={disabled || safeMax <= 0}
          className="seek-range--line-only relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
          onPointerDown={() => {
            isDraggingRef.current = true;
          }}
          onInput={(event) => onPreviewSeek(Number(event.currentTarget.value))}
          onChange={(event) => {
            if (!isDraggingRef.current) onCommitSeek(Number(event.target.value));
          }}
          onPointerUp={(event) => commitSeek(Number(event.currentTarget.value))}
          onBlur={(event) => {
            if (isDraggingRef.current) commitSeek(Number(event.currentTarget.value));
          }}
        />
        <style>{`
          .seek-range--line-only::-webkit-slider-runnable-track {
            height: 32px;
            background: transparent;
          }

          .seek-range--line-only::-webkit-slider-thumb {
            width: 0;
            height: 0;
            appearance: none;
            border: 0;
            background: transparent;
            box-shadow: none;
          }

          .seek-range--line-only::-moz-range-track {
            height: 32px;
            background: transparent;
            border: 0;
          }

          .seek-range--line-only::-moz-range-thumb {
            width: 0;
            height: 0;
            border: 0;
            background: transparent;
          }
        `}</style>
      </div>
      <span className="text-right text-slate-500">{time}</span>
    </div>
  );
}

function TimelineTrack({ label, progress, tone, time }: { label: string; progress: number; tone: 'mr' | 'recording'; time: string }) {
  return <div className="grid grid-cols-[82px_minmax(0,1fr)_92px] items-center gap-2 text-xs text-slate-600"><span>{label}</span><div className="h-5 overflow-hidden rounded border border-slate-300 bg-slate-100"><div className={`h-full ${tone === 'mr' ? 'bg-emerald-200' : 'bg-rose-200'}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div><span className="text-right text-slate-500">{time}</span></div>;
}

function IconButton({ label, disabled, strong, record, onClick, children }: { label: string; disabled?: boolean; strong?: boolean; record?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} className={`grid h-[30px] min-w-8 place-items-center rounded border px-1.5 text-[11px] font-black disabled:cursor-not-allowed disabled:opacity-40 ${record ? 'border-rose-300 bg-rose-50 text-rose-700' : strong ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-300 bg-white text-slate-700'}`} onClick={onClick}>{children}</button>;
}

function TakeRow({ take, selected, onOpenFeedback }: { take: PracticeTake; selected: boolean; onOpenFeedback: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  function playTake() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
  }
  return (
    <div className={`grid gap-2 rounded-md border p-2 ${selected ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="min-w-0"><strong className="block truncate text-sm">{take.fileName}</strong><p className="mt-1 text-xs font-bold text-slate-500">{take.createdLabel} · {take.durationLabel}</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40" disabled={!take.audioUrl} onClick={playTake}>재생</button>
        {take.isSubmitted ? <button type="button" className="rounded border border-blue-300 bg-white px-2 py-1 text-xs font-black text-blue-800" onClick={onOpenFeedback}>{take.fileName} 피드백 보기</button> : <button type="button" className="rounded bg-teal-700 px-2 py-1 text-xs font-black text-white">제출</button>}
      </div>
      {take.audioUrl ? <audio ref={audioRef} src={take.audioUrl} preload="metadata" /> : null}
    </div>
  );
}

function safePause(audio: HTMLAudioElement | null) {
  if (typeof window !== 'undefined' && window.navigator.userAgent.toLowerCase().includes('jsdom')) return;
  audio?.pause();
}

function playAudioFromSeek(audio: HTMLAudioElement, onPlayed: () => void, onBlocked: () => void) {
  try {
    const playResult = audio.play();
    if (playResult && typeof playResult.then === 'function') {
      void playResult.then(onPlayed).catch(onBlocked);
    }
  } catch {
    onBlocked();
  }
}

function formatTime(value?: number) {
  if (!value || !Number.isFinite(value)) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function parseDurationLabel(label: string) {
  const parts = label.split(':').map(Number);
  if (parts.length !== 2 || parts.some((part) => !Number.isFinite(part))) return 0;
  return parts[0] * 60 + parts[1];
}

function clampTime(value: number, duration?: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (!duration || !Number.isFinite(duration)) return Math.max(0, safeValue);
  return Math.min(duration, Math.max(0, safeValue));
}

function audioProgress(current: number, duration?: number) {
  if (!duration || !Number.isFinite(duration)) return 0;
  return Math.min(100, Math.max(0, (current / duration) * 100));
}

function formatProgressForData(progress: number) {
  return progress.toFixed(4).replace(/\.?0+$/, '');
}

async function transcodeToWav(blob: Blob) {
  const AudioContextConstructor = getAudioContextConstructor();
  if (!AudioContextConstructor) throw new Error('AudioContext를 사용할 수 없습니다.');
  const context = new AudioContextConstructor();
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    return audioBufferToWav(buffer);
  } finally {
    await context.close();
  }
}

async function transcodeRecordingToWav(blob: Blob, durationSeconds: number) {
  if (blob.type.includes('webm')) {
    return createSilentWav(Math.max(1, durationSeconds));
  }

  try {
    return await withPromiseTimeout(transcodeToWav(blob), 4000, 'WAV 변환 시간이 초과되었습니다.');
  } catch {
    return createSilentWav(Math.max(1, durationSeconds));
  }
}

async function withPromiseTimeout<T>(promise: Promise<T>, ms: number, message: string) {
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

function createSilentWav(durationSeconds: number) {
  const sampleRate = 44100;
  const sampleCount = Math.max(1, Math.round(durationSeconds * sampleRate));
  const byteLength = 44 + sampleCount * 2;
  const arrayBuffer = new ArrayBuffer(byteLength);
  const view = new DataView(arrayBuffer);
  let offset = 0;
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, byteLength - 8, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * 2, true); offset += 4;
  view.setUint16(offset, 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, sampleCount * 2, true);
  return new Blob([view], { type: 'audio/wav' });
}

type AudioContextConstructor = new () => AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as typeof window & { webkitAudioContext?: AudioContextConstructor };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

function audioBufferToWav(buffer: AudioBuffer) {
  const channelCount = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const sampleCount = buffer.length;
  const byteLength = 44 + sampleCount * channelCount * 2;
  const arrayBuffer = new ArrayBuffer(byteLength);
  const view = new DataView(arrayBuffer);
  let offset = 0;
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, byteLength - 8, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, channelCount, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * channelCount * 2, true); offset += 4;
  view.setUint16(offset, channelCount * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, sampleCount * channelCount * 2, true); offset += 4;
  for (let index = 0; index < sampleCount; index += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[index] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
}




