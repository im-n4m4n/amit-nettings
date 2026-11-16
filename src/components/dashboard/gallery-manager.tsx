"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Save, Trash2, Video } from "@/components/icons";

type Item = {
  id: number;
  title: string;
  caption: string;
  video: string;
  poster: string;
  serviceSlug: string;
  location: string;
  isActive: boolean;
  sortOrder: number;
};

type Draft = {
  title: string;
  caption: string;
  video: string;
  poster: string;
  serviceSlug: string;
  location: string;
  isActive: boolean;
};

const PRESET_MEDIA = [
  { label: "Mosquito net video", video: "/media/videos/mosquito-1.mp4", poster: "/media/videos/mosquito-1.jpg" },
  { label: "Bird net video", video: "/media/videos/bird-1.mp4", poster: "/media/videos/bird-1.jpg" },
  { label: "Invisible grill video", video: "/media/videos/grill-1.mp4", poster: "/media/videos/grill-1.jpg" },
  { label: "Mosquito net photo", video: "", poster: "/media/photos/mosquito-sliding-1.jpg" },
  { label: "Bird net photo", video: "", poster: "/media/photos/bird-net-1.jpg" },
  { label: "Invisible grill photo", video: "", poster: "/media/photos/grill-1.jpg" },
];

export function GalleryManager({
  items,
  services,
}: {
  items: Item[];
  services: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<number, Draft>>(
    Object.fromEntries(
      items.map((item) => [
        item.id,
        {
          title: item.title,
          caption: item.caption,
          video: item.video,
          poster: item.poster,
          serviceSlug: item.serviceSlug,
          location: item.location,
          isActive: item.isActive,
        },
      ]),
    ),
  );
  const [state, setState] = useState<Record<number, "idle" | "saving" | "saved" | "error">>(
    Object.fromEntries(items.map((item) => [item.id, "idle"])),
  );
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState<Draft>({
    title: "",
    caption: "",
    video: "",
    poster: "",
    serviceSlug: services[0]?.slug ?? "",
    location: "",
    isActive: true,
  });
  const [createError, setCreateError] = useState("");
  const [createState, setCreateState] = useState<"idle" | "saving" | "saved">("idle");

  const update = (id: number, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setState((prev) => ({ ...prev, [id]: "idle" }));
  };

  const save = async (id: number) => {
    setState((prev) => ({ ...prev, [id]: "saving" }));
    try {
      const response = await fetch("/api/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...drafts[id] }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      setState((prev) => ({ ...prev, [id]: payload.ok ? "saved" : "error" }));
      if (payload.ok) router.refresh();
    } catch {
      setState((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const remove = async (id: number) => {
    setState((prev) => ({ ...prev, [id]: "saving" }));
    try {
      await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setState((prev) => ({ ...prev, [id]: "idle" }));
    }
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError("");
    if (newItem.title.trim().length < 2) {
      setCreateError("Enter a title for the gallery item");
      return;
    }
    setCreateState("saving");
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setCreateError(payload.error || "Could not add the gallery item");
        setCreateState("idle");
        return;
      }
      setCreateState("saved");
      setNewItem({ title: "", caption: "", video: "", poster: "", serviceSlug: services[0]?.slug ?? "", location: "", isActive: true });
      setCreating(false);
      router.refresh();
    } catch {
      setCreateError("Network error while adding");
      setCreateState("idle");
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="card p-5 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Video className="h-4.5 w-4.5 text-brand-700" /> Add gallery item
          </h2>
          <button type="button" onClick={() => setCreating((v) => !v)} className="btn btn-ghost">
            {creating ? "Close form" : <><Plus className="h-4 w-4" /> New item</>}
          </button>
        </header>

        {creating && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="g-title">
                Title *
              </label>
              <input
                id="g-title"
                className="field"
                value={newItem.title}
                onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Bird net on a balcony"
              />
            </div>
            <div>
              <label className="label" htmlFor="g-video">
                Video path (mp4)
              </label>
              <input
                id="g-video"
                className="field"
                value={newItem.video}
                onChange={(event) => setNewItem((prev) => ({ ...prev, video: event.target.value }))}
                placeholder="/media/videos/mosquito-1.mp4 or https://…mp4"
              />
            </div>
            <div>
              <label className="label" htmlFor="g-poster">
                Poster / photo path
              </label>
              <input
                id="g-poster"
                className="field"
                value={newItem.poster}
                onChange={(event) => setNewItem((prev) => ({ ...prev, poster: event.target.value }))}
                placeholder="/media/photos/grill-1.jpg or https://…jpg"
              />
            </div>
            <div>
              <label className="label" htmlFor="g-service">
                Related service
              </label>
              <select
                id="g-service"
                className="field"
                value={newItem.serviceSlug}
                onChange={(event) => setNewItem((prev) => ({ ...prev, serviceSlug: event.target.value }))}
              >
                <option value="">Not linked</option>
                {services.map((service) => (
                  <option key={service.slug} value={service.slug}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="g-location">
                Location
              </label>
              <input
                id="g-location"
                className="field"
                value={newItem.location}
                onChange={(event) => setNewItem((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="g-caption">
                Caption
              </label>
              <textarea
                id="g-caption"
                className="field min-h-[80px] resize-y"
                value={newItem.caption}
                onChange={(event) => setNewItem((prev) => ({ ...prev, caption: event.target.value }))}
                placeholder="Optional short caption"
              />
            </div>

            <div className="sm:col-span-2 rounded-xl border border-ink-900/8 bg-sand-50 p-3">
              <p className="text-xs font-semibold text-ink-700">Available site media (click to fill the fields above)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_MEDIA.map((media) => (
                  <button
                    key={media.label}
                    type="button"
                    onClick={() =>
                      setNewItem((prev) => ({ ...prev, video: media.video, poster: media.poster }))
                    }
                    className="chip bg-white text-ink-700 ring-1 ring-ink-900/10 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {media.label}
                  </button>
                ))}
              </div>
            </div>

            {createError && <p className="sm:col-span-2 text-sm font-semibold text-rose-600">{createError}</p>}

            <div className="sm:col-span-2">
              <button type="submit" className="btn btn-primary" disabled={createState === "saving"}>
                {createState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add to gallery
              </button>
            </div>
          </div>
        )}
      </form>

      {items.length === 0 && (
        <div className="card p-8 text-center">
          <p className="font-semibold">No gallery items yet</p>
          <p className="mt-1 text-sm text-ink-500">Add your first installation video or photo above.</p>
        </div>
      )}

      {items.map((item) => {
        const draft = drafts[item.id];
        const status = state[item.id];
        return (
          <div key={item.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Video className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold">{item.title}</h3>
                  <p className="text-xs text-ink-400">
                    {item.video || "photo only"} · {item.serviceSlug || "unlinked"}
                    {!item.isActive && " · hidden"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => save(item.id)} className="btn btn-primary" disabled={status === "saving"}>
                  {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor={`t-${item.id}`}>
                  Title
                </label>
                <input
                  id={`t-${item.id}`}
                  className="field"
                  value={draft.title}
                  onChange={(event) => update(item.id, { title: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`loc-${item.id}`}>
                  Location
                </label>
                <input
                  id={`loc-${item.id}`}
                  className="field"
                  value={draft.location}
                  onChange={(event) => update(item.id, { location: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`v-${item.id}`}>
                  Video path
                </label>
                <input
                  id={`v-${item.id}`}
                  className="field"
                  value={draft.video}
                  onChange={(event) => update(item.id, { video: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`p-${item.id}`}>
                  Poster path
                </label>
                <input
                  id={`p-${item.id}`}
                  className="field"
                  value={draft.poster}
                  onChange={(event) => update(item.id, { poster: event.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor={`c-${item.id}`}>
                  Caption
                </label>
                <textarea
                  id={`c-${item.id}`}
                  className="field min-h-[70px] resize-y"
                  value={draft.caption}
                  onChange={(event) => update(item.id, { caption: event.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-900/20"
                  checked={draft.isActive}
                  onChange={(event) => update(item.id, { isActive: event.target.checked })}
                />
                Show on the public gallery
              </label>
            </div>

            {status === "saved" && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800">
                <Check className="h-4 w-4" /> Gallery item updated.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
