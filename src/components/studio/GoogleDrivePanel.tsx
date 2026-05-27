"use client";

import { FolderSync, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Dispatch } from "react";
import type { InteractionAction, InteractionState } from "@/lib/domain/interaction-state";
import {
  classifyDriveAsset,
  filterDriveItems,
  getDriveAssetIcon,
  getDriveAssetTypeLabel,
  getExtension,
  getRecommendedSaveTarget,
  getSaveTargetLabel,
  getSharedPerformanceFolder,
  type DriveAssetFilter,
  type DriveFileItem,
  type DriveSaveTarget,
  type DriveStatusFilter,
  type SharedPerformanceFolder
} from "@/lib/domain/google-drive";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const assetFilters: { value: DriveAssetFilter; label: string }[] = [
  { value: "all", label: "전체 타입" },
  { value: "musicxml", label: "MusicXML" },
  { value: "pdf", label: "PDF" },
  { value: "mr", label: "MR" },
  { value: "recording", label: "WAV" },
  { value: "other", label: "기타" }
];

const statusFilters: { value: DriveStatusFilter; label: string }[] = [
  { value: "all", label: "전체 상태" },
  { value: "unsaved", label: "미저장" },
  { value: "saved", label: "저장됨" },
  { value: "imported", label: "받아옴" }
];

const saveTargets: DriveSaveTarget[] = ["musicxml_score", "pdf_score", "mr_audio", "reference"];

