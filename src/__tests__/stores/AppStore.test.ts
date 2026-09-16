import { configure } from 'mobx';
import { AppStore } from '../../stores/BoardStore';
import { AppView } from '../../types/kanban';

// allow state mutations outside actions for easier testing
configure({ enforceActions: 'never' });

// clear localStorage before each test so it doesn't affect other tests
function makeStore(): AppStore {
  localStorage.clear();
  return new AppStore();
}

// helpers

function firstColumnId(store: AppStore): string {
  return store.columns[0].id;
}

function firstCardId(store: AppStore, colId: string): string {
  const col = store.columns.find(c => c.id === colId)!;
  return col.cards[0].id;
}

// board management

describe('createBoard', () => {
  it('adds a new board to the list', () => {
    const store = makeStore();
    const before = store.boards.length;
    store.createBoard('Q3 Planning', 'empty');
    expect(store.boards).toHaveLength(before + 1);
  });

  it('trims the board title', () => {
    const store = makeStore();
    store.createBoard('  Sprint  ', 'empty');
    const newest = store.boards[store.boards.length - 1];
    expect(newest.title).toBe('Sprint');
  });

  it('falls back to "New Board" for blank title', () => {
    const store = makeStore();
    store.createBoard('   ', 'empty');
    const newest = store.boards[store.boards.length - 1];
    expect(newest.title).toBe('New Board');
  });

  it('selects the newly created board', () => {
    const store = makeStore();
    store.createBoard('New', 'empty');
    const newest = store.boards[store.boards.length - 1];
    expect(store.currentBoardId).toBe(newest.id);
  });

  it('switches the view to "board"', () => {
    const store = makeStore();
    store.setView(AppView.Settings);
    store.createBoard('New', 'empty');
    expect(store.view).toBe(AppView.Board);
  });

  it('creates an empty board with no columns when template is "empty"', () => {
    const store = makeStore();
    store.createBoard('Empty', 'empty');
    expect(store.columns).toHaveLength(0);
  });

  it('creates columns when using the sprint template', () => {
    const store = makeStore();
    store.createBoard('Sprint', 'sprint');
    expect(store.columns).toHaveLength(5);
  });

  it('creates columns when using the personal template', () => {
    const store = makeStore();
    store.createBoard('Personal', 'personal');
    expect(store.columns).toHaveLength(4);
  });
});

describe('selectBoard', () => {
  it('changes the current board', () => {
    const store = makeStore();
    store.createBoard('Board 2', 'empty');
    const firstId = store.boards[0].id;
    store.selectBoard(firstId);
    expect(store.currentBoardId).toBe(firstId);
  });

  it('switches view to "board"', () => {
    const store = makeStore();
    store.createBoard('B2', 'empty');
    store.setView(AppView.Settings);
    store.selectBoard(store.boards[0].id);
    expect(store.view).toBe(AppView.Board);
  });

  it('ignores unknown board ids', () => {
    const store = makeStore();
    const originalId = store.currentBoardId;
    store.selectBoard('non-existent-id');
    expect(store.currentBoardId).toBe(originalId);
  });
});

describe('deleteBoard', () => {
  it('removes the board from the list', () => {
    const store = makeStore();
    store.createBoard('Extra', 'empty');
    const extraId = store.boards[store.boards.length - 1].id;
    store.deleteBoard(extraId);
    expect(store.boards.find(b => b.id === extraId)).toBeUndefined();
  });

  it('does not delete the last remaining board', () => {
    const store = makeStore();
    expect(store.boards).toHaveLength(1);
    store.deleteBoard(store.boards[0].id);
    expect(store.boards).toHaveLength(1);
  });

  it('switches to the first board when the current board is deleted', () => {
    const store = makeStore();
    store.createBoard('B2', 'empty');
    // Select B2 then delete it
    const b2Id = store.boards[store.boards.length - 1].id;
    store.selectBoard(b2Id);
    store.deleteBoard(b2Id);
    expect(store.currentBoardId).toBe(store.boards[0].id);
  });

  it('keeps the current board unchanged when a different board is deleted', () => {
    const store = makeStore();
    const originalId = store.currentBoardId;
    store.createBoard('Extra', 'empty');
    const extraId = store.boards[store.boards.length - 1].id;
    store.deleteBoard(extraId);
    expect(store.currentBoardId).toBe(originalId);
  });
});

