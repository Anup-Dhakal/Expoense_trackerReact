import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export function subscribeBudgets(groupId, callback) {
  const colRef = collection(db, "groups", groupId, "budgets");
  const q = query(colRef, orderBy("category", "asc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(items);
  });
}

export async function addBudget(groupId, budget) {
  const colRef = collection(db, "groups", groupId, "budgets");
  await addDoc(colRef, {
    ...budget,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBudget(groupId, budgetId, updates) {
  const ref = doc(db, "groups", groupId, "budgets", budgetId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function removeBudget(groupId, budgetId) {
  const ref = doc(db, "groups", groupId, "budgets", budgetId);
  await deleteDoc(ref);
}
