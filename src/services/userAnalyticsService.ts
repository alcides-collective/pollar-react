import {
  doc,
  updateDoc,
  setDoc,
  increment,
  serverTimestamp,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';

const COLLECTION = 'userAnalytics';

// Module-scoped cache: tracks which "firstX" flags are already set.
// Populated on first record* call per session via ensureDocAndCacheFlags().
let cachedFlags: {
  firstEventAt: boolean;
  firstSourceClickAt: boolean;
  firstBriefAt: boolean;
  firstMapAt: boolean;
} | null = null;
let docEnsured = false;

/**
 * Ensure the userAnalytics doc exists and cache "first use" flags.
 * Called once per session on first record* call.
 */
async function ensureDocAndCacheFlags(uid: string): Promise<void> {
  if (docEnsured || !db) return;
  docEnsured = true;

  const ref = doc(db, COLLECTION, uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      cachedFlags = {
        firstEventAt: data.firstEventAt != null,
        firstSourceClickAt: data.firstSourceClickAt != null,
        firstBriefAt: data.firstBriefAt != null,
        firstMapAt: data.firstMapAt != null,
      };
    } else {
      // Doc doesn't exist (registered before analytics infra). Create with defaults.
      await setDoc(ref, {
        registrationSource: 'unknown',
        registrationMedium: '',
        registrationCampaign: '',
        authProvider: 'unknown',
        totalEventsOpened: 0,
        totalSourcesClicked: 0,
        totalBriefsViewed: 0,
        totalMapActions: 0,
        totalSessions: 0,
        totalSessionDurationSec: 0,
        firstEventAt: null,
        firstSourceClickAt: null,
        firstBriefAt: null,
        firstMapAt: null,
        briefWasFirstTouchpoint: false,
        lastActiveAt: serverTimestamp(),
        activeDays: [new Date().toISOString().split('T')[0]],
      });
      cachedFlags = {
        firstEventAt: false,
        firstSourceClickAt: false,
        firstBriefAt: false,
        firstMapAt: false,
      };
    }
  } catch {
    cachedFlags = { firstEventAt: false, firstSourceClickAt: false, firstBriefAt: false, firstMapAt: false };
  }
}

/**
 * Initialize analytics doc on new user registration.
 */
export async function initUserAnalyticsDoc(
  uid: string,
  utm: { source: string; medium: string; campaign: string },
  authProvider: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, {
    registrationSource: utm.source,
    registrationMedium: utm.medium,
    registrationCampaign: utm.campaign,
    authProvider,
    totalEventsOpened: 0,
    totalSourcesClicked: 0,
    totalBriefsViewed: 0,
    totalMapActions: 0,
    totalSessions: 0,
    totalSessionDurationSec: 0,
    firstEventAt: null,
    firstSourceClickAt: null,
    firstBriefAt: null,
    firstMapAt: null,
    briefWasFirstTouchpoint: false,
    lastActiveAt: serverTimestamp(),
    activeDays: [new Date().toISOString().split('T')[0]],
  });
  docEnsured = true;
  cachedFlags = { firstEventAt: false, firstSourceClickAt: false, firstBriefAt: false, firstMapAt: false };
}

/**
 * Record event_opened. Fire-and-forget.
 */
export function recordEventOpened(uid: string): void {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, COLLECTION, uid);
  const today = new Date().toISOString().split('T')[0];

  ensureDocAndCacheFlags(uid).then(() => {
    const updates: Record<string, unknown> = {
      totalEventsOpened: increment(1),
      lastActiveAt: serverTimestamp(),
      activeDays: arrayUnion(today),
    };
    if (cachedFlags && !cachedFlags.firstEventAt) {
      updates.firstEventAt = serverTimestamp();
      cachedFlags.firstEventAt = true;
    }
    updateDoc(ref, updates).catch(() => {});
  });
}

/**
 * Record source_clicked. Fire-and-forget.
 */
export function recordSourceClicked(uid: string): void {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, COLLECTION, uid);
  const today = new Date().toISOString().split('T')[0];

  ensureDocAndCacheFlags(uid).then(() => {
    const updates: Record<string, unknown> = {
      totalSourcesClicked: increment(1),
      lastActiveAt: serverTimestamp(),
      activeDays: arrayUnion(today),
    };
    if (cachedFlags && !cachedFlags.firstSourceClickAt) {
      updates.firstSourceClickAt = serverTimestamp();
      cachedFlags.firstSourceClickAt = true;
    }
    updateDoc(ref, updates).catch(() => {});
  });
}

/**
 * Record brief_viewed. Fire-and-forget.
 * Also sets briefWasFirstTouchpoint if this is the user's first meaningful action.
 */
export function recordBriefViewed(uid: string): void {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, COLLECTION, uid);
  const today = new Date().toISOString().split('T')[0];

  ensureDocAndCacheFlags(uid).then(() => {
    const updates: Record<string, unknown> = {
      totalBriefsViewed: increment(1),
      lastActiveAt: serverTimestamp(),
      activeDays: arrayUnion(today),
    };
    if (cachedFlags && !cachedFlags.firstBriefAt) {
      updates.firstBriefAt = serverTimestamp();
      cachedFlags.firstBriefAt = true;
      // Brief was first touchpoint if no event was opened before
      if (!cachedFlags.firstEventAt) {
        updates.briefWasFirstTouchpoint = true;
      }
    }
    updateDoc(ref, updates).catch(() => {});
  });
}

/**
 * Record map_used. Fire-and-forget.
 */
export function recordMapUsed(uid: string): void {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, COLLECTION, uid);
  const today = new Date().toISOString().split('T')[0];

  ensureDocAndCacheFlags(uid).then(() => {
    const updates: Record<string, unknown> = {
      totalMapActions: increment(1),
      lastActiveAt: serverTimestamp(),
      activeDays: arrayUnion(today),
    };
    if (cachedFlags && !cachedFlags.firstMapAt) {
      updates.firstMapAt = serverTimestamp();
      cachedFlags.firstMapAt = true;
    }
    updateDoc(ref, updates).catch(() => {});
  });
}

/**
 * Record session end. Fire-and-forget.
 */
export function recordSessionEnd(uid: string, durationSeconds: number): void {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, COLLECTION, uid);
  const today = new Date().toISOString().split('T')[0];

  updateDoc(ref, {
    totalSessions: increment(1),
    totalSessionDurationSec: increment(durationSeconds),
    lastActiveAt: serverTimestamp(),
    activeDays: arrayUnion(today),
  }).catch(() => {});
}
