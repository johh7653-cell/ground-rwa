import test from "node:test";
import assert from "node:assert/strict";
import { WATCHLIST_STORAGE_KEY, decodeWatchlist, toggleWatchlistSlug, writeWatchlist, preserveAndRestartWatchlist } from "./watchlist.ts";

function memoryStorage(raw = null) {
  const items = new Map(raw === null ? [] : [[WATCHLIST_STORAGE_KEY, raw]]);
  return { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => { items.set(key, value); }, items };
}

test("watchlist rejects corruption, unsupported versions, invalid identities and duplicate records without deleting data", () => {
  assert.deepEqual(decodeWatchlist(null), { status: "empty", slugs: [] });
  for (const raw of ["{", "null", "[]", '{"version":2,"slugs":[]}', '{"version":1,"slugs":"spyx"}', '{"version":1,"slugs":["spyx","spyx"]}', '{"version":1,"slugs":["../spyx"]}', '{"version":1,"slugs":[1]}']) {
    assert.equal(decodeWatchlist(raw).status, "invalid", raw);
    const storage = memoryStorage(raw);
    assert.equal(writeWatchlist(storage, "spyx").ok, false);
    assert.equal(storage.getItem(WATCHLIST_STORAGE_KEY), raw);
  }
});

test("unknown or retired identities survive valid changes to other saved assets", () => {
  const storage = memoryStorage(JSON.stringify({ version: 1, slugs: ["retired-reference"] }));
  assert.deepEqual(writeWatchlist(storage, "spyx"), { ok: true, slugs: ["retired-reference", "spyx"] });
  assert.deepEqual(writeWatchlist(storage, "spyx"), { ok: true, slugs: ["retired-reference"] });
  assert.deepEqual(toggleWatchlistSlug(["spyx"], "tslax"), ["spyx", "tslax"]);
});

test("updates reread storage so a newer tab's changes are retained", () => {
  const storage = memoryStorage();
  writeWatchlist(storage, "spyx");
  storage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify({ version: 1, slugs: ["spyx", "xaum"] }));
  assert.deepEqual(writeWatchlist(storage, "tslax"), { ok: true, slugs: ["spyx", "xaum", "tslax"] });
});

test("blocked storage and unretained writes never report success", () => {
  assert.equal(writeWatchlist({ getItem() { throw new Error("blocked"); }, setItem() {} }, "spyx").ok, false);
  assert.equal(writeWatchlist({ getItem() { return null; }, setItem() { throw new Error("quota"); } }, "spyx").ok, false);
  assert.equal(writeWatchlist({ getItem() { return null; }, setItem() {} }, "spyx").ok, false);
});

test("explicit recovery preserves unreadable content before starting a new record", () => {
  const storage = memoryStorage("unreadable-original");
  const result = preserveAndRestartWatchlist(storage, "test");
  assert.equal(result.ok, true);
  assert.equal(storage.getItem(result.backupKey), "unreadable-original");
  assert.deepEqual(decodeWatchlist(storage.getItem(WATCHLIST_STORAGE_KEY)), { status: "valid", slugs: [] });
});

test("recovery cannot replace the original if its backup fails", () => {
  const storage = memoryStorage("broken");
  const failing = { getItem: storage.getItem, setItem(key, value) { if (key !== WATCHLIST_STORAGE_KEY) throw new Error("quota"); storage.setItem(key, value); } };
  assert.equal(preserveAndRestartWatchlist(failing, "test").ok, false);
  assert.equal(storage.getItem(WATCHLIST_STORAGE_KEY), "broken");
});
