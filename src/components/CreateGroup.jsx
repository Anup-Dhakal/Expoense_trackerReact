import { useState } from "react";
import { createGroup } from "../lib/groups.js";
import { addGroupToUser } from "../lib/users.js";
import styles from "./CreateGroup.module.css";

export default function CreateGroup({ userId, onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!userId) {
      setError("You must be signed in to create a group.");
      return;
    }

    if (!trimmedName) {
      setError("Enter a group name to continue.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const groupId = await createGroup({
        name: trimmedName,
        ownerId: userId,
      });
      await addGroupToUser(userId, groupId);
      setName("");
      if (onCreated) onCreated(groupId);
    } catch (err) {
      setError(err?.message || "Unable to create group.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className={styles.card}>
      <div>
        <p className={styles.kicker}>Shared budgets</p>
        <h3 className={styles.title}>Create a group</h3>
        <p className={styles.helper}>
          Invite others to collaborate on shared expenses.
        </p>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Group name
          <input
            className={styles.input}
            placeholder="e.g. Roommates"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create group"}
          </button>
          {onCancel ? (
            <button
              className={styles.ghost}
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