export function GoogleDrivePanel({
  dispatch,
  state
}: {
  dispatch: Dispatch<InteractionAction>;
  state: InteractionState;
}) {
  const [folder, setFolder] = useState<SharedPerformanceFolder>(getSharedPerformanceFolder());
  const [driveMode, setDriveMode] = useState<"mock" | "real">("mock");
  const [driveError, setDriveError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const filteredItems = useMemo(
    () =>
      filterDriveItems(folder.items, {
        query: state.driveSearchQuery,
        assetType: state.driveAssetFilter,
        status: state.driveStatusFilter,
        savedIds: state.savedDriveFileIds,
        importedIds: state.importedDriveFileIds
      }),
    [folder.items, state.driveAssetFilter, state.driveSearchQuery, state.driveStatusFilter, state.importedDriveFileIds, state.savedDriveFileIds]
  );
  const previewItem = folder.items.find((item) => item.id === state.previewDriveFileId) ?? filteredItems[0] ?? null;
  const allFilteredIds = filteredItems.map((item) => item.id);
  const selectedVisibleCount = allFilteredIds.filter((id) => state.selectedDriveFileIds.includes(id)).length;
  const allVisibleSelected = filteredItems.length > 0 && selectedVisibleCount === filteredItems.length;
  const pendingSaveItems = folder.items.filter((item) => state.pendingDriveSaveFileIds.includes(item.id));
  const recommendedTarget = pendingSaveItems[0] ? getRecommendedSaveTarget(pendingSaveItems[0].assetType) : "reference";

  async function connectGoogleDrive() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    setDriveError(null);

    if (!clientId) {
      setDriveError("환경변수 NEXT_PUBLIC_GOOGLE_CLIENT_ID가 필요합니다.");
      return;
    }

    setIsConnecting(true);
    try {
      await loadGoogleIdentityScript();
      const accessToken = await requestDriveAccessToken(clientId);
      const realFolder = await fetchSharedPerformanceFolder(accessToken);
      setFolder(realFolder);
      setDriveMode("real");
    } catch (error) {
      setDriveError(error instanceof Error ? error.message : "Google Drive 연동 중 오류가 발생했습니다.");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <section className="grid gap-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black">Google Drive · 공유 문서함</h2>
            <p className="mt-1 text-sm text-slate-600">
              Drive 연결 권한을 추가로 허용하면, 공유자 <strong>{folder.sharedBy}</strong>가 공유한 <strong>{folder.name}</strong> 폴더만 표시합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-black"
              onClick={connectGoogleDrive}
              type="button"
            >
              <FolderSync className="h-4 w-4" aria-hidden />
              {isConnecting ? "Drive 연결 중" : "Drive 연결"}
            </button>
            <Badge tone={driveMode === "real" ? "green" : "blue"}>{driveMode === "real" ? "real API" : "mock fallback"}</Badge>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge>추가 권한: drive.readonly</Badge>
          <Badge>NEXT_PUBLIC_GOOGLE_CLIENT_ID</Badge>
        </div>
        {driveError ? <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{driveError}</p> : null}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="grid gap-3 border-b border-slate-200 p-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h3 className="font-black">{folder.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  sharedWithMe · owner contains soswolf7 · folderId: {folder.id}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black disabled:opacity-40"
                  disabled={state.selectedDriveFileIds.length === 0}
                  onClick={() => dispatch({ type: "open-drive-save", fileIds: state.selectedDriveFileIds })}
                  type="button"
                >
                  선택 저장 ({state.selectedDriveFileIds.length})
                </button>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black disabled:opacity-40"
                  disabled={state.selectedDriveFileIds.length === 0}
                  onClick={() => dispatch({ type: "import-drive-files", fileIds: state.selectedDriveFileIds })}
                  type="button"
                >
                  선택 받아오기
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_150px_150px]">
              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4" aria-hidden />
                <input
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                  onChange={(event) => dispatch({ type: "set-drive-search", query: event.target.value })}
                  placeholder="파일명 검색"
                  type="search"
                  value={state.driveSearchQuery}
                />
              </label>
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
                onChange={(event) => dispatch({ type: "set-drive-asset-filter", assetType: event.target.value as DriveAssetFilter })}
                value={state.driveAssetFilter}
              >
                {assetFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
                onChange={(event) => dispatch({ type: "set-drive-status-filter", status: event.target.value as DriveStatusFilter })}
                value={state.driveStatusFilter}
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="w-10 border-b border-slate-200 p-2">
                    <input
                      aria-label="전체 선택"
                      checked={allVisibleSelected}
                      onChange={() =>
                        dispatch({
                          type: "set-drive-file-selection",
                          fileIds: allVisibleSelected
                            ? state.selectedDriveFileIds.filter((id) => !allFilteredIds.includes(id))
                            : [...state.selectedDriveFileIds, ...allFilteredIds]
                        })
                      }
                      type="checkbox"
                    />
                  </th>
                  <th className="w-[320px] border-b border-slate-200 p-2">파일명</th>
                  <th className="w-24 border-b border-slate-200 p-2">타입</th>
                  <th className="w-20 border-b border-slate-200 p-2">확장자</th>
                  <th className="w-24 border-b border-slate-200 p-2">크기</th>
                  <th className="w-32 border-b border-slate-200 p-2">수정일</th>
                  <th className="w-28 border-b border-slate-200 p-2">상태</th>
                  <th className="w-48 border-b border-slate-200 p-2">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const saved = state.savedDriveFileIds.includes(item.id);
                  const imported = state.importedDriveFileIds.includes(item.id);
                  const selected = state.selectedDriveFileIds.includes(item.id);

                  return (
                    <tr key={item.id} className={selected ? "bg-teal-50" : undefined}>
                      <td className="border-b border-slate-200 p-2">
                        <input
                          aria-label={`${item.name} 선택`}
                          checked={selected}
                          onChange={() => dispatch({ type: "toggle-drive-file-selection", fileId: item.id })}
                          type="checkbox"
                        />
                      </td>
                      <td className="truncate border-b border-slate-200 p-2 font-bold" title={item.name}>
                        {item.name}
                      </td>
                      <td className="border-b border-slate-200 p-2">
                        <span
                          className="inline-flex h-7 min-w-12 items-center justify-center rounded bg-slate-900 px-2 text-[11px] font-black text-white"
                          title={`MIME: ${item.mimeType}`}
                        >
                          {getDriveAssetIcon(item.assetType)}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 p-2 uppercase">{item.extension}</td>
                      <td className="border-b border-slate-200 p-2">{item.sizeLabel}</td>
                      <td className="border-b border-slate-200 p-2">{item.modifiedTime.slice(0, 16)}</td>
                      <td className="border-b border-slate-200 p-2">
                        <div className="flex flex-wrap gap-1">
                          {saved ? <Badge tone="green">저장됨</Badge> : <Badge>대기</Badge>}
                          {imported ? <Badge tone="blue">받아옴</Badge> : null}
                        </div>
                      </td>
                      <td className="border-b border-slate-200 p-2">
                        <div className="flex gap-1">
                          <button className="rounded border border-slate-300 px-2 py-1 font-bold" onClick={() => dispatch({ type: "preview-drive-file", fileId: item.id })} type="button">
                            미리보기
                          </button>
                          <button className="rounded border border-slate-300 px-2 py-1 font-bold" onClick={() => dispatch({ type: "open-drive-save", fileIds: [item.id] })} type="button">
                            저장
                          </button>
                          <button className="rounded border border-slate-300 px-2 py-1 font-bold" onClick={() => dispatch({ type: "import-drive-file", fileId: item.id })} type="button">
                            받아오기
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DrivePreview item={previewItem} />
      </div>

      {state.pendingDriveSaveFileIds.length > 0 ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 p-4">
              <h3 className="text-lg font-black">저장 위치 선택</h3>
              <p className="mt-1 text-sm text-slate-600">{state.pendingDriveSaveFileIds.length}개 파일을 어디에 저장할지 선택하세요.</p>
            </div>
            <div className="grid gap-2 p-4">
              {saveTargets.map((target) => (
                <button
                  key={target}
                  className={`rounded-md border p-3 text-left text-sm font-black ${
                    target === recommendedTarget ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200"
                  }`}
                  onClick={() => dispatch({ type: "confirm-drive-save", target })}
                  type="button"
                >
                  {getSaveTargetLabel(target)}
                  {target === recommendedTarget ? <span className="ml-2 text-xs text-teal-700">추천</span> : null}
                </button>
              ))}
            </div>
            <div className="flex justify-end border-t border-slate-200 p-3">
              <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black" onClick={() => dispatch({ type: "cancel-drive-save" })} type="button">
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DrivePreview({ item }: { item: DriveFileItem | null }) {
  if (!item) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-black">미리보기</h3>
        <p className="mt-2 text-sm text-slate-500">파일을 선택하면 미리보기가 표시됩니다.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">미리보기</h3>
          <p className="mt-1 text-sm font-bold text-slate-800">{item.name}</p>
        </div>
        <span className="rounded bg-slate-900 px-2 py-1 text-[11px] font-black text-white" title={`MIME: ${item.mimeType}`}>
          {getDriveAssetIcon(item.assetType)}
        </span>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {item.assetType === "pdf" ? <PreviewBox title="PDF 악보" body="Google Drive PDF preview를 연결할 파일입니다." /> : null}
        {item.assetType === "musicxml" ? <PreviewBox title="MusicXML 악보" body="OSMD 악보 렌더링 소스로 저장할 파일입니다." /> : null}
        {item.assetType === "mr" || item.assetType === "recording" ? (
          <div>
            <PreviewBox title="Audio Preview" body="실제 Drive 연동 후 signed/export URL로 오디오 미리듣기를 연결합니다." />
            <div className="mt-3 h-2 rounded bg-slate-200">
              <div className="h-full w-2/5 rounded bg-teal-600" />
            </div>
          </div>
        ) : null}
        {item.assetType === "other" ? <PreviewBox title="기타 파일" body="파일 메타데이터를 확인한 뒤 Reference로 저장할 수 있습니다." /> : null}
      </div>
      <dl className="mt-4 grid gap-2 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">분류</dt>
          <dd className="font-bold">{getDriveAssetTypeLabel(item.assetType)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">확장자</dt>
          <dd className="font-bold uppercase">{item.extension}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">MIME</dt>
          <dd className="max-w-48 truncate font-bold" title={item.mimeType}>
            {item.mimeType}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

function PreviewBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-36 place-items-center rounded-md border border-dashed border-slate-300 bg-white p-4 text-center">
      <div>
        <strong className="block text-sm">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{body}</span>
      </div>
    </div>
  );
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "blue" }) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700"
  }[tone];

  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-black ${toneClass}`}>{children}</span>;
}

async function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-identity]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Identity script load failed.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity script load failed."));
    document.head.appendChild(script);
  });
}

async function requestDriveAccessToken(clientId: string) {
  return new Promise<string>((resolve, reject) => {
    const oauth = window.google?.accounts?.oauth2;
    if (!oauth) {
      reject(new Error("Google Identity Services를 사용할 수 없습니다."));
      return;
    }

    const tokenClient = oauth.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error ?? "Google Drive access token을 받지 못했습니다."));
          return;
        }
        resolve(response.access_token);
      }
    });

    tokenClient.requestAccessToken();
  });
}

async function fetchSharedPerformanceFolder(accessToken: string): Promise<SharedPerformanceFolder> {
  const folderQuery = "sharedWithMe = true and trashed = false and mimeType = 'application/vnd.google-apps.folder' and name = '제13회정기공연'";
  const folderUrl = driveListUrl(folderQuery, "files(id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress))");
  const folderResponse = await fetch(folderUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!folderResponse.ok) throw new Error("Google Drive 공유 폴더 조회에 실패했습니다.");
  const folderJson = (await folderResponse.json()) as GoogleDriveListResponse;
  const folder = folderJson.files.find((file) =>
    file.owners?.some((owner) => `${owner.displayName ?? ""} ${owner.emailAddress ?? ""}`.toLowerCase().includes("soswolf7"))
  );
  if (!folder) throw new Error("soswolf7이 공유한 제13회정기공연 폴더를 찾지 못했습니다.");

  const fileQuery = `'${folder.id}' in parents and trashed = false`;
  const fileUrl = driveListUrl(fileQuery, "files(id,name,mimeType,modifiedTime,webViewLink,size)");
  const fileResponse = await fetch(fileUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!fileResponse.ok) throw new Error("Google Drive 폴더 파일 조회에 실패했습니다.");
  const fileJson = (await fileResponse.json()) as GoogleDriveListResponse;

  return {
    id: folder.id,
    name: folder.name,
    sharedBy: "soswolf7",
    sharedByEmailHint: "soswolf7",
    source: "sharedWithMe",
    items: fileJson.files.map((file) => toDriveFileItem(file, folder.id))
  };
}

function driveListUrl(query: string, fields: string) {
  const params = new URLSearchParams({
    q: query,
    fields,
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    pageSize: "100",
    orderBy: "name_natural"
  });
  return `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
}

type GoogleDriveListResponse = {
  files: {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime?: string;
    webViewLink?: string;
    size?: string;
    owners?: { displayName?: string; emailAddress?: string }[];
  }[];
};

function toDriveFileItem(file: GoogleDriveListResponse["files"][number], parentFolderId: string): DriveFileItem {
  const extension = getExtension(file.name);
  const assetType = classifyDriveAsset(file.name, file.mimeType);

  return {
    id: file.id,
    parentFolderId,
    name: file.name,
    extension,
    mimeType: file.mimeType,
    assetType,
    sizeLabel: formatBytes(file.size),
    modifiedTime: (file.modifiedTime ?? "").replace("T", " ").replace("Z", ""),
    webViewLink: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`
  };
}

function formatBytes(value?: string) {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
