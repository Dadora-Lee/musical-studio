"use client";

import { useState } from "react";
import {
  createMusicalNumber,
  createMusicalRole,
  createNumberAsset,
  createProduction,
  linkAllNumberRoles,
  linkNumberRole,
  updateMusicalNumber,
  updateMusicalRole,
  updateNumberAsset,
  updateProduction
} from "@/app/admin/catalog-actions";
import type { AdminCatalogData, CatalogAsset, CatalogNumber, CatalogProduction, CatalogRole, NumberAssetType } from "@/lib/admin/catalog";
import { CatalogActionForm } from "./CatalogActionForm";

const assetTypes: { value: NumberAssetType; label: string; hint: string }[] = [
  { value: "score_pdf", label: "PDF score", hint: ".pdf" },
  { value: "score_xml", label: "MusicXML score", hint: ".musicxml, .xml" },
  { value: "mr_audio", label: "MR audio", hint: ".mp3, .wav" },
  { value: "ar_audio", label: "AR audio", hint: ".mp3, .wav" },
  { value: "guide_audio", label: "Guide audio", hint: ".wav, .mp3" },
  { value: "reference", label: "Reference", hint: "other" }
];

const editGridClass = "grid gap-3 lg:grid-cols-2 xl:grid-cols-4 xl:items-end";

type EditTarget = { id: string; type: "asset" | "number" | "production" | "role" } | null;

export function AdminCatalogPanel({ catalog }: { catalog: AdminCatalogData }) {
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [editAssetId, setEditAssetId] = useState<string | null>(null);

  function isEditing(type: NonNullable<EditTarget>["type"], id: string) {
    return editTarget?.type === type && editTarget.id === id;
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-black">Catalog</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage app-owned productions, musical numbers, roles, and score/audio files. Google Drive stays browse/download only.
          </p>
        </div>
        <div className="grid gap-4 p-4 xl:grid-cols-2">
          <CreateProductionForm />
          <CreateRoleForm />
          <CreateNumberForm catalog={catalog} />
          <LinkRoleForm catalog={catalog} />
        </div>
      </div>

      <TableShell title="Productions">
        <tbody>
          {catalog.productions.map((production) => (
            <ProductionRows
              editing={isEditing("production", production.id)}
              key={production.id}
              onCancel={() => setEditTarget(null)}
              onEdit={() => setEditTarget({ id: production.id, type: "production" })}
              production={production}
            />
          ))}
        </tbody>
      </TableShell>

      <TableShell title="Roles">
        <tbody>
          {catalog.roles.map((role) => (
            <RoleRows
              editing={isEditing("role", role.id)}
              key={role.id}
              onCancel={() => setEditTarget(null)}
              onEdit={() => setEditTarget({ id: role.id, type: "role" })}
              role={role}
            />
          ))}
        </tbody>
      </TableShell>

      <TableShell title="Musical numbers">
        <tbody>
          {catalog.numbers.map((number) => (
            <NumberRows
              catalog={catalog}
              editAssetId={editAssetId}
              editing={isEditing("number", number.id)}
              key={number.id}
              number={number}
              onAssetCancel={() => setEditAssetId(null)}
              onAssetEdit={setEditAssetId}
              onCancel={() => {
                setEditTarget(null);
                setEditAssetId(null);
              }}
              onEdit={() => {
                setEditTarget({ id: number.id, type: "number" });
                setEditAssetId(null);
              }}
            />
          ))}
        </tbody>
      </TableShell>
    </section>
  );
}

function CreateProductionForm() {
  return (
    <CatalogForm action={createProduction} title="Add production">
      <TextInput label="Title" name="title" placeholder="13th regular performance" required />
      <TextInput label="Season" name="seasonLabel" placeholder="2026" />
      <SubmitButton>Add production</SubmitButton>
    </CatalogForm>
  );
}

function CreateRoleForm() {
  return (
    <CatalogForm action={createMusicalRole} title="Add role">
      <TextInput label="Display name" name="displayName" placeholder="Hikaru" required />
      <TextInput label="Role key" name="roleKey" placeholder="hikaru" />
      <TextInput label="Description" name="description" placeholder="Lead / Ensemble / Cover" />
      <SubmitButton>Add role</SubmitButton>
    </CatalogForm>
  );
}

