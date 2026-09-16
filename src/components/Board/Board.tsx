import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { appStore } from '../../stores/BoardStore';
import { type Label } from '../../types/kanban';
import { BoardHeader } from './BoardHeader';
import { FilterBar } from './FilterBar';
import { Column } from '../Column/Column';
import { AddColumnForm } from './AddColumnForm';
import styles from './Board.module.css';

// компонент доски
export const Board = observer(function Board() {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [showFilter, setShowFilter]         = useState(false);
  const [filterText, setFilterText]         = useState('');
  const [filterLabels, setFilterLabels]     = useState<Set<Label>>(new Set());

  const board = appStore.currentBoard;
  const isFilterActive = filterText !== '' || filterLabels.size > 0;

  // добавить столбец
  function handleAddColumn(title: string) {
    appStore.addColumn(title);
    setIsAddingColumn(false);
  };

  // переключить лейбл
  function handleToggleLabel(label: Label) {
    setFilterLabels(prev => {
      const next = new Set(prev);

      if (next.has(label)) next.delete(label);

      else next.add(label);

      return next;
    });
  };

  // очистить фильтр
  function handleClearFilter() {
    setFilterText('');
    setFilterLabels(new Set());
  };

  // переключить фильтр
  function handleToggleFilter() {
    setShowFilter(v => {
      if (v) handleClearFilter();
      
      return !v;
    });
  };

  if (!board) return null;

  return (
    <div className={`${styles.boardWrapper} ${appStore.settings.compactMode ? styles.compact : ''}`}>
      <BoardHeader
        title={board.title}
        description={board.description}
        onAddList={() => setIsAddingColumn(true)}
        onToggleFilter={handleToggleFilter}
        isFilterActive={isFilterActive}
      />

      {showFilter && (
        <FilterBar
          filterText={filterText}
          filterLabels={filterLabels}
          onFilterTextChange={setFilterText}
          onToggleLabel={handleToggleLabel}
          onClear={handleClearFilter}
        />
      )}

      <div className={styles.columns}>
        {appStore.columns.map(column => (
          <Column
            key={column.id}
            column={column}
            filterText={filterText}
            filterLabels={filterLabels}
            isDndDisabled={isFilterActive}
          />
        ))}

        {isAddingColumn ? (
          <AddColumnForm
            onSave={handleAddColumn}
            onCancel={() => setIsAddingColumn(false)}
          />
        ) : (
          <button
            className={styles.addListBtn}
            onClick={() => setIsAddingColumn(true)}
          >
            + Add List
          </button>
        )}
      </div>
    </div>
  );
});
