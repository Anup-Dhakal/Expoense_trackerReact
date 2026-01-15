import { db } from "./firebase";
import {
  collection,
  deleteDoc,
  deleteField,
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

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function createGroup({ name, ownerId }) {
  const ref = doc(collection(db, "groups"));
  const trimmedName = name.trim();

  await setDoc(ref, {
    name: trimmedName,
    owner: ownerId,
    members: {
      [ownerId]: "admin",
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function getGroup(groupId) {
  const ref = doc(db, "groups", groupId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function subscribeGroup(groupId, callback) {
  const ref = doc(db, "groups", groupId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() });
  });
}

export function subscribeUserGroups(groupIds, callback) {
  if (!groupIds || groupIds.length === 0) {
    callback([]);
    return () => {};
  }

  const chunks = chunkArray(groupIds, 10);
  const chunkResults = new Map();

  function emitMergedResults() {
    const merged = new Map();
    chunkResults.forEach((items) => {
      items.forEach((item) => {
        merged.set(item.id, item);
      });
    });

    const list = Array.from(merged.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    callback(list);
  }

  const unsubscribers = chunks.map((chunk, index) => {
    const q = query(collection(db, "groups"), where(documentId(), "in", chunk));
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

export async function updateGroupName(groupId, name) {
  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, {
    name: name.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function addMemberToGroup(groupId, uid, role) {
  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, {
    [`members.${uid}`]: role,
    updatedAt: serverTimestamp(),
  });
}

export async function updateMemberRole(groupId, uid, role) {
  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, {
    [`members.${uid}`]: role,
    updatedAt: serverTimestamp(),
  });
}

export async function removeMemberFromGroup(groupId, uid) {
  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, {
    [`members.${uid}`]: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGroup(groupId) {
  const ref = doc(db, "groups", groupId);
  await deleteDoc(ref);
}
