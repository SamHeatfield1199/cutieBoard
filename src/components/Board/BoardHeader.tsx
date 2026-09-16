import styles from './BoardHeader.module.css';

// пропсы для компонента BoardHeader
interface BoardHeaderProps {
  title:          string
  description?:   string
  onAddList:      () => void
  onToggleFilter: () => void
  isFilterActive: boolean
};

// компонент заголовка доски
export function BoardHeader({ title, description, onAddList, onToggleFilter, isFilterActive }: BoardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          <button className={styles.starBtn} aria-label="Favourite">☆</button>
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.filterBtn} ${isFilterActive ? styles.filterBtnActive : ''}`}
          onClick={onToggleFilter}
        >
          <span>⊟</span> Filter{isFilterActive && ' •'}
        </button>
        <button className={styles.addListBtn} onClick={onAddList}>
          + Add List
        </button>
      </div>
    </div>
  );
}
