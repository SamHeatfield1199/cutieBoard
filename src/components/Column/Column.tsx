import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { type Column as ColumnType, type Label } from '../../types/kanban';
import { appStore } from '../../stores/BoardStore';
import { Card } from '../Card/Card';
import { AddCardForm } from './AddCardForm';
import styles from './Column.module.css';

// пропсы для компонента Column
interface ColumnProps {
  column:        ColumnType
  filterText:    string
  filterLabels:  Set<Label>
  isDndDisabled: boolean
};

// данные для перетаскивания карточки
interface DragData {
  cardId:       string
  fromColumnId: string
};

// компонент столбца
export const Column = observer(function Column({ column, filterText, filterLabels, isDndDisabled }: ColumnProps) {
  const [isAdding, setIsAdding]   = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const visibleCards = column.cards.filter(card => {
    const matchText  = !filterText || card.title.toLowerCase().includes(filterText.toLowerCase());
    const matchLabel = filterLabels.size === 0 || (!!card.label && filterLabels.has(card.label));

    return matchText && matchLabel;
  });

  const isFiltered = visibleCards.length !== column.cards.length;

  // добавить карточку в столбец
  function handleSave(title: string) {
    appStore.addCard(column.id, title);
    setIsAdding(false);
  };

  // парсинг данных для перетаскивания карточки
  function parseDragData(e: React.DragEvent): DragData | null {
    try {
      return JSON.parse(e.dataTransfer.getData('application/cute-kanban')) as DragData;
    } catch {
      return null;
    }
  };

  // обработчик перетаскивания карточки
  function handleContainerDragOver(e: React.DragEvent) {
    if (isDndDisabled) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    setDropIndex(column.cards.length);
  };

  // обработчик перетаскивания карточки
  function handleCardDragOver(e: React.DragEvent, index: number) {
    if (isDndDisabled) return;

    e.preventDefault();
    e.stopPropagation();

    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();

    setDropIndex(e.clientY < rect.top + rect.height / 2 ? index : index + 1);
  };

  // обработчик перетаскивания карточки
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndex(null);
    }
  };

  // обработчик перетаскивания карточки
  function handleDrop(e: React.DragEvent) {
    if (isDndDisabled) return;

    e.preventDefault();
    const data = parseDragData(e);

    if (!data) return;

    appStore.moveCard(data.cardId, data.fromColumnId, column.id, dropIndex ?? column.cards.length);
    setDropIndex(null);
  };

  // класс для цвета заголовка столбца
  const headerColorClass = column.id === 'col-1'? styles.headerTodo : column.id === 'col-2'
        ? styles.headerInProgress : column.id === 'col-3'
        ? styles.headerDone : ''
  ;

  return (
    <div className={styles.column}>
      <div className={`${styles.header} ${headerColorClass}`}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>{column.title}</span>
          <span className={styles.count}>
            {isFiltered ? `${visibleCards.length}/${column.cards.length}` : column.cards.length}
          </span>
        </div>
        <button
          className={styles.moreBtn}
          aria-label="Delete column"
          title="Delete column"
          onClick={() => {
            if (window.confirm(`Delete column "${column.title}"?`)) {
              appStore.deleteColumn(column.id);
            }
          }}
        >
          ···
        </button>
      </div>

      <div
        className={`${styles.cards} ${dropIndex !== null ? styles.cardsDragOver : ''}`}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {visibleCards.map((card) => {
          const originalIndex = column.cards.findIndex(c => c.id === card.id);
          return (
            <div
              key={card.id}
              onDragOver={(e) => handleCardDragOver(e, originalIndex)}
            >
              {!isDndDisabled && dropIndex === originalIndex && (
                <div className={styles.dropIndicator} />
              )}
              <Card card={card} columnId={column.id} isDndDisabled={isDndDisabled} />
            </div>
          );
        })}
        {!isDndDisabled && dropIndex === column.cards.length && (
          <div className={styles.dropIndicator} />
        )}
        {isFiltered && visibleCards.length === 0 && (
          <p className={styles.emptyFilter}>No cards match the filter</p>
        )}
      </div>

      <div className={styles.footer}>
        {isAdding ? (
          <AddCardForm
            onSave={handleSave}
            onCancel={() => setIsAdding(false)}
          />
        ) : (
          <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
            + Add Card
          </button>
        )}
      </div>
    </div>
  );
});
