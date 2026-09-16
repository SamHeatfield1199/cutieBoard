import { useState, useRef, useEffect } from 'react';
import { LABELS, type Card, type Label } from '../../types/kanban';
import styles from './EditCardForm.module.css';

const LABEL_COLORS: Record<Label, string> = {
  'UI/UX':    '#cc4444',
  'Dev':      '#6666cc',
  'Research': '#996600',
  'Design':   '#2d8c4e',
  'QA':       '#7a44cc',
};

// пропсы для компонента EditCardForm
interface EditCardFormProps {
  card:     Card
  onSave:   (updates: Partial<Omit<Card, 'id'>>) => void
  onCancel: () => void
};

// компонент формы редактирования карточки
export function EditCardForm({ card, onSave, onCancel }: EditCardFormProps) {
  const [title, setTitle] = useState(card.title);
  const [label, setLabel] = useState<Label | undefined>(card.label);
  const [error, setError] = useState('');
  const textareaRef       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  // сохранить карточку
  function handleSave() {
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Title cannot be empty');

      return;
    }

    onSave({ title: trimmed, label });
  };

  // обработчик нажатия клавиши
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      handleSave();
    }

    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className={styles.form}>
      <textarea
        ref={textareaRef}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        value={title}
        onChange={(e) => { setTitle(e.target.value); setError(''); }}
        onKeyDown={handleKeyDown}
        rows={3}
      />
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.labelPicker}>
        {LABELS.map(l => (
          <button
            key={l}
            className={`${styles.labelChip} ${label === l ? styles.labelChipActive : ''}`}
            style={{ '--chip-color': LABEL_COLORS[l] } as React.CSSProperties}
            onClick={() => setLabel(label === l ? undefined : l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave}>Save</button>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
