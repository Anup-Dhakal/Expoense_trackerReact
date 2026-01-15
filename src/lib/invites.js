import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { addGroupToUser } from "./users.js";

export async function getInvite(inviteId) {
  const ref = doc(db, "invites", inviteId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createInvite({ groupId, groupName, email, role, invitedBy }) {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    throw new Error("Invite email is required.");
  }

  await addDoc(collection(db, "invites"), {
    groupId,
    groupName,
    email: trimmedEmail,
    role,
    invitedBy,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeInvitesByEmail(email, callback) {
  if (!email) {
    callback([]);
    return () => {};
  }

  const trimmedEmail = email.trim().toLowerCase();
  const q = query(
    collection(db, "invites"),
    where("email", "==", trimmedEmail)
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(items);
  });
}

export function subscribePendingInvites(email, callback) {
  if (!email) {
    callback([]);
    return () => {};
  }

  const trimmedEmail = email.trim().toLowerCase();
  const q = query(
    collection(db, "invites"),
    where("email", "==", trimmedEmail),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(items);
  });
}

export async function acceptInvite(inviteId, userId) {
  const inviteRef = doc(db, "invites", inviteId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error("Invite not found.");
  }

  const invite = inviteSnap.data();
  if (invite.status !== "pending") {
    throw new Error("Invite is no longer available.");
  }

  const groupRef = doc(db, "groups", invite.groupId);
  const batch = writeBatch(db);

  batch.update(inviteRef, {
    status: "accepted",
    acceptedBy: userId,
    updatedAt: serverTimestamp(),
  });

  batch.update(groupRef, {
    [`members.${userId}`]: invite.role || "viewer",
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  await addGroupToUser(userId, invite.groupId);
}

export async function declineInvite(inviteId, userId) {
  const inviteRef = doc(db, "invites", inviteId);
  await updateDoc(inviteRef, {
    status: "declined",
    declinedBy: userId,
    updatedAt: serverTimestamp(),
  });
}
