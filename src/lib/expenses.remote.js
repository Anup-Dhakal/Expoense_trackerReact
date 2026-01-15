import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

export function subscribeExpenses(target, { from, to }, callback) {
  const { uid, groupId } =
    typeof target === "string" ? { uid: target, groupId: null } : target;
  const colRef = groupId
    ? collection(db, "groups", groupId, "expenses")
    : collection(db, "users", uid, "expenses");

  let q = query(colRef, orderBy("date", "desc")); // date as "YYYY-MM-DD"

  // Optional date filtering (string comparison works with YYYY-MM-DD)
  if (from) q = query(colRef, where("date", ">=", from), orderBy("date", "desc"));
  if (to) q = query(colRef, where("date", "<=", to), orderBy("date", "desc"));

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function addExpense(target, expense) {
  const { uid, groupId } =
    typeof target === "string" ? { uid: target, groupId: null } : target;
  const colRef = groupId
    ? collection(db, "groups", groupId, "expenses")
    : collection(db, "users", uid, "expenses");
  await addDoc(colRef, { ...expense, createdAt: Timestamp.now() });
}

export async function removeExpense(target, expenseId) {
  const { uid, groupId } =
    typeof target === "string" ? { uid: target, groupId: null } : target;
  const ref = groupId
    ? doc(db, "groups", groupId, "expenses", expenseId)
    : doc(db, "users", uid, "expenses", expenseId);
  await deleteDoc(ref);
}
