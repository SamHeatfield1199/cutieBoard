import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../../stores/BoardStore';
import styles from './SettingsPanel.module.css';

const ACCENT_COLORS = [
  { value: '#ff6b9d', label: 'Rose' },
  { value: '#f97316', label: 'Orange' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#10b981', label: 'Emerald' },
];

// панель настроек
export const SettingsPanel = observer(function SettingsPanel() {
  const [workspaceName, setWorkspaceName] = useState(appStore.settings.workspaceName);
  const [saved, setSaved]                 = useState(false);

  // сохранить имя рабочего пространства
  function handleSaveWorkspace() {
    const trimmed = workspaceName.trim();

    if (!trimmed) return;
    
    appStore.updateSettings({ workspaceName: trimmed });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // сбросить все данные
  function handleReset() {
    if (window.confirm('This will delete all your boards and settings. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage your workspace preferences</p>
      </div>

      <div className={styles.content}>

        {/* Workspace */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Workspace</h2>
          <div className={styles.field}>
            <label className={styles.label}>Workspace Name</label>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveWorkspace()}
                placeholder="My Workspace"
              />
              <button className={styles.saveBtn} onClick={handleSaveWorkspace}>
                {saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>
        </section>

        {/* Внешний вид */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>

          <div className={styles.field}>
            <label className={styles.label}>Accent Color</label>
            <div className={styles.colorRow}>
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`${styles.colorSwatch} ${appStore.settings.accentColor === c.value ? styles.colorSwatchActive : ''}`}
                  style={{ background: c.value }}
                  title={c.label}
                  onClick={() => appStore.updateSettings({ accentColor: c.value })}
                  aria-label={c.label}
                />
              ))}
            </div>
            <p className={styles.hint}>Changes apply instantly across the whole app.</p>
          </div>

          <div className={styles.field}>
            <div className={styles.toggleRow}>
              <div>
                <label className={styles.label}>Compact Mode</label>
                <p className={styles.hint}>Reduces card padding for more cards on screen.</p>
              </div>
              <button
                className={`${styles.toggle} ${appStore.settings.compactMode ? styles.toggleOn : ''}`}
                onClick={() => appStore.updateSettings({ compactMode: !appStore.settings.compactMode })}
                aria-pressed={appStore.settings.compactMode}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>
        </section>

        {/* Доски */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Boards</h2>
          <div className={styles.boardsList}>
            {appStore.boards.map(board => (
              <div key={board.id} className={styles.boardRow}>
                <span className={styles.boardName}>{board.title}</span>
                <span className={styles.boardMeta}>{board.columns.length} lists · {board.columns.reduce((s, c) => s + c.cards.length, 0)} cards</span>
                {appStore.boards.length > 1 && (
                  <button
                    className={styles.deleteBoardBtn}
                    onClick={() => {
                      if (window.confirm(`Delete board "${board.title}"?`)) {
                        appStore.deleteBoard(board.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section className={`${styles.section} ${styles.dangerSection}`}>
          <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
          <div className={styles.dangerRow}>
            <div>
              <p className={styles.dangerLabel}>Reset all data</p>
              <p className={styles.hint}>Permanently deletes all boards, cards, and settings.</p>
            </div>
            <button className={styles.dangerBtn} onClick={handleReset}>
              Reset
            </button>
          </div>
        </section>

      </div>
    </div>
  );
});
