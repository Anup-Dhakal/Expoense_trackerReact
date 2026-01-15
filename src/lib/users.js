import { db } from "./firebase";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  documentId,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

/**
 * Get user profile document
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function subscribeUserProfile(uid, callback) {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() });
  });
}

export function subscribeUserProfiles(userIds, callback) {
  if (!userIds || userIds.length === 0) {
    callback([]);
    return () => {};
  }

  const chunks = chunkArray(userIds, 10);
  const chunkResults = new Map();

  function emitMergedResults() {
    const merged = new Map();
    chunkResults.forEach((items) => {
      items.forEach((item) => {
        merged.set(item.id, item);
      });
    });

    callback(Array.from(merged.values()));
  }

  const unsubscribers = chunks.map((chunk, index) => {
    const q = query(collection(db, "users"), where(documentId(), "in", chunk));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      chunkResults.set(index, items);
      emitMergedResults();
    });
  });

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Create or update user profile document
 * Called on signup/login to ensure profile exists
 * @param {string} uid - User ID
 * @param {Object} data - Profile data (email, displayName)
 * @returns {Promise<void>}
 */
export async function ensureUserProfile(uid, { email, displayName }) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Create new profile
    await setDoc(ref, {
      email: email?.toLowerCase() || "",
      displayName: displayName || "",
      groups: [],
      createdAt: serverTimestamp(),
    });
  } else {
    // Update email/displayName if changed (e.g., Google auth)
    const existing = snap.data();
    const updates = {};
    if (email && existing.email !== email.toLowerCase()) {
      updates.email = email.toLowerCase();
    }
    if (displayName && existing.displayName !== displayName) {
      updates.displayName = displayName;
    }
    if (Object.keys(updates).length > 0) {
      await updateDoc(ref, updates);
    }
  }
}

/**
 * Add a group to user's groups array
 * @param {string} uid - User ID
 * @param {string} groupId - Group ID to add
 * @returns {Promise<void>}
 */
export async function addGroupToUser(uid, groupId) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    groups: arrayUnion(groupId),
  });
}

/**
 * Remove a group from user's groups array
 * @param {string} uid - User ID
 * @param {string} groupId - Group ID to remove
 * @returns {Promise<void>}
 */
export async function removeGroupFromUser(uid, groupId) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    groups: arrayRemove(groupId),
  });
}

/**
 * Update user's display name
 * @param {string} uid - User ID
 * @param {string} displayName - New display name
 * @returns {Promise<void>}
 */
export async function updateDisplayName(uid, displayName) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { displayName });
}
