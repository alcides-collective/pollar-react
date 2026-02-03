import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  type Timestamp,
} from 'firebase/firestore';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  type User,
} from 'firebase/auth';
import { db, auth, isFirebaseConfigured } from '@/config/firebase';
import type { UserProfile, AuthProviderName } from '@/types/auth';

const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user profile in Firestore
 * Called after successful authentication
 */
export async function createOrUpdateUserProfile(
  user: User,
  authProvider: AuthProviderName
): Promise<UserProfile> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase nie jest skonfigurowany');
  }
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    // Profile exists - update lastActiveAt
    await updateDoc(userRef, {
      lastActiveAt: serverTimestamp(),
    });
    // Include document ID in profile data
    return { ...userDoc.data(), id: userDoc.id } as UserProfile;
  }

  // Create new profile
  const newProfile: Omit<UserProfile, 'createdAt' | 'lastActiveAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    lastActiveAt: ReturnType<typeof serverTimestamp>;
  } = {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName,
    authProvider,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    favoriteCategories: [],
    savedEventIds: [],
    hiddenCategories: [],
    photoURL: user.photoURL,
  };

  await setDoc(userRef, newProfile);

  // Return the profile (with placeholder timestamps since serverTimestamp is server-side)
  return {
    ...newProfile,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp,
    lastActiveAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp,
  };
}

/**
 * Gets a user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }

  // Include document ID in profile data
  return { ...userDoc.data(), id: userDoc.id } as UserProfile;
}

/**
 * Updates user's display name in both Firebase Auth and Firestore
 */
export async function updateUserDisplayName(
  displayName: string
): Promise<void> {
  if (!isFirebaseConfigured || !db || !auth) {
    throw new Error('Firebase nie jest skonfigurowany');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Update Firebase Auth profile
  await updateProfile(user, { displayName });

  // Update Firestore
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  await updateDoc(userRef, { displayName });
}

/**
 * Updates user's photo URL in both Firebase Auth and Firestore
 */
export async function updateUserPhotoURL(photoURL: string): Promise<void> {
  if (!isFirebaseConfigured || !db || !auth) {
    throw new Error('Firebase nie jest skonfigurowany');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Update Firebase Auth profile
  await updateProfile(user, { photoURL });

  // Update Firestore
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  await updateDoc(userRef, { photoURL });
}

/**
 * Changes user password (requires reauthentication for email users)
 */
export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase nie jest skonfigurowany');
  }
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('User not authenticated');

  // Reauthenticate
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPassword);
}

/**
 * Deletes user account (requires reauthentication for email users)
 */
export async function deleteUserAccount(password?: string): Promise<void> {
  if (!isFirebaseConfigured || !db || !auth) {
    throw new Error('Firebase nie jest skonfigurowany');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Reauthenticate if email user
  if (password && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  // Delete Firestore profile
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  await deleteDoc(userRef);

  // Delete Firebase Auth user
  await deleteUser(user);
}

// ============ Saved Events (Bookmarks) ============

/**
 * Adds an event to user's saved events
 */
export async function addSavedEvent(
  uid: string,
  eventId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    savedEventIds: arrayUnion(eventId),
  });
}

/**
 * Removes an event from user's saved events
 */
export async function removeSavedEvent(
  uid: string,
  eventId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    savedEventIds: arrayRemove(eventId),
  });
}

// ============ Hidden Categories ============

/**
 * Adds a category to user's hidden categories
 */
export async function addHiddenCategory(
  uid: string,
  category: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    hiddenCategories: arrayUnion(category),
  });
}

/**
 * Removes a category from user's hidden categories
 */
export async function removeHiddenCategory(
  uid: string,
  category: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    hiddenCategories: arrayRemove(category),
  });
}

// ============ Favorite Categories ============

/**
 * Adds a category to user's favorites
 */
export async function addFavoriteCategory(
  uid: string,
  category: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    favoriteCategories: arrayUnion(category),
  });
}

/**
 * Removes a category from user's favorites
 */
export async function removeFavoriteCategory(
  uid: string,
  category: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    favoriteCategories: arrayRemove(category),
  });
}

// ============ Followed MPs ============

/**
 * Follows an MP (adds to user's followed MPs list)
 */
export async function followMP(uid: string, mpId: number): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    followedMPIds: arrayUnion(mpId),
  });
}

/**
 * Unfollows an MP (removes from user's followed MPs list)
 */
export async function unfollowMP(uid: string, mpId: number): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    followedMPIds: arrayRemove(mpId),
  });
}
