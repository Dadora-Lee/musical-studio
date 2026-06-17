import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export type NumberAssetType = "score_pdf" | "score_xml" | "mr_audio" | "ar_audio" | "guide_audio" | "reference";

export type CatalogProduction = {
  id: string;
  title: string;
  seasonLabel: string | null;
  isActive: boolean;
};

export type CatalogRole = {
  id: string;
  roleKey: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
};

export type CatalogNumber = {
  id: string;
  productionId: string;
  productionTitle: string;
  title: string;
  category: string | null;
  sortOrder: number;
  durationSec: number;
  isActive: boolean;
  roles: CatalogRole[];
  assets: CatalogAsset[];
};

export type CatalogAsset = {
  id: string;
  numberId: string;
  assetType: NumberAssetType;
  fileName: string;
  fileExt: string;
  mimeType: string;
  storageProvider: string;
  fileUrl: string | null;
  isActive: boolean;
};

export type AdminCatalogData = {
  productions: CatalogProduction[];
  roles: CatalogRole[];
  numbers: CatalogNumber[];
};

type ProductionRow = {
  id: string;
  title: string;
  season_label: string | null;
  is_active: boolean;
};

type RoleRow = {
  id: string;
  role_key: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
};

type AssetRow = {
  id: string;
  number_id: string;
  asset_type: NumberAssetType;
  file_name: string;
  file_ext: string;
  mime_type: string;
  storage_provider: string;
  file_url: string | null;
  is_active: boolean;
};

type NumberRow = {
  id: string;
  production_id: string;
  title: string;
  category: string | null;
  sort_order: number;
  duration_sec: number;
  is_active: boolean;
  productions?: Pick<ProductionRow, "title"> | Pick<ProductionRow, "title">[] | null;
  number_roles?: { musical_roles: RoleRow | RoleRow[] | null }[];
  number_assets?: AssetRow[];
};

export async function listAdminCatalog(): Promise<AdminCatalogData> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return { productions: [], roles: [], numbers: [] };

  const [productionResult, roleResult, numberResult] = await Promise.all([
    supabase.from("productions").select("id, title, season_label, is_active").order("created_at", { ascending: false }).returns<ProductionRow[]>(),
    supabase.from("musical_roles").select("id, role_key, display_name, description, is_active").order("display_name", { ascending: true }).returns<RoleRow[]>(),
    supabase
      .from("musical_numbers")
      .select(
        "id, production_id, title, category, sort_order, duration_sec, is_active, productions(title), number_roles(musical_roles(id, role_key, display_name, description, is_active)), number_assets(id, number_id, asset_type, file_name, file_ext, mime_type, storage_provider, file_url, is_active)"
      )
      .order("sort_order", { ascending: true })
      .returns<NumberRow[]>()
  ]);

  return {
    productions: (productionResult.data ?? []).map(mapProduction),
    roles: (roleResult.data ?? []).map(mapRole),
    numbers: (numberResult.data ?? []).map(mapNumber)
  };
}

function mapProduction(row: ProductionRow): CatalogProduction {
  return {
    id: row.id,
    title: row.title,
    seasonLabel: row.season_label,
    isActive: row.is_active
  };
}

function mapRole(row: RoleRow): CatalogRole {
  return {
    id: row.id,
    roleKey: row.role_key,
    displayName: row.display_name,
    description: row.description,
    isActive: row.is_active
  };
}

function mapAsset(row: AssetRow): CatalogAsset {
  return {
    id: row.id,
    numberId: row.number_id,
    assetType: row.asset_type,
    fileName: row.file_name,
    fileExt: row.file_ext,
    mimeType: row.mime_type,
    storageProvider: row.storage_provider,
    fileUrl: row.file_url,
    isActive: row.is_active
  };
}

function mapNumber(row: NumberRow): CatalogNumber {
  const production = Array.isArray(row.productions) ? row.productions[0] : row.productions;
  return {
    id: row.id,
    productionId: row.production_id,
    productionTitle: production?.title ?? "-",
    title: row.title,
    category: row.category,
    sortOrder: row.sort_order,
    durationSec: row.duration_sec,
    isActive: row.is_active,
    roles: (row.number_roles ?? [])
      .map((link) => (Array.isArray(link.musical_roles) ? link.musical_roles[0] : link.musical_roles))
      .filter((role): role is RoleRow => Boolean(role))
      .map(mapRole),
    assets: (row.number_assets ?? []).map(mapAsset)
  };
}
