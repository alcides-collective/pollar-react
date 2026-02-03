import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db, auth, isFirebaseConfigured } from '@/config/firebase';

/**
 * Upload avatar image to Firebase Storage
 * @param uid User ID
 * @param file Image file to upload
 * @returns Download URL of uploaded image
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
  if (!isFirebaseConfigured || !storage || !db) {
    throw new Error('Firebase nie jest skonfigurowany');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Plik musi być obrazem');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Plik jest zbyt duży (maksymalnie 5MB)');
  }

  // Generate unique filename
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `avatar_${Date.now()}.${extension}`;
  const storageRef = ref(storage, `avatars/${uid}/${filename}`);

  // Upload file
  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);

  // Update user profile in Firebase Auth
  const currentUser = auth.currentUser;
  if (currentUser) {
    await updateProfile(currentUser, { photoURL: downloadURL });
  }

  // Update user profile in Firestore
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { photoURL: downloadURL });

  return downloadURL;
}

/**
 * Delete user's avatar from Firebase Storage
 * @param uid User ID
 * @param photoURL Current photo URL to delete
 */
export async function deleteAvatar(uid: string, photoURL: string): Promise<void> {
  if (!isFirebaseConfigured || !storage || !db) {
    throw new Error('Firebase nie jest skonfigurowany');
  }

  // Only delete if it's a Firebase Storage URL
  if (!photoURL.includes('firebasestorage.googleapis.com')) {
    return;
  }

  try {
    // Extract path from URL and create reference
    const storageRef = ref(storage, photoURL);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore errors if file doesn't exist
    console.warn('Could not delete old avatar:', error);
  }

  // Clear photoURL in Firebase Auth
  const currentUser = auth?.currentUser;
  if (currentUser) {
    await updateProfile(currentUser, { photoURL: null });
  }

  // Clear photoURL in Firestore
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { photoURL: null });
}
