import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  login,
  logout,
  observeAuth,
  refreshUser,
  resendVerification,
  resetPassword,
  signInWithGoogle,
} from "../lib/auth.js";
import styles from "./Auth.module.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = observeAuth(setUser);
    return () => unsub();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    try {
      const currentUser = await login({ email, password });
      if (!currentUser?.emailVerified) {
        await logout();
        setInfo("Please verify your email to continue.");
        return;
      }
      nav("/app");
    } catch (ex) {
      setErr(ex?.message || "Login failed");
    }
  }

  async function onResendVerification() {
    setErr("");
    setInfo("");
    try {
      await resendVerification();
      setInfo("Verification email sent.");
    } catch (ex) {
      setErr(ex?.message || "Could not resend verification email");
    }
  }

  async function onResetPassword() {
    setErr("");
    setInfo("");
    if (!email) {
      setErr("Enter your email to reset password.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Password reset email sent.");
    } catch (ex) {
      setErr(ex?.message || "Could not send reset email");
    }
  }

  async function onRefreshVerification() {
    setErr("");
    setInfo("");
    try {
      const refreshedUser = await refreshUser();
      if (refreshedUser?.emailVerified) {
        nav("/app");
        return;
      }
      setInfo("Email is still not verified yet.");
    } catch (ex) {
      setErr(ex?.message || "Could not refresh verification status");
    }
  }

  async function onGoogleSignIn() {
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      await signInWithGoogle();
      nav("/app");
    } catch (ex) {
      setErr(ex?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  const needsVerification = user && !user.emailVerified;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>Expense Tracker</p>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to manage your expenses.</p>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {err ? <p className={styles.error}>{err}</p> : null}
          {info ? <p className={styles.success}>{info}</p> : null}
          <button className={styles.button}>Login</button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={styles.googleButton}
          onClick={onGoogleSignIn}
          disabled={loading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className={styles.helper}>
          <button type="button" className={styles.link} onClick={onResetPassword}>
            Forgot password?
          </button>
        </div>

        {needsVerification ? (
          <div className={styles.helper}>
            <button type="button" className={styles.link} onClick={onResendVerification}>
              Resend verification email
            </button>
            <button type="button" className={styles.link} onClick={onRefreshVerification}>
              I verified my email
            </button>
          </div>
        ) : null}

        <p className={styles.helper}>
          No account? <Link to="/signup" className={styles.link}>Signup</Link>
        </p>
      </div>
    </div>
  );
}
