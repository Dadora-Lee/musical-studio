export type FilePolicy = {
  type: string;
  extensions: string[];
  mimeTypes: string[];
  storage: "drive-or-storage" | "supabase-storage" | "temporary";
  syncSource: boolean;
};

export const FILE_POLICIES: FilePolicy[] = [
  {
    type: "MusicXML",
    extensions: [".musicxml", ".xml", ".mxl"],
    mimeTypes: ["application/vnd.recordare.musicxml+xml", "application/xml", "text/xml", "application/zip"],
    storage: "drive-or-storage",
    syncSource: false
  },
  {
    type: "PDF score",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    storage: "drive-or-storage",
    syncSource: false
  },
  {
    type: "MR audio",
    extensions: [".mp3", ".wav", ".m4a"],
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"],
    storage: "drive-or-storage",
    syncSource: false
  },
  {
    type: "Recording source",
    extensions: [".wav"],
    mimeTypes: ["audio/wav", "audio/x-wav"],
    storage: "supabase-storage",
    syncSource: true
  },
  {
    type: "Recording fallback",
    extensions: [".webm"],
    mimeTypes: ["audio/webm", "video/webm"],
    storage: "temporary",
    syncSource: false
  },
  {
    type: "External export",
    extensions: [".mp3"],
    mimeTypes: ["audio/mpeg"],
    storage: "supabase-storage",
    syncSource: false
  }
];

export function isAllowedFile(extension: string, mimeType: string) {
  const normalizedExtension = extension.toLowerCase();
  const normalizedMime = mimeType.toLowerCase();

  return FILE_POLICIES.some(
    (policy) =>
      policy.extensions.includes(normalizedExtension) &&
      policy.mimeTypes.some((allowedMime) => allowedMime.toLowerCase() === normalizedMime)
  );
}
