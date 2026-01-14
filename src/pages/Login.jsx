import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  login,
  observeAuth,
  refreshUser,
  resendVerification,
  resetPassword,
} from "../lib/auth.js";
import styles from "./Auth.module.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [user, setUser] = useState(null);

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
