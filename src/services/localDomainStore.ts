import type { ExamRecord, LearningActivity, UserProfile } from '../types';

const DB_NAME = 'dia_li_10_persistent_v1';
const DB_VERSION = 1;

export type DomainStoreName =
  | 'attempts'
  | 'pending_attempts'
  | 'activities'
  | 'pending_activities'
  | 'students'
  | 'meta';

const ALL_STORES: DomainStoreName[] = [
  'attempts',
  'pending_attempts',
  'activities',
  'pending_activities',
  'students',
  'meta',
];

const memoryStorageFallback = new Map<string, string>();

export function readStorageSafe(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) {
        memoryStorageFallback.set(key, val);
        return val;
      }
      return memoryStorageFallback.get(key) ?? null;
    }
  } catch {
    // ignore storage access issues
  }
  return memoryStorageFallback.get(key) ?? null;
}

/**
 * Writes to localStorage and RETHROWS QuotaExceededError / write failures
 * so callers can run progressive compaction instead of silently losing data.
 */
export function writeStorageStrict(key: string, value: string): void {
  memoryStorageFallback.set(key, value);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
}

export function writeStorageBestEffort(key: string, value: string): boolean {
  try {
    writeStorageStrict(key, value);
    return true;
  } catch (e) {
    console.warn(`localStorage.setItem failed for ${key}:`, e);
    return false;
  }
}

export function removeStorageSafe(key: string): void {
  memoryStorageFallback.delete(key);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

/**
 * Progressive compaction for ExamRecord arrays stored in size-limited localStorage.
 * Full details always stay preserved in IndexedDB; localStorage retains all summary
 * fields + full details for pending/most recent submissions.
 */
export function writeAttemptsArrayToLocalStorage(
  key: string,
  records: ExamRecord[],
  priorityIds?: Set<string>
): { persistedCount: number; truncated: boolean } {
  const sorted = [...records].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  if (sorted.length === 0) {
    try {
      writeStorageStrict(key, '[]');
      return { persistedCount: 0, truncated: false };
    } catch {
      return { persistedCount: 0, truncated: false };
    }
  }

  // Tier 1: Try writing full array if modest size
  if (sorted.length <= 250) {
    try {
      writeStorageStrict(key, JSON.stringify(sorted));
      return { persistedCount: sorted.length, truncated: false };
    } catch {
      // fall through to progressive compaction
    }
  }

  // Tier 2: Keep full details for priority (pending) + newest 120; compact older details
  const detailBudgets = [120, 40, 10, 0];
  for (const fullLimit of detailBudgets) {
    const compacted = sorted.map((r, idx) => {
      const keepDetails =
        idx < fullLimit || (priorityIds && r.id && priorityIds.has(r.id));
      if (keepDetails) return r;
      if (!Array.isArray(r.details) || r.details.length === 0) return r;
      return { ...r, details: [] };
    });
    try {
      writeStorageStrict(key, JSON.stringify(compacted));
      return { persistedCount: compacted.length, truncated: false };
    } catch {
      // continue compacting
    }
  }

  // Tier 3: Extreme quota pressure — store capped newest subset without losing priority items
  const capBudgets = [800, 400, 150, 50, 20, 10, 5, 1];
  for (const cap of capBudgets) {
    const slice = sorted
      .slice(0, cap)
      .map((r, idx) =>
        (cap > 50 && idx < 10) || (priorityIds && r.id && priorityIds.has(r.id))
          ? r
          : { ...r, details: [] }
      );
    try {
      writeStorageStrict(key, JSON.stringify(slice));
      return {
        persistedCount: slice.length,
        truncated: slice.length < sorted.length,
      };
    } catch {
      // try without any details if priority details still exceeded remaining space
      if (cap <= 50) {
        const strippedSlice = sorted.slice(0, cap).map((r) => ({ ...r, details: [] }));
        try {
          writeStorageStrict(key, JSON.stringify(strippedSlice));
          return {
            persistedCount: strippedSlice.length,
            truncated: strippedSlice.length < sorted.length,
          };
        } catch {
          // continue to smaller cap
        }
      }
    }
  }

  return { persistedCount: 0, truncated: true };
}

export function writeActivitiesArrayToLocalStorage(
  key: string,
  activities: LearningActivity[]
): { persistedCount: number; truncated: boolean } {
  const sorted = [...activities].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const caps = [1500, 800, 300, 100, 30, 10];
  for (const cap of caps) {
    const slice = sorted.slice(0, cap);
    try {
      writeStorageStrict(key, JSON.stringify(slice));
      return {
        persistedCount: slice.length,
        truncated: slice.length < sorted.length,
      };
    } catch {
      // try smaller cap
    }
  }
  return { persistedCount: 0, truncated: true };
}

// =========================================================================
// INDEPENDENT DOMAIN INDEXEDDB PERSISTENCE
// Isolates attempts, activities, students, and pending queues with large quota
// =========================================================================
let openDbPromise: Promise<IDBDatabase | null> | null = null;

function isIndexedDbSupported(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

export function resetDomainDbConnectionForTests(): void {
  openDbPromise = null;
}

function openDomainDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbSupported()) return Promise.resolve(null);
  if (openDbPromise) return openDbPromise;

  openDbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const store of ALL_STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => {
          try {
            db.close();
          } catch {
            // ignore
          }
          openDbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => {
        openDbPromise = null;
        resolve(null);
      };
      req.onblocked = () => {
        resolve(null);
      };
    } catch {
      openDbPromise = null;
      resolve(null);
    }
  });

  return openDbPromise;
}

