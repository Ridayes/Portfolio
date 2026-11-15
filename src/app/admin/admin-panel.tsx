"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";

import finderFolder from "@/assets/system/finder-folder.png";
import {
  PROJECT_FOLDERS,
  isBehanceUrl,
  vimeoEmbedUrl,
  type Project,
  type ProjectFolderId,
  type ProjectsData,
} from "@/content/projects";
import { finderFolders } from "@/content/site";

const labelFor = (id: ProjectFolderId) => finderFolders.find((f) => f.id === id)?.sidebarLabel ?? id;
const newId = () => `p-${Math.random().toString(36).slice(2, 8)}`;

const input =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14px] outline-none transition focus:border-selection focus:ring-3 focus:ring-selection/20";
const button =
  "rounded-lg px-3 py-1.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

/** Local admin for the Finder projects: thumbnails, titles, Behance and Vimeo links. */
export function AdminPanel() {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [saved, setSaved] = useState("");
  const [folder, setFolder] = useState<ProjectFolderId>(PROJECT_FOLDERS[0]);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; text?: string }>({
    kind: "idle",
  });

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json: ProjectsData) => {
        setData(json);
        setSaved(JSON.stringify(json));
      })
      .catch((e) => setStatus({ kind: "error", text: `Couldn't load projects (${e.message}).` }));
  }, []);

  const dirty = data !== null && JSON.stringify(data) !== saved;

  const save = useCallback(async () => {
    if (!data || !dirty) return;
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setData(json);
      setSaved(JSON.stringify(json));
      setStatus({ kind: "saved" });
    } catch (e) {
      setStatus({ kind: "error", text: `Save failed: ${(e as Error).message}` });
    }
  }, [data, dirty]);

  // ⌘S / Ctrl+S saves; warn before leaving with unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save, dirty]);

  const list = data?.[folder] ?? [];
  const setList = (fn: (list: Project[]) => Project[]) => {
    setData((d) => (d ? { ...d, [folder]: fn(d[folder]) } : d));
    setStatus({ kind: "idle" });
  };
  const update = (id: string, patch: Partial<Project>) =>
    setList((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const move = (index: number, delta: number) =>
    setList((l) => {
      const next = [...l];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });

  const [focusId, setFocusId] = useState<string | null>(null);
  function addProject() {
    const id = newId();
    setList((l) => [...l, { id, title: "New project", thumbnail: null, behance: "", vimeo: "" }]);
    setFocusId(id);
  }

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold">Portfolio admin</h1>
            <p className="text-[13px] text-black/55">Edits the projects inside each Finder folder. Only available on your Mac.</p>
          </div>
          <a href="/" target="_blank" className={`${button} bg-black/5 hover:bg-black/10`}>
            View site ↗
          </a>
        </div>
        <nav aria-label="Folders" className="mx-auto max-w-4xl overflow-x-auto px-5 pb-3">
          <div className="inline-flex gap-1 rounded-xl bg-black/5 p-1">
            {PROJECT_FOLDERS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFolder(id)}
                aria-pressed={folder === id}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition ${folder === id ? "bg-white shadow-sm" : "text-black/60 hover:text-black"}`}
              >
                {labelFor(id)}
                <span className="ml-1.5 text-black/40 tabular-nums">{data?.[id].length ?? 0}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-6">
        {!data ? (
          <p className="py-20 text-center text-[14px] text-black/50">{status.text ?? "Loading…"}</p>
        ) : (
          <>
            <ol className="space-y-3">
              {list.map((project, index) => (
                <li key={project.id}>
                  <ProjectCard
                    project={project}
                    autoFocus={focusId === project.id}
                    first={index === 0}
                    last={index === list.length - 1}
                    onChange={(patch) => update(project.id, patch)}
                    onMove={(delta) => move(index, delta)}
                    onDelete={() => setList((l) => l.filter((p) => p.id !== project.id))}
                  />
                </li>
              ))}
            </ol>
            {list.length === 0 && (
              <p className="rounded-2xl border border-dashed border-black/15 py-12 text-center text-[14px] text-black/50">
                No projects in {labelFor(folder)} yet — visitors see an empty folder with a Behance link.
              </p>
            )}
            <button
              type="button"
              onClick={addProject}
              className="mt-4 w-full rounded-2xl border border-dashed border-black/20 py-4 text-[14px] font-medium text-black/60 transition hover:border-selection hover:bg-selection/5 hover:text-selection"
            >
              + Add project to {labelFor(folder)}
            </button>
          </>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-3">
          <p role="status" className={`flex-1 text-[13px] ${status.kind === "error" ? "text-[#d70015]" : "text-black/60"}`}>
            {status.kind === "saving"
              ? "Saving…"
              : status.kind === "error"
                ? status.text
                : status.kind === "saved"
                  ? "Saved. Refresh the site to see it — commit & push to publish."
                  : dirty
                    ? "You have unsaved changes."
                    : "All changes saved."}
          </p>
          <button type="button" onClick={save} disabled={!dirty || status.kind === "saving"} className={`${button} bg-selection px-5 text-white hover:bg-selection/90`}>
            Save <kbd className="ml-1 font-sans opacity-70">⌘S</kbd>
          </button>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({
  project,
  autoFocus,
  first,
  last,
  onChange,
  onMove,
  onDelete,
}: {
  project: Project;
  autoFocus: boolean;
  first: boolean;
  last: boolean;
  onChange: (patch: Partial<Project>) => void;
  onMove: (delta: number) => void;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const embed = useMemo(() => (project.vimeo ? vimeoEmbedUrl(project.vimeo) : null), [project.vimeo]);
  const behanceOk = !project.behance || isBehanceUrl(project.behance);
  const vimeoOk = !project.vimeo || embed !== null;

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("name", project.title);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onChange({ thumbnail: json.url });
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  /** Fetches a cover from Behance or Vimeo (via the local API) and uses it as the thumbnail. */
  async function fetchRemoteCover(source: "behance" | "vimeo") {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch(source === "behance" ? "/api/admin/behance-cover" : "/api/admin/vimeo-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source === "behance" ? project.behance : project.vimeo, name: project.title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onChange({ thumbnail: json.url });
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files[0]);
  }

  const behaviour = embed
    ? "Click plays the Vimeo video in a player window."
    : project.behance && behanceOk
      ? "Click opens the Behance project in a new tab."
      : "Add a Behance or Vimeo link so the project opens when clicked.";

  return (
    <article className="flex gap-4 rounded-2xl bg-white p-4 shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_4px_16px_-6px_rgb(0_0_0/0.12)] max-sm:flex-col">
      {/* Thumbnail */}
      <div className="flex w-[148px] shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          aria-label={project.thumbnail ? "Replace thumbnail" : "Upload thumbnail"}
          className={`group relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl bg-[#f5f5f7] ring-1 transition ${dragOver ? "ring-2 ring-selection" : "ring-black/10 hover:ring-black/25"}`}
        >
          {project.thumbnail ? (
            <Image src={project.thumbnail} alt="" fill sizes="148px" unoptimized className="object-cover" />
          ) : (
            <Image src={finderFolder} alt="" className="w-16" />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {uploading ? "Uploading…" : project.thumbnail ? "Replace image" : "Upload or drop image"}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          hidden
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {embed && (
          <button
            type="button"
            onClick={() => fetchRemoteCover("vimeo")}
            disabled={uploading}
            className={`${button} bg-[#17d5ff]/15 text-[#0a7fa3] hover:bg-[#17d5ff]/25`}
          >
            {uploading ? "Getting thumbnail…" : "Use Vimeo thumbnail"}
          </button>
        )}
        {project.behance && behanceOk && (
          <button
            type="button"
            onClick={() => fetchRemoteCover("behance")}
            disabled={uploading}
            className={`${button} bg-[#0057ff]/10 text-[#0057ff] hover:bg-[#0057ff]/15`}
          >
            {uploading ? "Getting cover…" : "Use Behance cover"}
          </button>
        )}
        {project.thumbnail ? (
          <button type="button" onClick={() => onChange({ thumbnail: null })} className={`${button} bg-black/5 hover:bg-black/10`}>
            Use folder icon
          </button>
        ) : (
          <p className="text-center text-[11px] text-black/45">Shows a folder icon</p>
        )}
        {uploadError && <p className="text-[11px] text-[#d70015]">{uploadError}</p>}
      </div>

      {/* Fields */}
      <div className="min-w-0 flex-1 space-y-3">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-black/60">Title</span>
          <input
            className={input}
            value={project.title}
            autoFocus={autoFocus}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-black/60">Behance link</span>
          <input
            className={`${input} ${behanceOk ? "" : "border-[#d70015]"}`}
            type="url"
            placeholder="https://www.behance.net/gallery/…"
            value={project.behance}
            onChange={(e) => onChange({ behance: e.target.value })}
          />
          {!behanceOk && <span className="mt-1 block text-[11px] text-[#d70015]">This doesn’t look like a behance.net link.</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-black/60">
            Vimeo link <span className="font-normal text-black/40">— for video projects</span>
          </span>
          <input
            className={`${input} ${vimeoOk ? "" : "border-[#d70015]"}`}
            placeholder="https://vimeo.com/123456789"
            value={project.vimeo}
            onChange={(e) => onChange({ vimeo: e.target.value })}
          />
          {!vimeoOk && <span className="mt-1 block text-[11px] text-[#d70015]">Couldn’t find a video in that link. Open the video on Vimeo, click Share → Copy link, and paste it here (the embed code works too).</span>}
        </label>
        {embed && (
          <div>
            <button type="button" onClick={() => setShowPreview((v) => !v)} className="text-[12px] font-medium text-selection hover:underline">
              {showPreview ? "Hide preview" : "Preview video"}
            </button>
            {showPreview && (
              <iframe
                src={embed}
                title={`${project.title} preview`}
                allow="fullscreen; picture-in-picture"
                className="mt-2 aspect-video w-full max-w-md rounded-lg bg-black"
              />
            )}
          </div>
        )}
        <p className="text-[12px] text-black/50">{behaviour}</p>
      </div>

      {/* Order / delete */}
      <div className="flex shrink-0 flex-col items-end gap-1.5 max-sm:flex-row">
        <button type="button" onClick={() => onMove(-1)} disabled={first} aria-label="Move up" className={`${button} bg-black/5 hover:bg-black/10`}>
          ↑
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={last} aria-label="Move down" className={`${button} bg-black/5 hover:bg-black/10`}>
          ↓
        </button>
        {confirmDelete ? (
          <>
            <button type="button" onClick={onDelete} className={`${button} bg-[#d70015] text-white`}>
              Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={`${button} hover:bg-black/5`}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete ${project.title}`} className={`${button} text-[#d70015] hover:bg-[#d70015]/10`}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
