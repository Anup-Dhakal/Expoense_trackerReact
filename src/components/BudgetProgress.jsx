import { useEffect, useMemo, useState } from "react";
import { subscribeBudgets } from "../lib/budgets.js";
import styles from "./BudgetProgress.module.css";

export default function BudgetProgress({ groupId, expenses }) {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    if (!groupId) return;
    const unsub = subscribeBudgets(groupId, setBudgets);
    return () => unsub();
  }, [groupId]);

  const activeBudgets = useMemo(() => (groupId ? budgets : []), [budgets, groupId]);

  const totalsByCategory = useMemo(() => {
    return expenses.reduce((acc, item) => {
      if (!item?.category) return acc;
      const value = Number(item.amount || 0);
      acc[item.category] = (acc[item.category] || 0) + value;
      return acc;
    }, {});
  }, [expenses]);

  const rows = useMemo(
    () =>
      activeBudgets.map((budget) => {
        const spent = totalsByCategory[budget.category] || 0;
        const limit = Number(budget.limit || 0);
        const max = limit > 0 ? limit : 1;
        const remaining = limit - spent;
        return {
          ...budget,
          spent,
          limit,
          max,
          remaining,
        };
      }),
    [activeBudgets, totalsByCategory]
  );

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.kicker}>Shared budgets</p>
          <h3 className={styles.title}>Budget progress</h3>
        </div>
        {groupId ? <span className={styles.badge}>Active</span> : null}
      </div>

      {!groupId ? (
        <p className={styles.empty}>Select a group to view budgets.</p>
      ) : rows.length === 0 ? (
        <p className={styles.empty}>No budgets available yet.</p>
      ) : (
        <div className={styles.list}>
          {rows.map((row) => (
            <div key={row.id} className={styles.row}>
              <div className={styles.rowHeader}>
                <span className={styles.rowTitle}>{row.category}</span>
                <span className={styles.rowMeta}>
                  {row.spent} / {row.limit}
                </span>
              </div>
              <progress
                className={`${styles.progress} ${
                  row.remaining < 0 ? styles.overBudget : ""
                }`}
                value={row.spent}
                max={row.max}
                aria-label={`${row.category} budget progress`}
              />
              <p className={styles.rowNote}>
                {row.remaining < 0
                  ? `Over budget by ${Math.abs(row.remaining)}`
                  : `${row.remaining} remaining`}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
