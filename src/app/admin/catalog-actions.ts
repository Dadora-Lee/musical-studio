"use server";

import { revalidatePath } from "next/cache";
import { requireAppRole } from "@/lib/auth/guards";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import type { NumberAssetType } from "@/lib/admin/catalog";
import type { CatalogActionState } from "@/components/studio/CatalogActionForm";

const assetTypes: NumberAssetType[] = ["score_pdf", "score_xml", "mr_audio", "ar_audio", "guide_audio", "reference"];

export async function createProduction(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "공연이 등록되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    const title = readRequired(formData, "title");
    const seasonLabel = readOptional(formData, "seasonLabel");

    await supabase.from("productions").insert({
      title,
      season_label: seasonLabel,
      is_active: true
    });
  });
}

export async function updateProduction(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "공연 정보가 수정되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    await supabase
      .from("productions")
      .update({
        title: readRequired(formData, "title"),
        season_label: readOptional(formData, "seasonLabel"),
        is_active: readBoolean(formData, "isActive"),
        updated_at: new Date().toISOString()
      })
      .eq("id", readRequired(formData, "id"));
  });
}

export async function deactivateProduction(state: CatalogActionState, formData: FormData) {
  return deactivateRow(state, "productions", "공연이 비활성화되었습니다.", formData);
}

export async function createMusicalRole(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "배역이 등록되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    const displayName = readRequired(formData, "displayName");
    const roleKey = slugify(readOptional(formData, "roleKey") || displayName);
    const description = readOptional(formData, "description");

    await supabase.from("musical_roles").insert({
      role_key: roleKey,
      display_name: displayName,
      description,
      is_active: true
    });
  });
}

export async function updateMusicalRole(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "배역 정보가 수정되었습니다. role_id 참조는 그대로 유지됩니다.", async () => {
    const supabase = await requireAdminSupabase();
    await supabase
      .from("musical_roles")
      .update({
        role_key: slugify(readRequired(formData, "roleKey")),
        display_name: readRequired(formData, "displayName"),
        description: readOptional(formData, "description"),
        is_active: readBoolean(formData, "isActive"),
        updated_at: new Date().toISOString()
      })
      .eq("id", readRequired(formData, "id"));
  });
}

export async function deactivateMusicalRole(state: CatalogActionState, formData: FormData) {
  return deactivateRow(state, "musical_roles", "배역이 비활성화되었습니다.", formData);
}

export async function createMusicalNumber(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "넘버가 등록되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    const productionId = readRequired(formData, "productionId");
    const title = readRequired(formData, "title");
    const category = readOptional(formData, "category");
    const sortOrder = Number(readOptional(formData, "sortOrder") || 0);
    const durationSec = Number(readOptional(formData, "durationSec") || 0);

    await supabase.from("musical_numbers").insert({
      production_id: productionId,
      title,
      category,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      duration_sec: Number.isFinite(durationSec) ? durationSec : 0,
      is_active: true
    });
  });
}

export async function updateMusicalNumber(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "넘버 정보가 수정되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    await supabase
      .from("musical_numbers")
      .update({
        production_id: readRequired(formData, "productionId"),
        title: readRequired(formData, "title"),
        category: readOptional(formData, "category"),
        sort_order: readNumber(formData, "sortOrder"),
        duration_sec: readNumber(formData, "durationSec"),
        is_active: readBoolean(formData, "isActive"),
        updated_at: new Date().toISOString()
      })
      .eq("id", readRequired(formData, "id"));
  });
}

export async function deactivateMusicalNumber(state: CatalogActionState, formData: FormData) {
  return deactivateRow(state, "musical_numbers", "넘버가 비활성화되었습니다.", formData);
}

export async function linkNumberRole(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "배역이 넘버에 연결되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    const numberId = readRequired(formData, "numberId");
    const roleId = readRequired(formData, "roleId");

    await supabase.from("number_roles").upsert(
      {
        number_id: numberId,
        role_id: roleId,
        is_required: true
      },
      { onConflict: "number_id,role_id" }
    );
  });
}

export async function linkAllNumberRoles(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "활성 배역 전체가 넘버에 연결되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    const numberId = readRequired(formData, "numberId");
    const { data: roles } = await supabase.from("musical_roles").select("id").eq("is_active", true).returns<{ id: string }[]>();

    if (!roles || roles.length === 0) throw new Error("No active roles to link.");

    await supabase.from("number_roles").upsert(
      roles.map((role) => ({
        number_id: numberId,
        role_id: role.id,
        is_required: true
      })),
      { onConflict: "number_id,role_id" }
    );
  });
}

export async function createNumberAsset(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "파일 메타데이터가 등록되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    await supabase.from("number_assets").insert(await readAssetPayload(formData, supabase));
  });
}