export async function idbGetAll<T>(storeName: DomainStoreName): Promise<T[]> {
  const db = await openDomainDb();
  if (!db) return [];
  return new Promise<T[]>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve(Array.isArray(req.result) ? (req.result as T[]) : []);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function idbPutMany<T extends { id: string }>(
  storeName: DomainStoreName,
  items: T[]
): Promise<boolean> {
  if (!items || items.length === 0) return true;
  const db = await openDomainDb();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach((item) => {
        if (item && item.id) {
          store.put(item);
        }
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbReplaceAll<T extends { id: string }>(
  storeName: DomainStoreName,
  items: T[]
): Promise<boolean> {
  const db = await openDomainDb();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      items.forEach((item) => {
        if (item && item.id) {
          store.put(item);
        }
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbDeleteById(
  storeName: DomainStoreName,
  id: string
): Promise<boolean> {
  if (!id) return true;
  const db = await openDomainDb();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbGetMeta<T = Record<string, any>>(key: string): Promise<T | null> {
  const db = await openDomainDb();
  if (!db) return null;
  return new Promise<T | null>((resolve) => {
    try {
      const tx = db.transaction('meta', 'readonly');
      const store = tx.objectStore('meta');
      const req = store.get(key);
      req.onsuccess = () => {
        const res = req.result;
        resolve(res && typeof res === 'object' ? (res as T) : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSetMeta(key: string, data: Record<string, any>): Promise<boolean> {
  const db = await openDomainDb();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction('meta', 'readwrite');
      const store = tx.objectStore('meta');
      store.put({ ...data, id: key });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function clearAllAdminDomainStores(): Promise<void> {
  const db = await openDomainDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(['attempts', 'activities', 'students', 'meta'], 'readwrite');
      tx.objectStore('attempts').clear();
      tx.objectStore('activities').clear();
      tx.objectStore('students').clear();
      tx.objectStore('meta').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function sanitizeAttemptMergeKey(rawId: string): string {
  const cleaned = String(rawId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || String(rawId || '');
}

export function mergeExamRecordsKeepingDetails(
  base: ExamRecord | undefined,
  incoming: ExamRecord
): ExamRecord {
  if (!base) return incoming;
  const incomingDetails = Array.isArray(incoming.details) ? incoming.details : [];
  const baseDetails = Array.isArray(base.details) ? base.details : [];
  const details = incomingDetails.length > 0 ? incomingDetails : baseDetails;
  return {
    ...base,
    ...incoming,
    details,
  };
}

export function mergeUserProfilesClean(
  existing: UserProfile | undefined,
  incoming: UserProfile
): UserProfile {
  if (!existing) return incoming;
  return {
    ...existing,
    ...incoming,
  };
}
