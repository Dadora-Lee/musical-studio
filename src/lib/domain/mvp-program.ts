export type RoleName = string;
export type RecordingType = "Practice" | "Homework";
export type SubmissionStatus = "submitted" | "not_submitted" | "not_recorded" | "missing";

export type MusicalNumberCard = {
  id: string;
  title: string;
  category: string;
  playbackLabel: string;
  durationSec: number;
  progressPercent: number;
};

export type PracticeTake = {
  id: string;
  numberId: string;
  roleName: RoleName;
  fileName: string;
  fileExt: "wav";
  mimeType: "audio/wav";
  syncSourceFormat: "wav";
  durationSec: number;
  createdAt: string;
  type: RecordingType;
  note?: string;
};

export type WorkItem = {
  numberId: string;
  numberTitle: string;
  category: string;
  roleName: RoleName;
  dueDate: string;
  recordingCount: number;
  submissionStatus: SubmissionStatus;
};

export type SubmittedRecording = {
  recording: PracticeTake;
  originalTake: PracticeTake;
};

export type DirectorSubmissionRow = {
  memberName: string;
  roleName: RoleName;
  numberTitle: string;
  status: "submitted" | "missing";
  fileName: string | null;
};

const musicalNumbers: MusicalNumberCard[] = [
  {
    id: "number-duet-night",
    title: "빛나는 밤의 약속",
    category: "2막 듀엣",
    playbackLabel: "All cast chorus",
    durationSec: 198,
    progressPercent: 45
  },
  {
    id: "number-opening",
    title: "새로운 아침",
    category: "Opening",
    playbackLabel: "Ensemble chorus",
    durationSec: 242,
    progressPercent: 22
  },
  {
    id: "number-hikaru-solo",
    title: "히카루의 독백",
    category: "Solo",
    playbackLabel: "Hikaru guide",
    durationSec: 161,
    progressPercent: 60
  },
  {
    id: "number-finale",
    title: "마지막 커튼콜",
    category: "Finale",
    playbackLabel: "All cast chorus",
    durationSec: 310,
    progressPercent: 10
  }
];

const practiceTakes: PracticeTake[] = [
  {
    id: "take-hikaru-01",
    numberId: "number-duet-night",
    roleName: "Hikaru",
    fileName: "take_01.wav",
    fileExt: "wav",
    mimeType: "audio/wav",
    syncSourceFormat: "wav",
    durationSec: 193,
    createdAt: "2026-05-23 10:57",
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
  },
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
    id: "take-hikaru-solo-01",
    numberId: "number-hikaru-solo",
    roleName: "Hikaru",
    fileName: "solo_take_01.wav",
    fileExt: "wav",
    mimeType: "audio/wav",
    syncSourceFormat: "wav",
    durationSec: 161,
    createdAt: "2026-05-23 09:30",
    type: "Homework"
  }
];

const workAssignments: WorkItem[] = [
  {
    numberId: "number-duet-night",
    numberTitle: "빛나는 밤의 약속",
    category: "2막 듀엣",
    roleName: "Hikaru",
    dueDate: "2026-05-25",
    recordingCount: 3,
    submissionStatus: "not_submitted"
  },
  {
    numberId: "number-hikaru-solo",
    numberTitle: "히카루의 독백",
    category: "Solo",
    roleName: "Hikaru",
    dueDate: "2026-05-29",
    recordingCount: 1,
    submissionStatus: "submitted"
  },
  {
    numberId: "number-finale",
    numberTitle: "마지막 커튼콜",
    category: "Finale",
    roleName: "Hikaru",
    dueDate: "2026-06-02",
    recordingCount: 0,
    submissionStatus: "not_recorded"
  }
];

const directorRows: DirectorSubmissionRow[] = [
  {
    memberName: "Tani",
    roleName: "Hikaru",
    numberTitle: "빛나는 밤의 약속",
    status: "submitted",
    fileName: "take_03.wav"
  },
  {
    memberName: "Min",
    roleName: "Se-hun",
    numberTitle: "빛나는 밤의 약속",
    status: "submitted",
    fileName: "take_01.wav"
  },
  {
    memberName: "Jin",
    roleName: "Ensemble",
    numberTitle: "빛나는 밤의 약속",
    status: "missing",
    fileName: null
  }
];

export function getDashboardNumbers() {
  return musicalNumbers;
}

export function getWorkItemsForRole(roleName: RoleName) {
  return workAssignments.filter((assignment) => assignment.roleName === roleName);
}

export function getPracticeTakes(numberId: string, roleName: RoleName) {
  return practiceTakes.filter((take) => take.numberId === numberId && take.roleName === roleName);
}

export function submitPracticeTake({
  takeId,
  assignmentId
}: {
  takeId: string;
  assignmentId: string;
}): SubmittedRecording {
  const take = practiceTakes.find((practiceTake) => practiceTake.id === takeId);

  if (!take) {
    throw new Error(`Practice take not found: ${takeId}`);
  }

  return {
    originalTake: take,
    recording: {
      ...take,
      id: `${assignmentId}-${take.id}`,
      type: "Homework"
    }
  };
}

export function getDirectorSubmissionRows(assignmentId: string) {
  if (assignmentId !== "assignment-week1-duet") {
    return [];
  }

  return directorRows;
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
