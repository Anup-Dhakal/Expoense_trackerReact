import { useEffect, useMemo, useState } from "react";
import {
  addBudget,
  removeBudget,
  subscribeBudgets,
  updateBudget,
} from "../lib/budgets.js";
import styles from "./BudgetManager.module.css";

const DEFAULT_PERIOD = "monthly";

export default function BudgetManager({
  groupId,
  userId,
  categories,
  canManage,
}) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState(categories[0] || "Food");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeUpdateId, setActiveUpdateId] = useState(null);

  useEffect(() => {
    if (!groupId) {
      setBudgets([]);
      return;
    }

    const unsub = subscribeBudgets(groupId, setBudgets);
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    setDrafts((prev) =>
      budgets.reduce((acc, budget) => {
        acc[budget.id] = prev[budget.id] || {
          limit: budget.limit ? String(budget.limit) : "",
          period: budget.period || DEFAULT_PERIOD,
        };
        return acc;
      }, {})
    );
  }, [budgets]);

  const sortedBudgets = useMemo(
    () =>
      [...budgets].sort((a, b) =>
        (a.category || "").localeCompare(b.category || "")
      ),
    [budgets]
  );

  async function handleAddBudget(event) {
    event.preventDefault();
    const parsedLimit = Number(limit);

    if (!groupId) {
      setError("Select a group to manage budgets.");
      return;
    }

    if (!canManage) {
      setError("Only admins can manage budgets.");
      return;
    }

    if (!category) {
      setError("Choose a category for this budget.");
      return;
    }

    if (!parsedLimit || parsedLimit <= 0) {
      setError("Enter a valid limit to continue.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await addBudget(groupId, {
        category,
        limit: parsedLimit,
        period,
        createdBy: userId,
      });
      setLimit("");
    } catch (err) {
      setError(err?.message || "Unable to add budget.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDraftChange(budgetId, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [budgetId]: {
        ...prev[budgetId],
        [field]: value,
      },
    }));
  }

  async function handleUpdateBudget(budgetId) {
    const draft = drafts[budgetId];
    const parsedLimit = Number(draft?.limit);

    if (!draft?.period || !parsedLimit || parsedLimit <= 0) {
      setError("Each budget needs a valid limit and period.");
      return;
    }

    setError("");
    setActiveUpdateId(budgetId);

    try {
      await updateBudget(groupId, budgetId, {
        limit: parsedLimit,
        period: draft.period,
      });
    } catch (err) {
      setError(err?.message || "Unable to update budget.");
    } finally {
      setActiveUpdateId(null);
    }
  }

  async function handleRemoveBudget(budgetId) {
    setError("");
    setActiveUpdateId(budgetId);

    try {
      await removeBudget(groupId, budgetId);
    } catch (err) {
      setError(err?.message || "Unable to remove budget.");
    } finally {
      setActiveUpdateId(null);
    }
  }

  return (
    <section className={styles.card}>
      <div>
        <p className={styles.kicker}>Shared budgets</p>
        <h3 className={styles.title}>Budget limits</h3>
        <p className={styles.helper}>
          Set monthly or weekly caps for each spending category.
        </p>
      </div>

      {!groupId ? (
        <p className={styles.emptyState}>Select a group to manage budgets.</p>
      ) : (
        <>
          <form className={styles.form} onSubmit={handleAddBudget}>
            <label className={styles.label}>
              Category
              <select
                className={styles.input}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={!canManage}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.label}>
              Limit
              <input
                className={styles.input}
                inputMode="decimal"
                placeholder="e.g. 1200"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                disabled={!canManage}
              />
            </label>
            <label className={styles.label}>
              Period
              <select
                className={styles.input}
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                disabled={!canManage}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            {canManage ? null : (
              <p className={styles.helper}>Only admins can edit budgets.</p>
            )}
            <button
              className={styles.button}
              type="submit"
              disabled={isSaving || !canManage}
            >
              {isSaving ? "Saving..." : "Add budget"}
            </button>
          </form>

          {error ? <p className={styles.error}>{error}</p> : null}

          {sortedBudgets.length === 0 ? (
            <p className={styles.emptyState}>No budgets set yet.</p>
          ) : (
            <div className={styles.list}>
              {sortedBudgets.map((budget) => (
                <div key={budget.id} className={styles.row}>
                  <div>
                    <p className={styles.rowTitle}>{budget.category}</p>
                    <p className={styles.rowMeta}>Current limit: {budget.limit}</p>
                  </div>
                  <div className={styles.rowControls}>
                    <input
                      className={styles.smallInput}
                      inputMode="decimal"
                      value={drafts[budget.id]?.limit || ""}
                      onChange={(event) =>
                        handleDraftChange(budget.id, "limit", event.target.value)
                      }
                      disabled={!canManage}
                    />
                    <select
                      className={styles.smallInput}
                      value={drafts[budget.id]?.period || DEFAULT_PERIOD}
                      onChange={(event) =>
                        handleDraftChange(budget.id, "period", event.target.value)
                      }
                      disabled={!canManage}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <button
                      className={styles.smallButton}
                      type="button"
                      disabled={activeUpdateId === budget.id || !canManage}
                      onClick={() => handleUpdateBudget(budget.id)}
                    >
                      Save
                    </button>
                    <button
                      className={styles.smallDanger}
                      type="button"
                      disabled={activeUpdateId === budget.id || !canManage}
                      onClick={() => handleRemoveBudget(budget.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