function CreateNumberForm({ catalog }: { catalog: AdminCatalogData }) {
  return (
    <CatalogForm action={createMusicalNumber} title="Add musical number">
      <ProductionSelect catalog={catalog} />
      <TextInput label="Number title" name="title" placeholder="Duet night" required />
      <TextInput label="Category" name="category" placeholder="Act 2 duet" />
      <div className="grid grid-cols-2 gap-2">
        <TextInput label="Sort" name="sortOrder" placeholder="10" type="number" />
        <TextInput label="Duration sec" name="durationSec" placeholder="198" type="number" />
      </div>
      <SubmitButton>Add number</SubmitButton>
    </CatalogForm>
  );
}

function LinkRoleForm({ catalog }: { catalog: AdminCatalogData }) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="font-black">Link role to number</h3>
      <CatalogActionForm action={linkNumberRole} className="grid gap-3">
        <NumberSelect catalog={catalog} />
        <RoleSelect catalog={catalog} />
        <SubmitButton>Link selected role</SubmitButton>
      </CatalogActionForm>
      <CatalogActionForm action={linkAllNumberRoles} className="grid gap-3">
        <NumberSelect catalog={catalog} />
        <button className="rounded-md border border-teal-600 px-3 py-2 text-xs font-black text-teal-700" type="submit">
          Link all active roles
        </button>
      </CatalogActionForm>
    </div>
  );
}