export async function updateNumberAsset(state: CatalogActionState, formData: FormData) {
  return runCatalogAction(state, "파일 메타데이터가 수정되었습니다.", async () => {
    const supabase = await requireAdminSupabase();
    await supabase
      .from("number_assets")
      .update({
        ...(await readAssetPayload(formData, supabase)),
        is_active: readBoolean(formData, "isActive"),
        updated_at: new Date().toISOString()
      })
      .eq("id", readRequired(formData, "id"));
  });
}

export async function deactivateNumberAsset(state: CatalogActionState, formData: FormData) {
  return deactivateRow(state, "number_assets", "파일이 비활성화되었습니다.", formData);
}

async function runCatalogAction(state: CatalogActionState, message: string, work: () => Promise<void>): Promise<CatalogActionState> {
  try {
    await work();
    revalidatePath("/admin");
    return { ok: true, message, resetKey: state.resetKey + 1 };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.", resetKey: state.resetKey };
  }
}

async function deactivateRow(state: CatalogActionState, table: "productions" | "musical_roles" | "musical_numbers" | "number_assets", message: string, formData: FormData) {
  return runCatalogAction(state, message, async () => {
    const supabase = await requireAdminSupabase();
    await supabase.from(table).update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", readRequired(formData, "id"));
  });
}

async function readAssetPayload(formData: FormData, supabase: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>) {
  const numberId = readRequired(formData, "numberId");
  const uploaded = await uploadAssetFile(formData, supabase, numberId);
  const fileName = uploaded?.displayName ?? readRequired(formData, "fileName");
  const durationSec = readOptional(formData, "durationSec");
  const payload = {
    number_id: numberId,
    asset_type: readAssetType(formData),
    file_name: fileName,
    file_ext: uploaded?.fileExt ?? normalizeExt(readOptional(formData, "fileExt") || fileName),
    mime_type: uploaded?.mimeType ?? readRequired(formData, "mimeType"),
    storage_provider: "supabase",
    file_url: uploaded?.publicUrl ?? readOptional(formData, "fileUrl"),
    duration_sec: durationSec ? Number(durationSec) : null,
    is_active: true
  };

  return uploaded ? { ...payload, storage_path: uploaded.storagePath } : payload;
}

async function uploadAssetFile(formData: FormData, supabase: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>, numberId: string) {
  const value = formData.get("assetFile");
  if (!(value instanceof File) || value.size === 0) return null;

  const nickname = readOptional(formData, "nickname");
  const originalName = value.name || "asset-file";
  const displayName = nickname ? withOriginalExtension(nickname, originalName) : originalName;
  const storagePath = `${numberId}/${Date.now()}-${toSafeFileName(displayName)}`;
  const bytes = await value.arrayBuffer();
  const mimeType = value.type || guessMimeType(displayName);

  const { error } = await supabase.storage.from("number-assets").upload(storagePath, bytes, {
    contentType: mimeType,
    upsert: false
  });

  if (error) throw error;

  const { data } = supabase.storage.from("number-assets").getPublicUrl(storagePath);

  return {
    displayName,
    fileExt: normalizeExt(displayName),
    mimeType,
    publicUrl: data.publicUrl,
    storagePath
  };
}

async function requireAdminSupabase() {
  const context = await getCurrentAuthContext();
  requireAppRole(context, ["admin"]);
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for catalog mutations.");
  return supabase;
}

function readRequired(formData: FormData, key: string) {
  const value = readOptional(formData, key);
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function readOptional(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(formData: FormData, key: string) {
  return readOptional(formData, key) === "true";
}

function readNumber(formData: FormData, key: string) {
  const value = Number(readOptional(formData, key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function readAssetType(formData: FormData) {
  const value = readRequired(formData, "assetType") as NumberAssetType;
  if (!assetTypes.includes(value)) throw new Error(`Unsupported asset type: ${value}`);
  return value;
}

function normalizeExt(value: string) {
  const source = value.trim().toLowerCase();
  const candidate = source.includes(".") ? source.split(".").at(-1) ?? source : source;
  return candidate.replace(/[^a-z0-9]/g, "");
}

function withOriginalExtension(nickname: string, originalName: string) {
  const ext = normalizeExt(originalName);
  const cleanName = nickname.trim();
  if (!ext || cleanName.toLowerCase().endsWith(`.${ext}`)) return cleanName;
  return `${cleanName}.${ext}`;
}

function toSafeFileName(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "number-asset";
}

function guessMimeType(fileName: string) {
  const ext = normalizeExt(fileName);
  if (ext === "pdf") return "application/pdf";
  if (ext === "musicxml") return "application/vnd.recordare.musicxml+xml";
  if (ext === "xml") return "application/xml";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  return "application/octet-stream";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
