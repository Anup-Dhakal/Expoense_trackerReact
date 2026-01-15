import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  removeMemberFromGroup,
  subscribeGroup,
  updateGroupName,
  updateMemberRole,
} from "../lib/groups.js";
import { removeGroupFromUser, subscribeUserProfiles } from "../lib/users.js";
import InviteMembers from "../components/InviteMembers.jsx";
import styles from "./GroupSettings.module.css";

const ROLE_OPTIONS = ["admin", "editor", "viewer"];

export default function GroupSettings({ user }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [name, setName] = useState("");
  const [memberProfiles, setMemberProfiles] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (!groupId) return;
    const unsub = subscribeGroup(groupId, (data) => {
      setGroup(data);
      setName(data?.name || "");
    });
    return () => unsub();
  }, [groupId]);

  const memberIds = useMemo(() => {
    if (!group?.members) return [];
    return Object.keys(group.members);
  }, [group]);

  useEffect(() => {
    if (!memberIds.length) {
      setMemberProfiles([]);
      return;
    }

    const unsub = subscribeUserProfiles(memberIds, setMemberProfiles);
    return () => unsub();
  }, [memberIds]);

  const currentRole = group?.members?.[user?.uid] || "viewer";
  const isAdmin = currentRole === "admin";

  const members = useMemo(() => {
    if (!group?.members) return [];
    const profileMap = new Map(
      memberProfiles.map((profile) => [profile.id, profile])
    );

    return Object.entries(group.members).map(([uid, role]) => {
      const profile = profileMap.get(uid);
      return {
        uid,
        role,
        email: profile?.email || "",
        displayName: profile?.displayName || "",
      };
    });
  }, [group, memberProfiles]);

  async function handleRename(event) {
    event.preventDefault();
    if (!groupId || !name.trim()) {
      setError("Enter a group name.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await updateGroupName(groupId, name.trim());
    } catch (err) {
      setError(err?.message || "Unable to update group name.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleChange(uid, role) {
    if (!groupId) return;
    setError("");
    setActionId(uid);

    try {
      await updateMemberRole(groupId, uid, role);
    } catch (err) {
      setError(err?.message || "Unable to update role.");
    } finally {
      setActionId(null);
    }
  }

  async function handleRemoveMember(uid) {
    if (!groupId) return;
    setError("");
    setActionId(uid);

    try {
      await removeMemberFromGroup(groupId, uid);
      await removeGroupFromUser(uid, groupId);
    } catch (err) {
      setError(err?.message || "Unable to remove member.");
    } finally {
      setActionId(null);
    }
  }

  async function handleLeaveGroup() {
    if (!groupId || !user?.uid) return;
    setError("");
    setActionId(user.uid);

    try {
      await removeMemberFromGroup(groupId, user.uid);
      await removeGroupFromUser(user.uid, groupId);
      navigate("/app");
    } catch (err) {
      setError(err?.message || "Unable to leave group.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Group settings</p>
          <h2 className={styles.title}>{group?.name || "Group"}</h2>
          <p className={styles.subtitle}>Manage members, roles, and invites.</p>
        </div>
        <button
          className={styles.backButton}
          type="button"
          onClick={() => navigate("/app")}
        >
          Back to dashboard
        </button>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Group name</h3>
          <p className={styles.cardNote}>Rename this group to keep it clear.</p>
        </div>
        <form className={styles.inlineForm} onSubmit={handleRename}>
          <input
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button className={styles.button} type="submit" disabled={!isAdmin || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </form>
        {!isAdmin ? (
          <p className={styles.helper}>Only admins can rename the group.</p>
        ) : null}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Members</h3>
            <p className={styles.cardNote}>{members.length} active members</p>
          </div>
          {!isAdmin ? (
            <button
              className={styles.dangerButton}
              type="button"
              onClick={handleLeaveGroup}
              disabled={actionId === user?.uid}
            >
              Leave group
            </button>
          ) : null}
        </div>
        <div className={styles.memberList}>
          {members.map((member) => (
            <div key={member.uid} className={styles.memberRow}>
              <div>
                <p className={styles.memberName}>
                  {member.displayName || member.email || member.uid}
                </p>
                <p className={styles.memberMeta}>{member.email}</p>
              </div>
              <div className={styles.memberActions}>
                <select
                  className={styles.select}
                  value={member.role}
                  disabled={!isAdmin || member.uid === group?.owner}
                  onChange={(event) =>
                    handleRoleChange(member.uid, event.target.value)
                  }
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {isAdmin && member.uid !== group?.owner ? (
                  <button
                    className={styles.ghostButton}
                    type="button"
                    disabled={actionId === member.uid}
                    onClick={() => handleRemoveMember(member.uid)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <InviteMembers
          groupId={groupId}
          groupName={group?.name || ""}
          userId={user?.uid}
        />
      ) : null}
    </div>
  );
}
