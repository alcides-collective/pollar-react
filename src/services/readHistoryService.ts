import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import type { ReadHistoryEntry } from '@/types/auth';

const USERS_COLLECTION = 'users';
const READ_HISTORY_SUBCOLLECTION = 'readHistory';

/**
 * Adds an event to user's read history
 */
export async function addToReadHistory(
  uid: string,
  eventId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const historyRef = doc(
    db,
    USERS_COLLECTION,
    uid,
    READ_HISTORY_SUBCOLLECTION,
    eventId
  );

  await setDoc(historyRef, {
    eventId,
    readAt: serverTimestamp(),
  });
}

/**
 * Gets user's read history
 */
export async function getReadHistory(
  uid: string,
  limit: number = 50
): Promise<ReadHistoryEntry[]> {
  if (!isFirebaseConfigured || !db) return [];

  const historyRef = collection(
    db,
    USERS_COLLECTION,
    uid,
    READ_HISTORY_SUBCOLLECTION
  );

  const q = query(
    historyRef,
    orderBy('readAt', 'desc'),
    firestoreLimit(limit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    eventId: doc.data().eventId,
    readAt: doc.data().readAt as Timestamp,
  }));
}

/**
 * Gets IDs of all read events (for quick lookup)
 */
export async function getReadEventIds(uid: string): Promise<string[]> {
  if (!isFirebaseConfigured || !db) return [];

  const historyRef = collection(
    db,
    USERS_COLLECTION,
    uid,
    READ_HISTORY_SUBCOLLECTION
  );

  const snapshot = await getDocs(historyRef);

  return snapshot.docs.map((doc) => doc.data().eventId);
}

/**
 * Clears user's read history
 */
export async function clearReadHistory(uid: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const historyRef = collection(
    db,
    USERS_COLLECTION,
    uid,
    READ_HISTORY_SUBCOLLECTION
  );

  const snapshot = await getDocs(historyRef);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

/**
 * Removes a single event from read history
 */
export async function removeFromReadHistory(
  uid: string,
  eventId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const historyRef = doc(
    db,
    USERS_COLLECTION,
    uid,
    READ_HISTORY_SUBCOLLECTION,
    eventId
  );

  await deleteDoc(historyRef);
}
