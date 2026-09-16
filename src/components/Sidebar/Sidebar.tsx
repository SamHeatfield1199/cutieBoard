import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../../stores/BoardStore';
import { CreateBoardModal } from './CreateBoardModal';
import { AppView } from '../../types/kanban';
import styles from './Sidebar.module.css';

// элементы навигации в боковом меню
const NAV_ITEMS: { icon: string; label: string; view: AppView }[] = [
  { icon: '⊞', label: 'Boards', view: AppView.Board },
  { icon: '⊟', label: 'Templates', view: AppView.Templates },
  { icon: '⚙', label: 'Settings', view: AppView.Settings },
];

// боковое меню
export const Sidebar = observer(function Sidebar() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🩷</span>
        <span className={styles.logoText}>CutieBoard</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            className={`${styles.navItem} ${appStore.view === item.view ? styles.navItemActive : ''}`}
            onClick={() => appStore.setView(item.view)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>WORKSPACES</span>
        </div>

        <div className={styles.workspace}>
          <div className={styles.workspaceHeader}>
            <span className={styles.workspaceAvatar}>
              {appStore.settings.workspaceName.charAt(0).toUpperCase()}
            </span>
            <span className={styles.workspaceName}>{appStore.settings.workspaceName}</span>
          </div>

          <ul className={styles.boardList}>
            {appStore.boards.map(board => (
              <li key={board.id} className={styles.boardListItem}>
                <button
                  className={`${styles.boardItem} ${appStore.currentBoardId === board.id && appStore.view === AppView.Board ? styles.boardItemActive : ''}`}
                  onClick={() => appStore.selectBoard(board.id)}
                >
                  {board.title}
                </button>
                {appStore.boards.length > 1 && (
                  <button
                    className={styles.boardDelete}
                    title="Delete board"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete board "${board.title}"?`)) {
                        appStore.deleteBoard(board.id);
                      }
                    }}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.mascot}>
        <div className={styles.mascotBubble}>🩷</div>
        <div className={styles.mascotCat}>🐱</div>
      </div>

      <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
        <span>+</span> Create Board
      </button>

      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}
    </aside>
  );
});
