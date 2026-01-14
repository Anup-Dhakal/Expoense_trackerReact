import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/auth.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      login({ email, password });
      nav("/app");
    } catch (ex) {
      setErr(ex.message || "Login failed");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Login</h2>
        <form onSubmit={onSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err ? <p style={styles.error}>{err}</p> : null}
          <button style={styles.button}>Login</button>
        </form>
        <p>
          No account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center" },
  card: {
    width: 360,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 12,
  },
  form: { display: "grid", gap: 10, marginTop: 10 },
  input: { padding: 10, borderRadius: 10, border: "1px solid #ccc" },
  button: { padding: 10, borderRadius: 10, border: "1px solid #ccc" },
  error: { color: "crimson", margin: 0 },
};