describe('updateBoardMeta', () => {
  it('updates the board title', () => {
    const store = makeStore();
    const id = store.currentBoardId;
    store.updateBoardMeta(id, { title: 'Renamed' });
    expect(store.currentBoard?.title).toBe('Renamed');
  });

  it('updates the board description', () => {
    const store = makeStore();
    const id = store.currentBoardId;
    store.updateBoardMeta(id, { description: 'New desc' });
    expect(store.currentBoard?.description).toBe('New desc');
  });

  it('ignores unknown board id', () => {
    const store = makeStore();
    expect(() => store.updateBoardMeta('nope', { title: 'x' })).not.toThrow();
  });
});

// view routing

describe('setView', () => {
  it('changes view to templates', () => {
    const store = makeStore();
    store.setView(AppView.Templates);
    expect(store.view).toBe(AppView.Templates);
  });

  it('changes view to settings', () => {
    const store = makeStore();
    store.setView(AppView.Settings);
    expect(store.view).toBe(AppView.Settings);
  });

  it('changes view back to board', () => {
    const store = makeStore();
    store.setView(AppView.Templates);
    store.setView(AppView.Board);
    expect(store.view).toBe(AppView.Board);
  });
});

// settings

describe('updateSettings', () => {
  it('updates the workspace name', () => {
    const store = makeStore();
    store.updateSettings({ workspaceName: 'Team Alpha' });
    expect(store.settings.workspaceName).toBe('Team Alpha');
  });

  it('updates compactMode', () => {
    const store = makeStore();
    store.updateSettings({ compactMode: true });
    expect(store.settings.compactMode).toBe(true);
  });

  it('updates accentColor', () => {
    const store = makeStore();
    store.updateSettings({ accentColor: '#8b5cf6' });
    expect(store.settings.accentColor).toBe('#8b5cf6');
  });
});

// column actions

describe('addColumn', () => {
  it('adds a column to the current board', () => {
    const store = makeStore();
    const before = store.columns.length;
    store.addColumn('New Column');
    expect(store.columns).toHaveLength(before + 1);
    expect(store.columns[store.columns.length - 1].title).toBe('New Column');
  });

  it('trims whitespace from the title', () => {
    const store = makeStore();
    store.addColumn('  Trimmed  ');
    const last = store.columns[store.columns.length - 1];
    expect(last.title).toBe('Trimmed');
  });

  it('ignores an empty title', () => {
    const store = makeStore();
    const before = store.columns.length;
    store.addColumn('   ');
    expect(store.columns).toHaveLength(before);
  });

  it('new column starts with an empty cards array', () => {
    const store = makeStore();
    store.addColumn('Empty Col');
    const last = store.columns[store.columns.length - 1];
    expect(last.cards).toHaveLength(0);
  });
});

describe('deleteColumn', () => {
  it('removes the column from the current board', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const before = store.columns.length;
    store.deleteColumn(colId);
    expect(store.columns).toHaveLength(before - 1);
    expect(store.columns.find(c => c.id === colId)).toBeUndefined();
  });

  it('ignores unknown column id', () => {
    const store = makeStore();
    const before = store.columns.length;
    store.deleteColumn('does-not-exist');
    expect(store.columns).toHaveLength(before);
  });
});

// card actions

describe('addCard', () => {
  it('adds a card to the specified column', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const col = store.columns.find(c => c.id === colId)!;
    const before = col.cards.length;
    store.addCard(colId, 'New Task');
    expect(col.cards).toHaveLength(before + 1);
    expect(col.cards[col.cards.length - 1].title).toBe('New Task');
  });

  it('trims the card title', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    store.addCard(colId, '  Trimmed Task  ');
    const col = store.columns.find(c => c.id === colId)!;
    expect(col.cards[col.cards.length - 1].title).toBe('Trimmed Task');
  });

  it('ignores an empty title', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const col = store.columns.find(c => c.id === colId)!;
    const before = col.cards.length;
    store.addCard(colId, '   ');
    expect(col.cards).toHaveLength(before);
  });

  it('ignores an unknown column id', () => {
    const store = makeStore();
    expect(() => store.addCard('nope', 'Task')).not.toThrow();
  });

  it('assigns a label when provided', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    store.addCard(colId, 'Labelled', 'Dev');
    const col = store.columns.find(c => c.id === colId)!;
    expect(col.cards[col.cards.length - 1].label).toBe('Dev');
  });

  it('assigns a dueDate automatically', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    store.addCard(colId, 'Dated Task');
    const col = store.columns.find(c => c.id === colId)!;
    expect(col.cards[col.cards.length - 1].dueDate).toBeTruthy();
  });
});

