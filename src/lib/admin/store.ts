import type { CanonicalRoutine } from "@/lib/wushu/types";
import type { ReferenceVideoConfig } from "@/lib/wushu/reference-videos";

const CANONICAL_PREFIX = "stancejudge:canonical:";
const REF_CONFIG_KEY = "stancejudge:ref-config";
const DB_NAME = "stancejudge-admin";
const DB_VERSION = 1;
const VIDEO_STORE = "referenceVideos";

export type ReferenceConfigMap = Record<string, ReferenceVideoConfig>;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE);
      }
    };
  });
}

export function saveCanonicalOverride(
  routineId: string,
  canonical: CanonicalRoutine,
): void {
  localStorage.setItem(
    `${CANONICAL_PREFIX}${routineId}`,
    JSON.stringify(canonical),
  );
}

export function getCanonicalOverride(
  routineId: string,
): CanonicalRoutine | null {
  const raw = localStorage.getItem(`${CANONICAL_PREFIX}${routineId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CanonicalRoutine;
  } catch {
    return null;
  }
}

export function clearCanonicalOverride(routineId: string): void {
  localStorage.removeItem(`${CANONICAL_PREFIX}${routineId}`);
}

export function saveReferenceConfig(config: ReferenceConfigMap): void {
  localStorage.setItem(REF_CONFIG_KEY, JSON.stringify(config));
}

export function getReferenceConfigOverride(): ReferenceConfigMap | null {
  const raw = localStorage.getItem(REF_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReferenceConfigMap;
  } catch {
    return null;
  }
}

export async function saveReferenceVideoBlob(
  routineId: string,
  blob: Blob,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(VIDEO_STORE, "readwrite");
    tx.objectStore(VIDEO_STORE).put(blob, routineId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getReferenceVideoBlobUrl(
  routineId: string,
): Promise<string | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(VIDEO_STORE, "readonly");
    const req = tx.objectStore(VIDEO_STORE).get(routineId);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function clearReferenceVideoBlob(routineId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(VIDEO_STORE, "readwrite");
    tx.objectStore(VIDEO_STORE).delete(routineId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function coachPinRequired(): boolean {
  const pin = process.env.NEXT_PUBLIC_COACH_PIN?.trim();
  return Boolean(pin);
}

export function verifyCoachPin(pin: string): boolean {
  const expected = process.env.NEXT_PUBLIC_COACH_PIN?.trim();
  if (!expected) return true;
  return pin === expected;
}

export const COACH_SESSION_KEY = "stancejudge:coach-unlocked";
