import { useState } from "react";
import { createInvite } from "../lib/invites.js";
import styles from "./InviteMembers.module.css";

const ROLES = ["editor", "viewer"];

export default function InviteMembers({ groupId, groupName, userId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!groupId) {
      setError("Select a group to send invites.");
      return;
    }

    if (!email.trim()) {
      setError("Enter an email to invite.");
      return;
    }

    setError("");
    setIsSending(true);

    try {
      await createInvite({
        groupId,
        groupName,
        email,
        role,
        invitedBy: userId,
      });
      setEmail("");
    } catch (err) {
      setError(err?.message || "Unable to send invite.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className={styles.card}>
      <div>
        <p className={styles.kicker}>Invitations</p>
        <h3 className={styles.title}>Invite members</h3>
        <p className={styles.helper}>Send a group invite via email.</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            placeholder="name@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={styles.label}>
          Role
          <select
            className={styles.input}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.button} type="submit" disabled={isSending}>
          {isSending ? "Sending..." : "Send invite"}
        </button>
      </form>
    </section>
  );
}
