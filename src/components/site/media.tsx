"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Play, X } from "@/components/icons";

export type MediaItem = {
  id: number;
  title: string;
  video: string;
  poster: string;
  serviceSlug: string;
};

type Filter = { slug: string; name: string };

/** Local files go through the image optimiser; pasted external URLs render as-is. */
function Picture({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />;
}

/* Flex rows (not grid) so an incomplete last row sits centred instead of hanging left. */
const TILE_4 = "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]";
const TILE_3 = "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)]";

function FilterChips({
  filters,
  value,
  onChange,
}: {
  filters: Filter[];
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by service">
      {[{ slug: "", name: "All" }, ...filters].map((filter) => (
        <button
          key={filter.slug || "all"}
          type="button"
          role="tab"
          aria-selected={value === filter.slug}
          onClick={() => onChange(filter.slug)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            value === filter.slug
              ? "border-brand-700 bg-brand-700 text-white shadow-[0_10px_20px_-12px_rgba(10,111,85,0.9)]"
              : "border-ink-900/12 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50"
          }`}
        >
          {filter.name}
        </button>
      ))}
    </div>
  );
}

export function VideoGrid({
  items,
  filters,
  labels,
  columns = 4,
}: {
  items: MediaItem[];
  filters?: Filter[];
  labels?: Record<string, string>;
  columns?: 3 | 4;
}) {
  const [filter, setFilter] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const visible = filter ? items.filter((item) => item.serviceSlug === filter) : items;

  if (items.length === 0) return null;

  return (
    <div>
      {filters && filters.length > 1 && (
        <FilterChips
          filters={filters}
          value={filter}
          onChange={(slug) => {
            setFilter(slug);
            setPlaying(null);
          }}
        />
      )}
      <ul className="flex flex-wrap justify-center gap-4">
        {visible.map((item) => {
          const label = labels?.[item.serviceSlug] ?? item.title;
          return (
            <li key={item.id} className={columns === 3 ? TILE_3 : TILE_4}>
              <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink-950 shadow-soft ring-1 ring-ink-900/10">
                {playing === item.id ? (
                  <video
                    src={item.video}
                    poster={item.poster || undefined}
                    className="absolute inset-0 h-full w-full bg-black object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(item.id)}
                    className="group absolute inset-0 block h-full w-full text-left"
                    aria-label={`Play video: ${label}`}
                  >
                    {item.poster ? (
                      <Picture src={item.poster} alt={label} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 270px" />
                    ) : (
                      <video
                        src={`${item.video}#t=0.1`}
                        className="absolute inset-0 h-full w-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-950 transition-transform group-hover:scale-110">
                      <Play className="h-5 w-5 translate-x-[1px] fill-current" />
                    </span>
                    <span className="absolute inset-x-3 bottom-3 truncate text-sm font-semibold text-white">{label}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PhotoGrid({
  items,
  filters,
  columns = 4,
}: {
  items: MediaItem[];
  filters?: Filter[];
  columns?: 3 | 4;
}) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<MediaItem | null>(null);
  const visible = filter ? items.filter((item) => item.serviceSlug === filter) : items;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div>
      {filters && filters.length > 1 && <FilterChips filters={filters} value={filter} onChange={setFilter} />}
      <ul className="flex flex-wrap justify-center gap-4">
        {visible.map((item) => (
          <li key={item.id} className={columns === 3 ? TILE_3 : TILE_4}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-sand-100 shadow-soft ring-1 ring-ink-900/8 transition-transform hover:-translate-y-0.5"
              aria-label={`View photo: ${item.title}`}
            >
              <Picture src={item.poster} alt={item.title} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 290px" />
              <span className="absolute inset-0 bg-ink-950/0 transition-colors group-hover:bg-ink-950/15" />
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-ink-950/92 p-4"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950"
            aria-label="Close photo"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open.poster}
            alt={open.title}
            className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <p className="text-center text-sm font-medium text-white/85">{open.title}</p>
        </div>
      )}
    </div>
  );
}
