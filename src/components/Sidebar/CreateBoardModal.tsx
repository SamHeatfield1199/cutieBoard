import { useState, useRef, useEffect, type MouseEvent, type KeyboardEvent } from 'react';
import { appStore } from '../../stores/BoardStore';
import { TEMPLATES, EMPTY_TEMPLATE } from '../../templates/templates';
import { type TemplateId } from '../../types/kanban';
import styles from './CreateBoardModal.module.css';

interface CreateBoardModalProps {
  onClose: () => void
};

const TEMPLATE_OPTIONS = [EMPTY_TEMPLATE, TEMPLATES.sprint, TEMPLATES.personal];

// модальное окно для создания новой доски
export function CreateBoardModal({ onClose }: CreateBoardModalProps) {
  const [name, setName]                         = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('empty');
  const [error, setError]                       = useState('');
  const inputRef                                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // создать новую доску
  function handleCreate() {
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Board name is required');

      return;
    }

    appStore.createBoard(trimmed, selectedTemplate);
    onClose();
  };

  // обработчик клика по фону модального окна
  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  };

  // обработчик нажатия клавиши
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} onKeyDown={handleKeyDown}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Board</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Board Name</label>
          <input
            ref={inputRef}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="e.g. Q3 Planning"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Choose a template</label>
          <div className={styles.templateGrid}>
            {TEMPLATE_OPTIONS.map(t => (
              <button
                key={t.id}
                className={`${styles.templateCard} ${selectedTemplate === t.id ? styles.templateCardActive : ''}`}
                onClick={() => setSelectedTemplate(t.id as TemplateId)}
              >
                <span className={styles.templateIcon}>{t.icon}</span>
                <span className={styles.templateTitle}>{t.title}</span>
                <span className={styles.templateDesc}>{t.description}</span>
                {t.columnNames.length > 0 && (
                  <div className={styles.templateCols}>
                    {t.columnNames.map(col => (
                      <span key={col} className={styles.templateColChip}>{col}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.createBtn} onClick={handleCreate}>Create Board</button>
        </div>
      </div>
    </div>
  );
}