function ProductionRows({
  editing,
  onCancel,
  onEdit,
  production
}: {
  editing: boolean;
  onCancel: () => void;
  onEdit: () => void;
  production: CatalogProduction;
}) {
  return (
    <>
      <SummaryRow
        details={production.seasonLabel ?? "-"}
        meta={<StatusPill active={production.isActive} />}
        onEdit={onEdit}
        title={production.title}
      />
      {editing ? (
        <tr>
          <td className="border-b border-slate-200 bg-slate-50 p-3" colSpan={4}>
            <CatalogActionForm action={updateProduction} className={editGridClass} resetOnSuccess={false}>
              <input name="id" type="hidden" value={production.id} />
              <TextInput label="Title" name="title" required defaultValue={production.title} />
              <TextInput label="Season" name="seasonLabel" defaultValue={production.seasonLabel ?? ""} />
              <ActiveSelect defaultValue={production.isActive} />
              <SubmitButton>Save</SubmitButton>
              <CancelButton onClick={onCancel} />
            </CatalogActionForm>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RoleRows({ editing, onCancel, onEdit, role }: { editing: boolean; onCancel: () => void; onEdit: () => void; role: CatalogRole }) {
  return (
    <>
      <SummaryRow
        details={`${role.roleKey} · ${role.description ?? "-"}`}
        meta={<StatusPill active={role.isActive} />}
        onEdit={onEdit}
        title={role.displayName}
      />
      {editing ? (
        <tr>
          <td className="border-b border-slate-200 bg-slate-50 p-3" colSpan={4}>
            <CatalogActionForm action={updateMusicalRole} className={editGridClass} resetOnSuccess={false}>
              <input name="id" type="hidden" value={role.id} />
              <TextInput label="Key" name="roleKey" required defaultValue={role.roleKey} />
              <TextInput label="Name" name="displayName" required defaultValue={role.displayName} />
              <TextInput label="Description" name="description" defaultValue={role.description ?? ""} />
              <ActiveSelect defaultValue={role.isActive} />
              <SubmitButton>Save</SubmitButton>
              <CancelButton onClick={onCancel} />
            </CatalogActionForm>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function NumberRows({
  catalog,
  editAssetId,
  editing,
  number,
  onAssetCancel,
  onAssetEdit,
  onCancel,
  onEdit
}: {
  catalog: AdminCatalogData;
  editAssetId: string | null;
  editing: boolean;
  number: CatalogNumber;
  onAssetCancel: () => void;
  onAssetEdit: (id: string) => void;
  onCancel: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <SummaryRow
        details={`${number.productionTitle} · ${number.category ?? "-"} · ${number.assets.length} files`}
        meta={
          <div className="flex flex-wrap gap-1">
            <StatusPill active={number.isActive} />
            {number.roles.map((role) => (
              <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-700" key={role.id}>
                {role.displayName}
              </span>
            ))}
          </div>
        }
        onEdit={onEdit}
        title={number.title}
      />
      {editing ? (
        <tr>
          <td className="border-b border-slate-200 bg-slate-50 p-3" colSpan={4}>
            <div className="grid gap-4">
              <CatalogActionForm action={updateMusicalNumber} className={editGridClass} resetOnSuccess={false}>
                <input name="id" type="hidden" value={number.id} />
                <ProductionSelect catalog={catalog} defaultValue={number.productionId} />
                <TextInput label="Title" name="title" required defaultValue={number.title} />
                <TextInput label="Category" name="category" defaultValue={number.category ?? ""} />
                <TextInput label="Sort" name="sortOrder" type="number" defaultValue={String(number.sortOrder)} />
                <TextInput label="Duration" name="durationSec" type="number" defaultValue={String(number.durationSec)} />
                <ActiveSelect defaultValue={number.isActive} />
                <SubmitButton>Save</SubmitButton>
                <CancelButton onClick={onCancel} />
              </CatalogActionForm>

              <section className="rounded-md border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-3 py-2">
                  <h4 className="text-sm font-black">Number files</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {number.assets.length === 0 ? <p className="p-3 text-xs font-bold text-slate-500">No files registered.</p> : null}
                  {number.assets.map((asset) => (
                    <AssetEditor
                      asset={asset}
                      catalog={catalog}
                      editing={editAssetId === asset.id}
                      key={asset.id}
                      number={number}
                      onCancel={onAssetCancel}
                      onEdit={() => onAssetEdit(asset.id)}
                    />
                  ))}
                </div>
              </section>

              <CatalogActionForm action={createNumberAsset} className="grid gap-3 rounded-md border border-dashed border-slate-300 bg-white p-3 lg:grid-cols-2 xl:grid-cols-4 xl:items-end">
                <input name="numberId" type="hidden" value={number.id} />
                <AssetTypeSelect />
                <FileInput />
                <TextInput label="Nickname" name="nickname" placeholder="Optional display name" />
                <TextInput label="File name / manual fallback" name="fileName" placeholder="number_01.musicxml" />
                <TextInput label="Extension" name="fileExt" placeholder="musicxml" />
                <TextInput label="MIME" name="mimeType" placeholder="application/vnd.recordare.musicxml+xml" />
                <TextInput label="File URL / storage path" name="fileUrl" placeholder="/storage/scores/number_01.musicxml" />
                <TextInput label="Duration sec" name="durationSec" placeholder="198" type="number" />
                <SubmitButton>Add file</SubmitButton>
              </CatalogActionForm>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function AssetEditor({
  asset,
  catalog,
  editing,
  number,
  onCancel,
  onEdit
}: {
  asset: CatalogAsset;
  catalog: AdminCatalogData;
  editing: boolean;
  number: CatalogNumber;
  onCancel: () => void;
  onEdit: () => void;
}) {
  if (!editing) {
    return (
      <div className="grid gap-2 p-3 md:grid-cols-[130px_1fr_120px_120px_auto] md:items-center">
        <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-700">{asset.assetType}</span>
        <span className="truncate text-xs font-bold" title={asset.fileName}>
          {asset.fileName}
        </span>
        <span className="text-xs text-slate-500">{asset.fileExt}</span>
        <StatusPill active={asset.isActive} />
        <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black" onClick={onEdit} type="button">
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="p-3">
      <CatalogActionForm action={updateNumberAsset} className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4 xl:items-end" resetOnSuccess={false}>
        <input name="id" type="hidden" value={asset.id} />
        <NumberSelect catalog={catalog} defaultValue={number.id} />
        <AssetTypeSelect defaultValue={asset.assetType} />
        <FileInput />
        <TextInput label="Nickname" name="nickname" placeholder="Optional replacement name" />
        <TextInput label="File name" name="fileName" required defaultValue={asset.fileName} />
        <TextInput label="Ext" name="fileExt" defaultValue={asset.fileExt} />
        <TextInput label="MIME" name="mimeType" required defaultValue={asset.mimeType} />
        <TextInput label="URL" name="fileUrl" defaultValue={asset.fileUrl ?? ""} />
        <ActiveSelect defaultValue={asset.isActive} />
        <SubmitButton>Save</SubmitButton>
        <CancelButton onClick={onCancel} />
      </CatalogActionForm>
    </div>
  );
}

function SummaryRow({
  details,
  meta,
  onEdit,
  title
}: {
  details: string;
  meta: React.ReactNode;
  onEdit: () => void;
  title: string;
}) {
  return (
    <tr>
      <td className="border-b border-slate-200 p-2">
        <div className="grid gap-2 md:grid-cols-[minmax(180px,1fr)_minmax(180px,1.4fr)_minmax(160px,1fr)_auto] md:items-center">
          <strong>{title}</strong>
          <span className="text-xs text-slate-500">{details}</span>
          <div>{meta}</div>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black" onClick={onEdit} type="button">
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

function CatalogForm({
  action,
  children,
  title
}: {
  action: (state: { message: string; ok: boolean; resetKey: number }, formData: FormData) => Promise<{ message: string; ok: boolean; resetKey: number }>;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <CatalogActionForm action={action} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="font-black">{title}</h3>
      {children}
    </CatalogActionForm>
  );
}

function TextInput({
  defaultValue,
  label,
  name,
  placeholder,
  required,
  type = "text"
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold text-slate-500">
      {label}
      <input
        className="h-10 rounded border border-slate-300 px-3 text-sm text-slate-900"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

function FileInput() {
  return (
    <label className="grid gap-1 text-xs font-bold text-slate-500">
      Local file
      <input
        className="h-10 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-black"
        name="assetFile"
        type="file"
      />
    </label>
  );
}

function SelectInput({
  children,
  defaultValue,
  label,
  name,
  required
}: {
  children: React.ReactNode;
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold text-slate-500">
      {label}
      <select className="h-10 rounded border border-slate-300 px-3 text-sm text-slate-900" defaultValue={defaultValue ?? ""} name={name} required={required}>
        <option value="">Select</option>
        {children}
      </select>
    </label>
  );
}

function ProductionSelect({ catalog, defaultValue }: { catalog: AdminCatalogData; defaultValue?: string }) {
  return (
    <SelectInput defaultValue={defaultValue} label="Production" name="productionId" required>
      {catalog.productions.map((production) => (
        <option key={production.id} value={production.id}>
          {production.title}
        </option>
      ))}
    </SelectInput>
  );
}

function NumberSelect({ catalog, defaultValue }: { catalog: AdminCatalogData; defaultValue?: string }) {
  return (
    <SelectInput defaultValue={defaultValue} label="Number" name="numberId" required>
      {catalog.numbers.map((number) => (
        <option key={number.id} value={number.id}>
          {number.title}
        </option>
      ))}
    </SelectInput>
  );
}

function RoleSelect({ catalog }: { catalog: AdminCatalogData }) {
  return (
    <SelectInput label="Role" name="roleId" required>
      {catalog.roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.displayName}
        </option>
      ))}
    </SelectInput>
  );
}

function AssetTypeSelect({ defaultValue }: { defaultValue?: NumberAssetType }) {
  return (
    <SelectInput defaultValue={defaultValue} label="File type" name="assetType" required>
      {assetTypes.map((assetType) => (
        <option key={assetType.value} value={assetType.value}>
          {assetType.label} ({assetType.hint})
        </option>
      ))}
    </SelectInput>
  );
}

function ActiveSelect({ defaultValue }: { defaultValue: boolean }) {
  return (
    <SelectInput defaultValue={String(defaultValue)} label="Status" name="isActive" required>
      <option value="true">active</option>
      <option value="false">deactivated</option>
    </SelectInput>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-black ${active ? "bg-teal-50 text-teal-700" : "bg-slate-200 text-slate-600"}`}>
      {active ? "active" : "deactivated"}
    </span>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="h-10 rounded-md bg-teal-700 px-3 text-xs font-black text-white" type="submit">
      {children}
    </button>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="h-10 rounded-md border border-slate-300 px-3 text-xs font-black" onClick={onClick} type="button">
      Cancel
    </button>
  );
}

function TableShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-3">
        <h3 className="text-lg font-black">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs">{children}</table>
      </div>
    </section>
  );
}
