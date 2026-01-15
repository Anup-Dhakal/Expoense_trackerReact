import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { acceptInvite, declineInvite, getInvite } from "../lib/invites.js";
import styles from "./AcceptInvite.module.css";

export default function AcceptInvite({ user }) {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!inviteId) return;
    let isMounted = true;

    async function loadInvite() {
      try {
        const data = await getInvite(inviteId);
        if (isMounted) setInvite(data);
      } catch (err) {
        if (isMounted) setError(err?.message || "Unable to load invite.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInvite();
    return () => {
      isMounted = false;
    };
  }, [inviteId]);

  async function handleAccept() {
    if (!user?.uid || !inviteId) return;
    setError("");
    setIsWorking(true);

    try {
      await acceptInvite(inviteId, user.uid);
      navigate("/app");
    } catch (err) {
      setError(err?.message || "Unable to accept invite.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDecline() {
    if (!user?.uid || !inviteId) return;
    setError("");
    setIsWorking(true);

    try {
      await declineInvite(inviteId, user.uid);
      navigate("/app");
    } catch (err) {
      setError(err?.message || "Unable to decline invite.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div>
          <p className={styles.kicker}>Invitation</p>
          <h2 className={styles.title}>Join group</h2>
          <p className={styles.subtitle}>
            Review the invite details before you respond.
          </p>
        </div>

        {isLoading ? (
          <p className={styles.helper}>Loading invite...</p>
        ) : invite ? (
          <div className={styles.inviteDetails}>
            <div>
              <p className={styles.inviteLabel}>Group</p>
              <p className={styles.inviteValue}>{invite.groupName}</p>
            </div>
            <div>
              <p className={styles.inviteLabel}>Role</p>
              <p className={styles.inviteValue}>{invite.role}</p>
            </div>
          </div>
        ) : (
          <p className={styles.helper}>Invite not found.</p>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button
            className={styles.primary}
            type="button"
            disabled={!invite || isWorking}
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className={styles.ghost}
            type="button"
            disabled={!invite || isWorking}
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </section>
    </div>
  );
}
