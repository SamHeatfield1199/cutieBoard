import { useState, type KeyboardEvent } from 'react';
import { appStore } from '../../stores/BoardStore';
import { TEMPLATES } from '../../templates/templates';
import { type TemplateId } from '../../types/kanban';
import styles from './TemplatesPage.module.css';

interface UseTemplateFormProps {
  templateId: Exclude<TemplateId, 'empty'>
  onClose: () => void
}

// форма для использования шаблона
function UseTemplateForm({ templateId, onClose }: UseTemplateFormProps) {
  const template = TEMPLATES[templateId];
  const [name, setName] = useState(template.title);

  // создать новую доску на основе шаблона
  function handleCreate() {
    const trimmed = name.trim() || template.title;
    appStore.createBoard(trimmed, templateId);
    onClose();
  };

  // обработчик нажатия клавиши
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className={styles.useFormBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.useForm}>
        <h3 className={styles.useFormTitle}>Use "{template.title}"</h3>
        <input
          className={styles.useFormInput}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className={styles.useFormActions}>
          <button className={styles.useFormCancel} onClick={onClose}>Cancel</button>
          <button className={styles.useFormCreate} onClick={handleCreate}>Create Board</button>
        </div>
      </div>
    </div>
  );
}

// страница шаблонов
export function TemplatesPage() {
  const [pendingTemplate, setPendingTemplate] = useState<Exclude<TemplateId, 'empty'> | null>(null);

  const templateList = Object.values(TEMPLATES);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Templates</h1>
        <p className={styles.subtitle}>Pick a template to get started quickly - or create an empty board from the sidebar.</p>
      </div>

      <div className={styles.grid}>
        {templateList.map(template => (
          <div key={template.id} className={styles.card}>
            <div className={styles.cardPreview}>
              <span className={styles.cardIcon}>{template.icon}</span>
              <div className={styles.columnPreviews}>
                {template.columnNames.map(col => (
                  <div key={col} className={styles.colPreview}>
                    <div className={styles.colPreviewHeader}>{col}</div>
                    <div className={styles.colPreviewLine} />
                    <div className={styles.colPreviewLine} style={{ width: '70%' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>{template.title}</h2>
              <p className={styles.cardDesc}>{template.description}</p>

              <div className={styles.cardCols}>
                {template.columnNames.map(col => (
                  <span key={col} className={styles.colChip}>{col}</span>
                ))}
              </div>

              <button
                className={styles.useBtn}
                onClick={() => setPendingTemplate(template.id as Exclude<TemplateId, 'empty'>)}
              >
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingTemplate && (
        <UseTemplateForm
          templateId={pendingTemplate}
          onClose={() => setPendingTemplate(null)}
        />
      )}
    </div>
  );
}