describe('deleteCard', () => {
  it('removes a card from the column', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const col = store.columns.find(c => c.id === colId)!;
    const cardId = firstCardId(store, colId);
    const before = col.cards.length;
    store.deleteCard(colId, cardId);
    expect(col.cards).toHaveLength(before - 1);
    expect(col.cards.find(c => c.id === cardId)).toBeUndefined();
  });

  it('ignores unknown card id', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const col = store.columns.find(c => c.id === colId)!;
    const before = col.cards.length;
    store.deleteCard(colId, 'nope');
    expect(col.cards).toHaveLength(before);
  });
});

describe('updateCard', () => {
  it('updates the card title', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const cardId = firstCardId(store, colId);
    store.updateCard(colId, cardId, { title: 'Updated Title' });
    const col = store.columns.find(c => c.id === colId)!;
    const card = col.cards.find(c => c.id === cardId)!;
    expect(card.title).toBe('Updated Title');
  });

  it('updates the card label', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    const cardId = firstCardId(store, colId);
    store.updateCard(colId, cardId, { label: 'QA' });
    const col = store.columns.find(c => c.id === colId)!;
    const card = col.cards.find(c => c.id === cardId)!;
    expect(card.label).toBe('QA');
  });

  it('ignores unknown column id', () => {
    const store = makeStore();
    expect(() => store.updateCard('nope', 'nope', { title: 'x' })).not.toThrow();
  });
});

describe('moveCard', () => {
  it('moves a card from one column to another', () => {
    const store = makeStore();
    const fromColId = store.columns[0].id;
    const toColId = store.columns[1].id;
    const fromCol = store.columns[0];
    const toCol = store.columns[1];
    const cardId = fromCol.cards[0].id;
    const fromBefore = fromCol.cards.length;
    const toBefore = toCol.cards.length;

    store.moveCard(cardId, fromColId, toColId, 0);

    expect(fromCol.cards).toHaveLength(fromBefore - 1);
    expect(toCol.cards).toHaveLength(toBefore + 1);
    expect(fromCol.cards.find(c => c.id === cardId)).toBeUndefined();
    expect(toCol.cards.find(c => c.id === cardId)).toBeDefined();
  });

  it('inserts card at the specified index', () => {
    const store = makeStore();
    const fromColId = store.columns[0].id;
    const toColId = store.columns[1].id;
    const cardId = store.columns[0].cards[0].id;

    store.moveCard(cardId, fromColId, toColId, 0);

    expect(store.columns[1].cards[0].id).toBe(cardId);
  });

  it('moves a card within the same column (forward)', () => {
    const store = makeStore();
    const colId = store.columns[0].id;
    const col = store.columns[0];
    // Move first card to position after second card
    const cardId = col.cards[0].id;
    const secondCardId = col.cards[1].id;

    store.moveCard(cardId, colId, colId, 2);

    expect(col.cards[0].id).toBe(secondCardId);
    expect(col.cards[1].id).toBe(cardId);
  });

  it('ignores unknown card id', () => {
    const store = makeStore();
    const colId = store.columns[0].id;
    expect(() => store.moveCard('nope', colId, colId, 0)).not.toThrow();
  });
});

// localStorage persistence

describe('localStorage persistence', () => {
  it('saves state to localStorage after addCard', () => {
    const store = makeStore();
    const colId = firstColumnId(store);
    store.addCard(colId, 'Persisted Task');
    const saved = JSON.parse(localStorage.getItem('cute-kanban-app') ?? '{}');
    const savedCol = saved.boards[0].columns.find((c: { id: string }) => c.id === colId);
    expect(savedCol.cards.some((c: { title: string }) => c.title === 'Persisted Task')).toBe(true);
  });

  it('restores state from localStorage on construction', () => {
    const store1 = makeStore();
    const colId = firstColumnId(store1);
    store1.addCard(colId, 'Persisted Task');

    // Create second store instance — it should load from localStorage
    const store2 = new AppStore();
    const col = store2.columns.find(c => c.id === colId);
    expect(col?.cards.some(c => c.title === 'Persisted Task')).toBe(true);
  });

  it('falls back to default data when localStorage is empty', () => {
    localStorage.clear();
    const store = new AppStore();
    expect(store.boards).toHaveLength(1);
    expect(store.boards[0].title).toBe('My Board');
  });
});
