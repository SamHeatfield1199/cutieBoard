import { useRef, useEffect } from 'react';
import { LABELS, type Label } from '../../types/kanban';
import styles from './FilterBar.module.css';

// пропсы для компонента FilterBar
interface FilterBarProps {
  filterText:         string
  filterLabels:       Set<Label>
  onFilterTextChange: (v: string) => void
  onToggleLabel:      (l: Label) => void
  onClear:            () => void
};

export function FilterBar({
  filterText,
  filterLabels,
  onFilterTextChange,
  onToggleLabel,
  onClear,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isActive = filterText !== '' || filterLabels.size > 0;

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={inputRef}
          className={styles.searchInput}
          placeholder="Search cards…"
          value={filterText}
          onChange={e => onFilterTextChange(e.target.value)}
        />
        {filterText && (
          <button className={styles.clearInput} onClick={() => onFilterTextChange('')}>×</button>
        )}
      </div>

      <div className={styles.labels}>
        {LABELS.map(label => (
          <button
            key={label}
            className={`${styles.labelChip} ${filterLabels.has(label) ? styles.labelChipActive : ''}`}
            onClick={() => onToggleLabel(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {isActive && (
        <button className={styles.clearAll} onClick={onClear}>
          × Clear filter
        </button>
      )}
    </div>
  );
}
