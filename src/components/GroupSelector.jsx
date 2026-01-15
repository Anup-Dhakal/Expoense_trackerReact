import styles from "./GroupSelector.module.css";

export default function GroupSelector({
  groups,
  value,
  onChange,
  onCreate,
}) {
  const selected = value || "personal";

  function handleChange(event) {
    const nextValue = event.target.value;
    if (onChange) {
      onChange(nextValue === "personal" ? null : nextValue);
    }
  }

  return (
    <div className={styles.container}>
      <div>
        <p className={styles.label}>Workspace</p>
        <select
          className={styles.select}
          value={selected}
          onChange={handleChange}
        >
          <option value="personal">Personal expenses</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      {onCreate ? (
        <button className={styles.button} type="button" onClick={onCreate}>
          New group
        </button>
      ) : null}
    </div>
  );
}
