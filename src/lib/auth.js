import { readJSON, writeJSON } from "./storage.js";

const USERS_KEY = "et_users";
const SESSION_KEY = "et_session";

export function signup({ email, password }) {
  const users = readJSON(USERS_KEY, []);
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("User already exists.");

  // NOTE: This is NOT secure. Password stored in localStorage for demo only.
  const newUser = { id: crypto.randomUUID(), email, password };
  users.push(newUser);
  writeJSON(USERS_KEY, users);

  writeJSON(SESSION_KEY, { userId: newUser.id });
  return newUser;
}

export function login({ email, password }) {
  const users = readJSON(USERS_KEY, []);
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) throw new Error("Invalid email or password.");

  writeJSON(SESSION_KEY, { userId: user.id });
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const session = readJSON(SESSION_KEY, null);
  if (!session?.userId) return null;

  const users = readJSON(USERS_KEY, []);
  return users.find((u) => u.id === session.userId) || null;
}
