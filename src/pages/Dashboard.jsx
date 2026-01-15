import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../lib/auth.js";
import {
  addExpense,
  removeExpense,
  subscribeExpenses,
} from "../lib/expenses.remote.js";
import styles from "./Dashboard.module.css";

const CATEGORY_META = {
  Food: { icon: "🍽️", tagClass: "tagFood" },
  Transport: { icon: "🚌", tagClass: "tagTransport" },
  Rent: { icon: "🏠", tagClass: "tagRent" },
  Bills: { icon: "🧾", tagClass: "tagBills" },
  Shopping: { icon: "🛍️", tagClass: "tagShopping" },
  Health: { icon: "💊", tagClass: "tagHealth" },
  Other: { icon: "📌", tagClass: "tagOther" },
};

const CHART_DAYS = 7;

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

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeExpenses(user.uid, { from, to }, setItems);
    return () => unsub();
  }, [user?.uid, from, to]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.amount || 0), 0),
    [items]
  );

  const average = useMemo(
    () => (items.length ? total / items.length : 0),
    [items, total]
  );

  const formattedTotal = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(total),
    [total]
  );

  const formattedAverage = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(average),
    [average]
  );

  const rangeLabel = useMemo(() => {
    if (from || to) {
      return `${from || "Start"} → ${to || "Today"}`;
    }
    return "Last 30 days";
  }, [from, to]);

  const chartData = useMemo(() => {
    const totalsByDate = items.reduce((acc, item) => {
      if (!item?.date) return acc;
      const value = Number(item.amount || 0);
      acc[item.date] = (acc[item.date] || 0) + value;
      return acc;
    }, {});

    const days = Array.from({ length: CHART_DAYS }, (_, index) => {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - (CHART_DAYS - 1 - index));
      const iso = dateObj.toISOString().slice(0, 10);
      const label = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const value = totalsByDate[iso] || 0;
      return { iso, label, value };
    });

    const maxValue = Math.max(...days.map((day) => day.value), 1);

    return days.map((day) => {
      const level = Math.min(5, Math.round((day.value / maxValue) * 5));
      return {
        ...day,
        level,
      };
    });
  }, [items]);

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

  function onToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const isDark = theme === "dark";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Expense Tracker</p>
          <h2 className={styles.title}>Your Dashboard</h2>
          <p className={styles.subtitle}>Track, review, and grow your savings.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.userEmail}>{user?.email ?? ""}</span>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            <span className={styles.themeIcon} aria-hidden="true">
              {isDark ? "🌙" : "☀️"}
            </span>
            {isDark ? "Dark" : "Light"}
          </button>
          <button className={styles.smallButton} onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <div className={`${styles.card} ${styles.heroCard}`}>
          <div>
            <p className={styles.heroLabel}>Total spend</p>
            <h3 className={styles.heroAmount}>{formattedTotal}</h3>
            <p className={styles.heroNote}>{rangeLabel}</p>
          </div>
          <div className={styles.heroMeta}>
            <div>
              <p className={styles.metaLabel}>Entries</p>
              <p className={styles.metaValue}>{items.length}</p>
            </div>
            <div>
              <p className={styles.metaLabel}>Avg. spend</p>
              <p className={styles.metaValue}>{formattedAverage}</p>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.chartCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Weekly trend</h3>
            <span className={styles.cardBadge}>Last 7 days</span>
          </div>
          <div className={styles.chart}>
            {chartData.map((day) => (
              <div key={day.iso} className={styles.chartBar}>
                <div
                  className={`${styles.chartFill} ${styles[`barLevel${day.level}`]}`}
                  aria-hidden="true"
                />
                <span className={styles.chartLabel}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.tipCard}`}>
          <h3 className={styles.cardTitle}>Spending tip</h3>
          <p className={styles.tipText}>
            Keep notes on bigger purchases to spot patterns faster.
          </p>
          <div className={styles.tipFooter}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✨
            </span>
            Small habits make big wins.
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Add expense</h3>
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

            <button className={styles.button}>Add expense</button>
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
            <strong>{formattedTotal}</strong>
          </div>

          <p className={styles.summaryNote}>Showing {items.length} entries</p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent expenses</h3>
          <span className={styles.cardBadge}>Latest</span>
        </div>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              📊
            </span>
            <p className={styles.empty}>No expenses yet.</p>
            <p className={styles.emptyHint}>Add your first item to see trends.</p>
          </div>
        ) : (
          <div className={styles.expenseList}>
            {items.map((x) => {
              const meta = CATEGORY_META[x.category] || CATEGORY_META.Other;
              const tagClass = styles[meta.tagClass];
              return (
                <div key={x.id} className={styles.expenseRow}>
                  <div className={styles.expenseInfo}>
                    <div className={styles.expenseTitle}>
                      <span className={styles.categoryIcon} aria-hidden="true">
                        {meta.icon}
                      </span>
                      <span className={`${styles.tag} ${tagClass}`}>
                        {x.category}
                      </span>
                      <span className={styles.expenseAmount}>{x.amount}</span>
                    </div>
                    <div className={styles.expenseMeta}>
                      {x.date} {x.note ? `• ${x.note}` : ""}
                    </div>
                  </div>
                  <button
                    className={`${styles.smallButton} ${styles.dangerButton}`}
                    onClick={() => onDelete(x.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
