import { readJSON, writeJSON } from "./storage.js";

const EXPENSES_KEY = "et_expenses";

export function getExpenses(userId) {
  const all = readJSON(EXPENSES_KEY, {});
  return all[userId] || [];
}

export function saveExpenses(userId, expenses) {
  const all = readJSON(EXPENSES_KEY, {});
  all[userId] = expenses;
  writeJSON(EXPENSES_KEY, all);
}
