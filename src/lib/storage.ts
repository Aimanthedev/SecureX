// Local persistence layer for the SecureX demo.
//
// Canonical demo data lives in mock-data.ts (source-controlled) so a fresh
// browser/device is always fully populated. This module only stores the
// DELTA a user makes on top of that seed: records they create, edits/patches
// to seed or created records, and ids of seed records they "delete".
//
// effectiveData = seed + created - deleted, with overrides merged in.

export type DB = {
  version: number;
  created: Record<string, Record<string, unknown>[]>;
  overrides: Record<string, Record<string, Record<string, unknown>>>;
  deletedIds: Record<string, string[]>;
  settings: Record<string, unknown>;
};

const STORAGE_KEY = "securex.demo.db";
const STORAGE_VERSION = 1;

function emptyDB(): DB {
  return { version: STORAGE_VERSION, created: {}, overrides: {}, deletedIds: {}, settings: {} };
}

export function loadDB(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDB();
    const parsed = JSON.parse(raw) as Partial<DB>;
    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION) {
      // Old/incompatible schema — start clean rather than risk a white screen.
      return emptyDB();
    }
    return {
      version: STORAGE_VERSION,
      created: parsed.created ?? {},
      overrides: parsed.overrides ?? {},
      deletedIds: parsed.deletedIds ?? {},
      settings: parsed.settings ?? {},
    };
  } catch {
    return emptyDB();
  }
}

export function saveDB(db: DB) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota exceeded or storage unavailable — fail silently, demo stays usable in-memory.
  }
}

export function resetDB(): DB {
  const fresh = emptyDB();
  saveDB(fresh);
  return fresh;
}

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
