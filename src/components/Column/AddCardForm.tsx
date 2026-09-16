import { useState, useRef, useEffect } from 'react';
import styles from './AddCardForm.module.css';

// пропсы для компонента AddCardForm
interface AddCardFormProps {
  onSave: (title: string) => void
  onCancel: () => void
};

// компонент формы добавления карточки
export function AddCardForm({ onSave, onCancel }: AddCardFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const textareaRef       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // сохранить карточку
  function handleSave() {
    const trimmed = value.trim();

    if (!trimmed) {
      setError('Title cannot be empty');

      return;
    }

    onSave(trimmed);
  };

  // обработчик нажатия клавиши на форме
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }

    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={styles.form}>
      <textarea
        ref={textareaRef}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        placeholder="Enter card title…"
        value={value}
        onChange={e => { setValue(e.target.value); setError(''); }}
        onKeyDown={handleKeyDown}
        rows={3}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave}>
          Add card
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}>
          ✕
        </button>
      </div>
    </div>
  );
}
