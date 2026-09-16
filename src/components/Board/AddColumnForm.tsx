import { useState, useRef, useEffect } from 'react';
import styles from './AddColumnForm.module.css';

// пропсы для компонента AddColumnForm
interface AddColumnFormProps {
  onSave:   (title: string) => void
  onCancel: () => void
};

// компонент формы добавления столбца
export function AddColumnForm({ onSave, onCancel }: AddColumnFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef          = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // сохранить столбец
  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('List name cannot be empty');

      return;
    };

    onSave(trimmed);
  };

  // обработчик нажатия клавиши
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();

    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className={styles.form}>
      <input
        ref={inputRef}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        placeholder="List name…"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(''); }}
        onKeyDown={handleKeyDown}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave}>Add list</button>
        <button className={styles.cancelBtn} onClick={onCancel}>✕</button>
      </div>
    </div>
  );
}
