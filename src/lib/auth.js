import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { ensureUserProfile } from "./users";

const googleProvider = new GoogleAuthProvider();

export async function signup({ email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user.uid, {
    email: user.email,
    displayName: user.displayName,
  });
  await sendEmailVerification(user);
  await signOut(auth);
  return user;
}

export async function login({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await reload(user);
  await ensureUserProfile(user.uid, {
    email: user.email,
    displayName: user.displayName,
  });
  return user;
}

export function resendVerification() {
  const user = auth.currentUser;
  if (!user) {
    return Promise.reject(new Error("No authenticated user"));
  }
  return sendEmailVerification(user);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function refreshUser() {
  const user = auth.currentUser;
  if (!user) return Promise.resolve(null);
  return reload(user).then(() => auth.currentUser);
}

export function logout() {
  return signOut(auth);
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(user.uid, {
    email: user.email,
    displayName: user.displayName,
  });
  return user;
}
