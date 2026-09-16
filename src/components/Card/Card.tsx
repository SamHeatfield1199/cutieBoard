import { useState } from 'react';
import { type Card as CardType } from '../../types/kanban';
import { boardStore } from '../../stores/BoardStore';
import { EditCardForm } from './EditCardForm';
import styles from './Card.module.css';

interface CardProps {
  card:           CardType
  columnId:       string
  isDndDisabled?: boolean
};

const LABEL_STYLES: Record<string, string> = {
  'UI/UX':    styles.labelUiux,
  'Dev':      styles.labelDev,
  'Research': styles.labelResearch,
  'Design':   styles.labelDesign,
  'QA':       styles.labelQa,
};

// компонент карточки
export function Card({ card, columnId, isDndDisabled }: CardProps) {
  const [isEditing, setIsEditing]   = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (isEditing) {
    return (
      <EditCardForm
        card={card}
        onSave={(updates) => {
          boardStore.updateCard(columnId, card.id, updates);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''} ${isDndDisabled ? styles.cardNoDrag : ''}`}
      draggable={!isDndDisabled}
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
          'application/cute-kanban',
          JSON.stringify({ cardId: card.id, fromColumnId: columnId })
        );
      }}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className={styles.cardTop}>
        <p className={styles.title}>{card.title}</p>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            title="Edit"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsEditing(true)}
          >
            ✏️
          </button>
          <button
            className={styles.actionBtn}
            title="Delete"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => boardStore.deleteCard(columnId, card.id)}
          >
            🗑️
          </button>
        </div>
      </div>

      {card.label && (
        <span className={`${styles.label} ${LABEL_STYLES[card.label] ?? ''}`}>
          {card.label}
        </span>
      )}

      <div className={styles.footer}>
        {card.dueDate && (
          <span className={styles.date}>
            <span className={styles.dateIcon}>📅</span>
            {card.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
