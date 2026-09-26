export const WATCHLIST_STORAGE_KEY = "ground:watchlist:v1";
export const WATCHLIST_STORAGE_EVENT = "ground-watchlist-storage";

export interface SavedWatchlist { version: 1; slugs: string[]; }
export interface WatchlistStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export type WatchlistRecord = { status: "empty" | "valid"; slugs: string[] } | { status: "invalid"; slugs: []; message: string };
export type WatchlistWriteResult = { ok: true; slugs: string[]; backupKey?: string } | { ok: false; message: string };

function validSlug(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 240 && value.trim() === value && !/[\u0000-\u001f/\\?#]/.test(value);
}

export function decodeWatchlist(raw: string | null): WatchlistRecord {
  if (raw === null) return { status: "empty", slugs: [] };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { status: "invalid", slugs: [], message: "The saved watchlist could not be read. Its original data has been kept." }; }
  if (typeof value !== "object" || value === null || Array.isArray(value) || !("version" in value) || value.version !== 1 || !("slugs" in value) || !Array.isArray(value.slugs) || value.slugs.length > 10_000 || !value.slugs.every(validSlug) || new Set(value.slugs).size !== value.slugs.length) {
    return { status: "invalid", slugs: [], message: "The saved watchlist has an unsupported or invalid format. Its original data has been kept." };
  }
  return { status: "valid", slugs: [...value.slugs] };
}

export function toggleWatchlistSlug(slugs: string[], slug: string): string[] {
  if (!validSlug(slug)) throw new Error("Invalid asset reference");
  return slugs.includes(slug) ? slugs.filter((item) => item !== slug) : [...slugs, slug];
}

export function writeWatchlist(storage: WatchlistStorage, slug: string): WatchlistWriteResult {
  try {
    const record = decodeWatchlist(storage.getItem(WATCHLIST_STORAGE_KEY));
    if (record.status === "invalid") return { ok: false, message: record.message };
    const slugs = toggleWatchlistSlug(record.slugs, slug);
    if (slugs.length > 10_000) return { ok: false, message: "This watchlist has reached its storage limit. Remove a saved reference before adding another." };
    const serialized = JSON.stringify({ version: 1, slugs } satisfies SavedWatchlist);
    storage.setItem(WATCHLIST_STORAGE_KEY, serialized);
    if (storage.getItem(WATCHLIST_STORAGE_KEY) !== serialized) return { ok: false, message: "This browser did not retain the change. Your watchlist has not been updated." };
    return { ok: true, slugs };
  } catch {
    return { ok: false, message: "This browser could not save the change. Check local storage permissions or available space." };
  }
}

/** Recovery is explicit and first preserves the unreadable record under another key. */
export function preserveAndRestartWatchlist(storage: WatchlistStorage, recoveryId: string): WatchlistWriteResult {
  try {
    const raw = storage.getItem(WATCHLIST_STORAGE_KEY);
    if (decodeWatchlist(raw).status !== "invalid" || raw === null) return { ok: false, message: "The saved record has changed. Refresh its status before restarting." };
    const backupKey = `${WATCHLIST_STORAGE_KEY}:recovery:${recoveryId}`;
    if (storage.getItem(backupKey) !== null) return { ok: false, message: "The recovery record already exists. The saved watchlist has not been replaced." };
    storage.setItem(backupKey, raw);
    if (storage.getItem(backupKey) !== raw) return { ok: false, message: "The original data could not be preserved. The watchlist has not been replaced." };
    const serialized = JSON.stringify({ version: 1, slugs: [] } satisfies SavedWatchlist);
    storage.setItem(WATCHLIST_STORAGE_KEY, serialized);
    if (storage.getItem(WATCHLIST_STORAGE_KEY) !== serialized) return { ok: false, message: "The new watchlist could not be saved. The recovery copy of the original data remains available." };
    return { ok: true, slugs: [], backupKey };
  } catch {
    return { ok: false, message: "This browser could not preserve and restart the watchlist. The original record was not deliberately removed." };
  }
}
