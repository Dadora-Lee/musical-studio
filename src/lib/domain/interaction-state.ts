import type { DriveAssetFilter, DriveSaveTarget, DriveStatusFilter } from "./google-drive";
import type { PracticeTake, SubmissionStatus } from "./mvp-program";

export type DashboardView = "dashboard" | "work" | "submit" | "drive" | "director" | "admin";
export type RecordingState = "idle" | "recording" | "stopped";

export type InteractionState = {
  activeView: DashboardView;
  selectedNumberId: string;
  selectedRole: string;
  playingTargetId: string | null;
  scorePage: number;
  scorePageCount: number;
  recordingState: RecordingState;
  practiceTakes: PracticeTake[];
  submissionStatus: SubmissionStatus;
  openCommentsFor: string | null;
  driveSearchQuery: string;
  driveAssetFilter: DriveAssetFilter;
  driveStatusFilter: DriveStatusFilter;
  selectedDriveFileIds: string[];
  savedDriveFileIds: string[];
  importedDriveFileIds: string[];
  previewDriveFileId: string | null;
  pendingDriveSaveFileIds: string[];
  driveSaveTargetByFileId: Record<string, DriveSaveTarget>;
  toast: string | null;
};

export type InteractionAction =
  | { type: "select-view"; view: DashboardView }
  | { type: "select-number"; numberId: string }
  | { type: "select-role"; role: InteractionState["selectedRole"] }
  | { type: "toggle-playback"; targetId: string }
  | { type: "change-score-page"; direction: "previous" | "next" }
  | { type: "start-recording" }
  | { type: "stop-recording" }
  | { type: "submit-latest-take" }
  | { type: "toggle-comments"; recordingId: string }
  | { type: "remind-missing-member"; memberName: string }
  | { type: "set-drive-search"; query: string }
  | { type: "set-drive-asset-filter"; assetType: DriveAssetFilter }
  | { type: "set-drive-status-filter"; status: DriveStatusFilter }
  | { type: "toggle-drive-file-selection"; fileId: string }
  | { type: "set-drive-file-selection"; fileIds: string[] }
  | { type: "clear-drive-file-selection" }
  | { type: "preview-drive-file"; fileId: string }
  | { type: "open-drive-save"; fileIds: string[] }
  | { type: "cancel-drive-save" }
  | { type: "confirm-drive-save"; target: DriveSaveTarget }
  | { type: "save-drive-file"; fileId: string; target?: DriveSaveTarget }
  | { type: "import-drive-file"; fileId: string }
  | { type: "import-drive-files"; fileIds: string[] };

export function createInitialInteractionState(initialView: DashboardView = "dashboard"): InteractionState {
  return {
    activeView: initialView,
    selectedNumberId: "number-duet-night",
    selectedRole: "Hikaru",
    playingTargetId: null,
    scorePage: 1,
    scorePageCount: 6,
    recordingState: "idle",
    practiceTakes: [
      {
        id: "take-hikaru-03",
        numberId: "number-duet-night",
        roleName: "Hikaru",
        fileName: "take_03.wav",
        fileExt: "wav",
        mimeType: "audio/wav",
        syncSourceFormat: "wav",
        durationSec: 198,
        createdAt: "2026-05-23 11:42",
        type: "Practice"
      },
      {
        id: "take-hikaru-02",
        numberId: "number-duet-night",
        roleName: "Hikaru",
        fileName: "take_02.wav",
        fileExt: "wav",
        mimeType: "audio/wav",
        syncSourceFormat: "wav",
        durationSec: 195,
        createdAt: "2026-05-23 11:18",
        type: "Practice",
        note: "pitch 불안정"
      }
    ],
    submissionStatus: "not_submitted",
    openCommentsFor: null,
    driveSearchQuery: "",
    driveAssetFilter: "all",
    driveStatusFilter: "all",
    selectedDriveFileIds: [],
    savedDriveFileIds: [],
    importedDriveFileIds: [],
    previewDriveFileId: null,
    pendingDriveSaveFileIds: [],
    driveSaveTargetByFileId: {},
    toast: null
  };
}

