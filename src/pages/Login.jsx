import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/auth.js";
import styles from "./Auth.module.css";



export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

function onSubmit(e) {
  e.preventDefault();
  setErr("");
  login({ email, password })
    .then(() => nav("/app"))
    .catch((ex) => setErr(ex?.message || "Login failed"));
}

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
          <button className={styles.button}>Login</button>
        </form>

        <p className={styles.helper}>
          No account? <Link to="/signup" className={styles.link}>Signup</Link>
        </p>
      </div>
    </div>
  );
}
