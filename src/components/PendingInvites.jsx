import { useEffect, useState } from "react";
import {
  acceptInvite,
  declineInvite,
  subscribePendingInvites,
} from "../lib/invites.js";
import styles from "./PendingInvites.module.css";

export default function PendingInvites({ user, onAccepted }) {
  const [invites, setInvites] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.email) return () => {};
    const unsub = subscribePendingInvites(user.email, setInvites);
    return () => unsub();
  }, [user?.email]);

  async function handleAccept(inviteId) {
    if (!user?.uid) return;
    setError("");
    setActionId(inviteId);

    try {
      await acceptInvite(inviteId, user.uid);
      if (onAccepted) {
        const accepted = invites.find((invite) => invite.id === inviteId);
        if (accepted) onAccepted(accepted.groupId);
      }
    } catch (err) {
      setError(err?.message || "Unable to accept invite.");
    } finally {
      setActionId(null);
    }
  }

  async function handleDecline(inviteId) {
    if (!user?.uid) return;
    setError("");
    setActionId(inviteId);

    try {
      await declineInvite(inviteId, user.uid);
    } catch (err) {
      setError(err?.message || "Unable to decline invite.");
    } finally {
      setActionId(null);
    }
  }

  if (!invites.length) return null;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Invitations</p>
          <h3 className={styles.title}>Pending group invites</h3>
        </div>
        <span className={styles.badge}>{invites.length}</span>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.list}>
        {invites.map((invite) => (
          <div key={invite.id} className={styles.row}>
            <div>
              <p className={styles.groupName}>{invite.groupName}</p>
              <p className={styles.meta}>Role: {invite.role}</p>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="button"
                disabled={actionId === invite.id}
                onClick={() => handleAccept(invite.id)}
              >
                Accept
              </button>
              <button
                className={styles.ghost}
                type="button"
                disabled={actionId === invite.id}
                onClick={() => handleDecline(invite.id)}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