export function reduceInteraction(state: InteractionState, action: InteractionAction): InteractionState {
  switch (action.type) {
    case "select-view":
      return {
        ...state,
        activeView: action.view,
        toast: `${viewLabel(action.view)} view visible`
      };
    case "select-number":
      return {
        ...state,
        selectedNumberId: action.numberId,
        scorePage: 1,
        toast: "넘버를 선택했습니다."
      };
    case "select-role":
      return {
        ...state,
        selectedRole: action.role,
        toast: `${action.role} 배역을 보고 있습니다.`
      };
    case "toggle-playback":
      return {
        ...state,
        playingTargetId: state.playingTargetId === action.targetId ? null : action.targetId,
        toast: state.playingTargetId === action.targetId ? "재생을 멈췄습니다." : "재생을 시작했습니다."
      };
    case "change-score-page": {
      const delta = action.direction === "next" ? 1 : -1;
      const nextPage = Math.min(state.scorePageCount, Math.max(1, state.scorePage + delta));
      return {
        ...state,
        scorePage: nextPage,
        toast: `악보 ${nextPage}페이지`
      };
    }
    case "start-recording":
      return {
        ...state,
        recordingState: "recording",
        toast: "WAV 녹음을 시작했습니다."
      };
    case "stop-recording": {
      if (state.recordingState !== "recording") {
        return {
          ...state,
          recordingState: "stopped",
          toast: "녹음 중인 take가 없습니다."
        };
      }

      const takeNumber = state.practiceTakes.length + 1;
      const newTake: PracticeTake = {
        id: `local-take-${takeNumber}`,
        numberId: state.selectedNumberId,
        roleName: state.selectedRole,
        fileName: `take_${String(takeNumber).padStart(2, "0")}.wav`,
        fileExt: "wav",
        mimeType: "audio/wav",
        syncSourceFormat: "wav",
        durationSec: 198,
        createdAt: "방금 전",
        type: "Practice"
      };

      return {
        ...state,
        recordingState: "stopped",
        practiceTakes: [newTake, ...state.practiceTakes],
        submissionStatus: "not_submitted",
        toast: `${newTake.fileName} 저장 완료`
      };
    }
    case "submit-latest-take": {
      const [latestTake, ...rest] = state.practiceTakes;

      if (!latestTake) {
        return {
          ...state,
          submissionStatus: "not_recorded",
          toast: "제출할 녹음이 없습니다."
        };
      }

      return {
        ...state,
        practiceTakes: [{ ...latestTake, type: "Homework" }, ...rest],
        submissionStatus: "submitted",
        toast: `${latestTake.fileName} 숙제 제출 완료`
      };
    }
    case "toggle-comments":
      return {
        ...state,
        openCommentsFor: state.openCommentsFor === action.recordingId ? null : action.recordingId,
        toast: state.openCommentsFor === action.recordingId ? "코멘트를 닫았습니다." : "코멘트를 열었습니다."
      };
    case "remind-missing-member":
      return {
        ...state,
        toast: `${action.memberName}에게 리마인드를 보냈습니다.`
      };
    case "set-drive-search":
      return {
        ...state,
        driveSearchQuery: action.query
      };
    case "set-drive-asset-filter":
      return {
        ...state,
        driveAssetFilter: action.assetType
      };
    case "set-drive-status-filter":
      return {
        ...state,
        driveStatusFilter: action.status
      };
    case "toggle-drive-file-selection":
      return {
        ...state,
        selectedDriveFileIds: toggleValue(state.selectedDriveFileIds, action.fileId)
      };
    case "set-drive-file-selection":
      return {
        ...state,
        selectedDriveFileIds: unique(action.fileIds)
      };
    case "clear-drive-file-selection":
      return {
        ...state,
        selectedDriveFileIds: []
      };
    case "preview-drive-file":
      return {
        ...state,
        previewDriveFileId: action.fileId
      };
    case "open-drive-save":
      return {
        ...state,
        pendingDriveSaveFileIds: unique(action.fileIds),
        toast: `${action.fileIds.length}개 파일의 저장 위치를 선택하세요.`
      };
    case "cancel-drive-save":
      return {
        ...state,
        pendingDriveSaveFileIds: []
      };
    case "confirm-drive-save": {
      const ids = state.pendingDriveSaveFileIds;
      return {
        ...state,
        savedDriveFileIds: unique([...state.savedDriveFileIds, ...ids]),
        driveSaveTargetByFileId: ids.reduce(
          (targets, id) => ({
            ...targets,
            [id]: action.target
          }),
          state.driveSaveTargetByFileId
        ),
        pendingDriveSaveFileIds: [],
        toast: `${ids.length}개 Drive 파일 메타데이터를 저장했습니다.`
      };
    }
    case "save-drive-file": {
      const target = action.target ?? "reference";
      return {
        ...state,
        savedDriveFileIds: unique([...state.savedDriveFileIds, action.fileId]),
        driveSaveTargetByFileId: {
          ...state.driveSaveTargetByFileId,
          [action.fileId]: target
        },
        toast: "Drive 파일 메타데이터를 저장했습니다."
      };
    }
    case "import-drive-file":
      return {
        ...state,
        importedDriveFileIds: unique([...state.importedDriveFileIds, action.fileId]),
        toast: "Drive 파일을 받아오기 목록에 추가했습니다."
      };
    case "import-drive-files":
      return {
        ...state,
        importedDriveFileIds: unique([...state.importedDriveFileIds, ...action.fileIds]),
        toast: `${action.fileIds.length}개 Drive 파일을 받아오기 목록에 추가했습니다.`
      };
    default:
      return state;
  }
}

export function viewLabel(view: DashboardView) {
  return {
    dashboard: "Dashboard",
    work: "Work",
    submit: "Submit",
    drive: "Google Drive",
    director: "Director View",
    admin: "Admin"
  }[view];
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function unique(values: string[]) {
  return [...new Set(values)];
}
