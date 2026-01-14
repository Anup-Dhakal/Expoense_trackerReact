import { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../lib/auth.js";
import styles from "./Auth.module.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    try {
      await signup({ email, password });
      setInfo("Account created. Check your email to verify before logging in.");
    } catch (ex) {
      setErr(ex?.message || "Signup failed");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>Expense Tracker</p>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>Start tracking and stay in control.</p>
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
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {err ? <p className={styles.error}>{err}</p> : null}
          {info ? <p className={styles.success}>{info}</p> : null}
          <button className={styles.button}>Create account</button>
        </form>

        <p className={styles.helper}>
          Have an account? <Link to="/login" className={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}
