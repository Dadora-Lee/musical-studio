export type DriveAssetType = "folder" | "musicxml" | "pdf" | "mr" | "recording" | "other";
export type DriveAssetFilter = "all" | Exclude<DriveAssetType, "folder">;
export type DriveStatusFilter = "all" | "unsaved" | "saved" | "imported";
export type DriveSaveTarget = "musicxml_score" | "pdf_score" | "mr_audio" | "reference";

export type DriveFileItem = {
  id: string;
  parentFolderId: string;
  name: string;
  extension: string;
  mimeType: string;
  assetType: DriveAssetType;
  sizeLabel: string;
  modifiedTime: string;
  webViewLink: string;
};

export type SharedPerformanceFolder = {
  id: string;
  name: string;
  sharedBy: string;
  sharedByEmailHint: string;
  source: "sharedWithMe";
  items: DriveFileItem[];
};

export type DriveFilterState = {
  query: string;
  assetType: DriveAssetFilter;
  status: DriveStatusFilter;
  savedIds: string[];
  importedIds: string[];
};

const folderId = "drive-folder-13th-regular-performance";

const sharedPerformanceFolder: SharedPerformanceFolder = {
  id: folderId,
  name: "제13회정기공연",
  sharedBy: "soswolf7",
  sharedByEmailHint: "soswolf7",
  source: "sharedWithMe",
  items: [
    {
      id: "drive-musicxml-duet",
      parentFolderId: folderId,
      name: "빛나는 밤의 약속.musicxml",
      extension: "musicxml",
      mimeType: "application/vnd.recordare.musicxml+xml",
      assetType: "musicxml",
      sizeLabel: "184 KB",
      modifiedTime: "2026-05-21 20:14",
      webViewLink: "https://drive.google.com/file/d/drive-musicxml-duet/view"
    },
    {
      id: "drive-pdf-duet",
      parentFolderId: folderId,
      name: "빛나는 밤의 약속.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
      assetType: "pdf",
      sizeLabel: "2.1 MB",
      modifiedTime: "2026-05-21 20:18",
      webViewLink: "https://drive.google.com/file/d/drive-pdf-duet/view"
    },
    {
      id: "drive-mr-duet",
      parentFolderId: folderId,
      name: "빛나는 밤의 약속_MR.mp3",
      extension: "mp3",
      mimeType: "audio/mpeg",
      assetType: "mr",
      sizeLabel: "6.8 MB",
      modifiedTime: "2026-05-22 09:03",
      webViewLink: "https://drive.google.com/file/d/drive-mr-duet/view"
    },
    {
      id: "drive-guide-opening",
      parentFolderId: folderId,
      name: "Opening_전체합창.wav",
      extension: "wav",
      mimeType: "audio/wav",
      assetType: "recording",
      sizeLabel: "48.2 MB",
      modifiedTime: "2026-05-22 13:40",
      webViewLink: "https://drive.google.com/file/d/drive-guide-opening/view"
    }
  ]
};

export function getSharedPerformanceFolder() {
  return sharedPerformanceFolder;
}

export function filterDriveItems(items: DriveFileItem[], filters: DriveFilterState) {
  const query = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery = query.length === 0 || item.name.toLowerCase().includes(query);
    const matchesAssetType = filters.assetType === "all" || item.assetType === filters.assetType;
    const saved = filters.savedIds.includes(item.id);
    const imported = filters.importedIds.includes(item.id);
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "saved" && saved) ||
      (filters.status === "imported" && imported) ||
      (filters.status === "unsaved" && !saved);

    return matchesQuery && matchesAssetType && matchesStatus;
  });
}

export function classifyDriveAsset(name: string, mimeType: string): DriveAssetType {
  const extension = getExtension(name);

  if (mimeType === "application/vnd.google-apps.folder") return "folder";
  if (extension === "musicxml" || extension === "xml" || mimeType.includes("musicxml")) return "musicxml";
  if (extension === "pdf" || mimeType === "application/pdf") return "pdf";
  if (extension === "mp3" || mimeType === "audio/mpeg") return "mr";
  if (extension === "wav" || mimeType === "audio/wav") return "recording";
  return "other";
}

export function getExtension(name: string) {
  const segments = name.split(".");
  return segments.length > 1 ? segments.at(-1)?.toLowerCase() ?? "" : "";
}

export function getDriveAssetTypeLabel(assetType: DriveAssetType) {
  return {
    folder: "폴더",
    musicxml: "MusicXML",
    pdf: "PDF",
    mr: "MR",
    recording: "WAV",
    other: "기타"
  }[assetType];
}

export function getDriveAssetIcon(assetType: DriveAssetType) {
  return {
    folder: "DIR",
    musicxml: "XML",
    pdf: "PDF",
    mr: "MP3",
    recording: "WAV",
    other: "FILE"
  }[assetType];
}

export function getSaveTargetLabel(target: DriveSaveTarget) {
  return {
    musicxml_score: "Musical Number 악보",
    pdf_score: "Musical Number PDF",
    mr_audio: "MR / Guide Audio",
    reference: "Reference / 기타"
  }[target];
}

export function getRecommendedSaveTarget(assetType: DriveAssetType): DriveSaveTarget {
  if (assetType === "musicxml") return "musicxml_score";
  if (assetType === "pdf") return "pdf_score";
  if (assetType === "mr" || assetType === "recording") return "mr_audio";
  return "reference";
}
