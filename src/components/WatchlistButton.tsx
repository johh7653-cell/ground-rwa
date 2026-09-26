"use client";

import { Star } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { WATCHLIST_STORAGE_EVENT, WATCHLIST_STORAGE_KEY, decodeWatchlist, preserveAndRestartWatchlist, writeWatchlist } from "@/lib/watchlist";
import styles from "./WatchlistButton.module.css";

const UNAVAILABLE = Symbol("watchlist-unavailable");
const LOADING = Symbol("watchlist-loading");
type WatchlistSnapshot = string | null | typeof UNAVAILABLE | typeof LOADING;
interface WatchlistState { status: "loading" | "unavailable" | "empty" | "valid" | "invalid"; slugs: string[]; message: string; raw: string | null; }

function subscribeToWatchlist(onChange: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === WATCHLIST_STORAGE_KEY || event.key === null) onChange(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(WATCHLIST_STORAGE_EVENT, onChange);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(WATCHLIST_STORAGE_EVENT, onChange); };
}
function readWatchlistStorage(): WatchlistSnapshot { try { return window.localStorage.getItem(WATCHLIST_STORAGE_KEY); } catch { return UNAVAILABLE; } }
function serverWatchlistStorage(): WatchlistSnapshot { return LOADING; }
function notifyWatchlist() { window.dispatchEvent(new Event(WATCHLIST_STORAGE_EVENT)); }

export function useWatchlist(): WatchlistState {
  const raw = useSyncExternalStore(subscribeToWatchlist, readWatchlistStorage, serverWatchlistStorage);
  if (raw === LOADING) return { status: "loading" as const, slugs: [] as string[], message: "Loading your saved references…", raw: null };
  if (raw === UNAVAILABLE) return { status: "unavailable" as const, slugs: [] as string[], message: "Local storage is unavailable. This browser cannot read or save your watchlist.", raw: null };
  const record = decodeWatchlist(raw);
  return { ...record, message: record.status === "invalid" ? record.message : "", raw };
}

export function WatchlistButton({ slug, symbol, compact = false }: { slug: string; symbol?: string; compact?: boolean }) {
  const record = useWatchlist();
  const [feedback, setFeedback] = useState("");
  const saved = record.slugs.includes(slug);
  const disabled = record.status === "loading" || record.status === "unavailable" || record.status === "invalid";
  const label = `${saved ? "Remove" : "Save"} ${symbol ?? slug} ${saved ? "from" : "to"} watchlist`;

  function toggle() {
    let result;
    try { result = writeWatchlist(window.localStorage, slug); } catch { result = { ok: false as const, message: "Local storage is unavailable. This change has not been saved." }; }
    notifyWatchlist();
    setFeedback(result.ok ? `${symbol ?? slug} ${result.slugs.includes(slug) ? "saved to" : "removed from"} your watchlist.` : result.message);
  }

  return <span className={`${styles.wrapper} ${compact ? styles.compactWrapper : ""}`}>
    <button type="button" className={`${styles.button} ${saved ? styles.saved : ""} ${compact ? styles.compact : ""}`} onClick={toggle} disabled={disabled} aria-pressed={saved} aria-label={label} title={disabled ? record.message : label}><Star size={compact ? 16 : 17} aria-hidden="true" fill={saved ? "currentColor" : "none"} />{compact ? null : saved ? "Saved to watchlist" : "Save to watchlist"}</button>
    {feedback ? <span className={styles.feedback} role="status">{feedback}</span> : null}
    {!compact && disabled && record.message ? <span className={styles.feedback} role="status">{record.message}</span> : null}
  </span>;
}

export function WatchlistNotice() {
  const record = useWatchlist();
  const [feedback, setFeedback] = useState("");
  if (record.status !== "invalid" && record.status !== "unavailable" && !feedback) return null;

  async function copyOriginal() {
    if (record.raw === null) return;
    try { await navigator.clipboard.writeText(record.raw); setFeedback("The original saved data was copied."); } catch { setFeedback("Copy is unavailable in this browser. The original record remains stored."); }
  }
  function recover() {
    let result;
    try { result = preserveAndRestartWatchlist(window.localStorage, crypto.randomUUID()); } catch { result = { ok: false as const, message: "This browser could not preserve and restart the watchlist." }; }
    notifyWatchlist();
    setFeedback(result.ok ? "A new watchlist is ready. A recovery copy of the original data remains on this device." : result.message);
  }
  return <aside className={styles.notice} aria-label="Watchlist storage status">
    {record.message ? <p>{record.message}</p> : null}
    {record.status === "invalid" ? <div className={styles.noticeActions}><button type="button" onClick={copyOriginal}>Copy original saved data</button><button type="button" onClick={recover}>Preserve original and start a new list</button></div> : null}
    {feedback ? <p role="status">{feedback}</p> : null}
  </aside>;
}
