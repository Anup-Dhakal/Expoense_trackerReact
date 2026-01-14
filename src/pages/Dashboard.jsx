import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../lib/auth.js";
import { getExpenses, saveExpenses } from "../lib/expenses.js";

export default function Dashboard() {
  const nav = useNavigate();
  const user = getCurrentUser();

  const [items, setItems] = useState(() => getExpenses(user.id));

  const todayISO = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayISO);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return items.filter((x) => {
      if (from && x.date < from) return false;
      if (to && x.date > to) return false;
      return true;
    });
  }, [items, from, to]);

  const total = useMemo(() => {
    return filtered.reduce((sum, x) => sum + Number(x.amount || 0), 0);
  }, [filtered]);

  function persist(next) {
    setItems(next);
    saveExpenses(user.id, next);
  }

  function addExpense(e) {
    e.preventDefault();
    const num = Number(amount);
    if (!date || !num) return;

    const newItem = {
      id: crypto.randomUUID(),
      date,
      amount: num,
      category,
      note,
      createdAt: Date.now(),
    };

    persist([newItem, ...items]);
    setAmount("");
    setNote("");
  }

  function removeExpense(id) {
    persist(items.filter((x) => x.id !== id));
  }

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2>Expense Tracker</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>{user.email}</span>
          <button style={styles.smallBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Add Expense</h3>
          <form onSubmit={addExpense} style={styles.form}>
            <label style={styles.label}>
              Date
              <input
                style={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label style={styles.label}>
              Amount
              <input
                style={styles.input}
                inputMode="decimal"
                placeholder="e.g. 250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>

            <label style={styles.label}>
              Category
              <select
                style={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Rent</option>
                <option>Bills</option>
                <option>Shopping</option>
                <option>Health</option>
                <option>Other</option>
              </select>
            </label>

            <label style={styles.label}>
              Note
              <input
                style={styles.input}
                placeholder="optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            <button style={styles.button}>Add</button>
          </form>
        </div>

        <div style={styles.card}>
          <h3>Filter (by date)</h3>
          <div style={styles.form}>
            <label style={styles.label}>
              From
              <input
                style={styles.input}
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label style={styles.label}>
              To
              <input
                style={styles.input}
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <button
              style={styles.smallBtn}
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              Clear filter
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Total</strong>
            <strong>{total}</strong>
          </div>

          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Showing {filtered.length} of {items.length} entries
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Expenses</h3>
        {filtered.length === 0 ? (
          <p style={{ color: "#666" }}>No expenses yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((x) => (
              <div key={x.id} style={styles.row}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {x.category} — {x.amount}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {x.date} {x.note ? `• ${x.note}` : ""}
                  </div>
                </div>
                <button style={styles.smallBtn} onClick={() => removeExpense(x.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1000, margin: "0 auto", padding: 20 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    marginBottom: 20,
  },
  card: { border: "1px solid #ddd", borderRadius: 12, padding: 16 },
  form: { display: "grid", gap: 10, marginTop: 10 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: { padding: 10, borderRadius: 10, border: "1px solid #ccc" },
  button: { padding: 10, borderRadius: 10, border: "1px solid #ccc" },
  smallBtn: { padding: "8px 10px", borderRadius: 10, border: "1px solid #ccc" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
  },
};
