export type AppConfig = {
  siteUrl: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  googleClientId?: string;
  googleDriveDefaultFolderId?: string;
  allowedGoogleEmails: string[];
  allowedGoogleDomains: string[];
};

export function getAppConfig(): AppConfig {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    googleDriveDefaultFolderId: process.env.GOOGLE_DRIVE_DEFAULT_FOLDER_ID,
    allowedGoogleEmails: splitEnv(process.env.ALLOWED_GOOGLE_EMAILS),
    allowedGoogleDomains: splitEnv(process.env.ALLOWED_GOOGLE_DOMAINS)
  };
}

function splitEnv(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}
