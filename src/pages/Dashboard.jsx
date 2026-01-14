import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../lib/auth.js";
import {
  addExpense,
  removeExpense,
  subscribeExpenses,
} from "../lib/expenses.remote.js";
import styles from "./Dashboard.module.css";

export default function Dashboard({ user }) {
  const nav = useNavigate();
  const todayISO = new Date().toISOString().slice(0, 10);

  const [items, setItems] = useState([]);
  const [date, setDate] = useState(todayISO);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeExpenses(user.uid, { from, to }, setItems);
    return () => unsub();
  }, [user?.uid, from, to]);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.amount || 0), 0),
    [items]
  );

  async function onAdd(e) {
    e.preventDefault();
    const num = Number(amount);
    if (!date || !num) return;

    await addExpense(user.uid, {
      date,
      amount: num,
      category,
      note,
    });

    setAmount("");
    setNote("");
  }

  async function onDelete(id) {
    await removeExpense(user.uid, id);
  }

  async function onLogout() {
    await logout();
    nav("/login");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>Expense Tracker</h2>
        <div className={styles.headerActions}>
          <span className={styles.userEmail}>{user?.email ?? ""}</span>
          <button className={styles.smallButton} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Add Expense</h3>
          <form onSubmit={onAdd} className={styles.form}>
            <label className={styles.label}>
              Date
              <input
                className={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <label className={styles.label}>
              Amount
              <input
                className={styles.input}
                inputMode="decimal"
                placeholder="e.g. 250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>

            <label className={styles.label}>
              Category
              <select
                className={styles.input}
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

            <label className={styles.label}>
              Note
              <input
                className={styles.input}
                placeholder="optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            <button className={styles.button}>Add</button>
          </form>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Filter (by date)</h3>
          <div className={styles.form}>
            <label className={styles.label}>
              From
              <input
                className={styles.input}
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              To
              <input
                className={styles.input}
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <button
              className={styles.smallButton}
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              Clear filter
            </button>
          </div>

          <hr className={styles.divider} />

          <div className={styles.summaryRow}>
            <strong>Total</strong>
            <strong>{total}</strong>
          </div>

          <p className={styles.summaryNote}>
            Showing {items.length} entries
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Expenses</h3>
        {items.length === 0 ? (
          <p className={styles.empty}>No expenses yet.</p>
        ) : (
          <div className={styles.expenseList}>
            {items.map((x) => (
              <div key={x.id} className={styles.expenseRow}>
                <div className={styles.expenseInfo}>
                  <div className={styles.expenseTitle}>
                    <span>{x.category}</span>
                    <span className={styles.expenseAmount}>{x.amount}</span>
                  </div>
                  <div className={styles.expenseMeta}>
                    {x.date} {x.note ? `• ${x.note}` : ""}
                  </div>
                </div>
                <button
                  className={`${styles.smallButton} ${styles.dangerButton}`}
                  onClick={() => onDelete(x.id)}
                >
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
