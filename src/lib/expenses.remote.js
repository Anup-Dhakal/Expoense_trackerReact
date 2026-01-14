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

export function subscribeExpenses(uid, { from, to }, callback) {
  const colRef = collection(db, "users", uid, "expenses");

  let q = query(colRef, orderBy("date", "desc")); // date as "YYYY-MM-DD"

  // Optional date filtering (string comparison works with YYYY-MM-DD)
  if (from) q = query(colRef, where("date", ">=", from), orderBy("date", "desc"));
  if (to) q = query(colRef, where("date", "<=", to), orderBy("date", "desc"));

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function addExpense(uid, expense) {
  const colRef = collection(db, "users", uid, "expenses");
  await addDoc(colRef, { ...expense, createdAt: Timestamp.now() });
}

export async function removeExpense(uid, expenseId) {
  const ref = doc(db, "users", uid, "expenses", expenseId);
  await deleteDoc(ref);
}
