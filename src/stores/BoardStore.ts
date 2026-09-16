import { makeAutoObservable, autorun, computed } from 'mobx';
import { nanoid } from 'nanoid';
import {
  type Column,
  type Card,
  type BoardData,
  type AppSettings,
  type AppData,
  type TemplateId,
  AppView,
} from '../types/kanban';
import { TEMPLATES } from '../templates/templates';

const APP_KEY    = 'cute-kanban-app';
const LEGACY_KEY = 'cute-kanban-board';

const DEFAULT_SETTINGS: AppSettings = {
  workspaceName: 'My Workspace',
  accentColor:   '#ff6b9d',
  compactMode:   false,
};

// Дефолтная доска доступная при открытии приложения
const DEFAULT_BOARD: BoardData = {
  id:          'board-default',
  title:       'My Board',
  description: 'A simple board to organize my tasks',
  columns: [
    {
      id:    'col-1',
      title: 'To Do',
      cards: [
        { id: 'card-1', title: 'Design login page', label: 'UI/UX', dueDate: 'May 20' },
        { id: 'card-2', title: 'Setup project structure', label: 'Dev', dueDate: 'May 22' },
        { id: 'card-3', title: 'Research state management', label: 'Research', dueDate: 'May 25' },
      ],
    },
    {
      id:    'col-2',
      title: 'In Progress',
      cards: [
        { id: 'card-4', title: 'Implement board logic', label: 'Dev', dueDate: 'May 18' },
        { id: 'card-5', title: 'Create reusable components', label: 'Dev', dueDate: 'May 21' },
      ],
    },
    {
      id:    'col-3',
      title: 'Done',
      cards: [
        { id: 'card-6', title: 'Setup mobX store', label: 'Dev', dueDate: 'May 15' },
        { id: 'card-7', title: 'Install dependencies', label: 'Dev', dueDate: 'May 14' },
      ],
    },
  ],
};

// применить цвет акцента к элементам интерфейса
function applyAccentColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--pink', color);
  root.style.setProperty('--pink-dark', shadeColor(color, -20));
  root.style.setProperty('--pink-light', hexToRgba(color, 0.06));
  root.style.setProperty('--pink-bg', hexToRgba(color, 0.04));
  root.style.setProperty('--pink-border', hexToRgba(color, 0.18));
  root.style.setProperty('--pink-muted', hexToRgba(color, 0.45));
};

// сделать цвет темнее или светлее
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r   = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g   = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b   = Math.min(255, Math.max(0, (num & 0xff) + percent));

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// преобразовать hex цвет в rgba
function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r   = (num >> 16) & 0xff;
  const g   = (num >> 8) & 0xff;
  const b   = num & 0xff;

  return `rgba(${r},${g},${b},${alpha})`;
};

// проверить, является ли данные корректным AppData
function isValidAppData(data: unknown): data is AppData {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  return Array.isArray(d.boards) && typeof d.currentBoardId === 'string' && !!d.settings;
};

// проверить, является ли данные корректным LegacyBoard
function isValidLegacyBoard(data: unknown): data is { columns: Column[] } {
  if (!data || typeof data !== 'object') return false;

  return Array.isArray((data as Record<string, unknown>).columns);
};

// объединить частичные настройки с дефолтными настройками
function mergeSettings(partial: unknown): AppSettings {
  const s = (partial && typeof partial === 'object' ? partial : {}) as Partial<AppSettings>;

  return {
    workspaceName: s.workspaceName ?? DEFAULT_SETTINGS.workspaceName,
    accentColor:   s.accentColor ?? DEFAULT_SETTINGS.accentColor,
    compactMode:   s.compactMode ?? DEFAULT_SETTINGS.compactMode,
  };
};

// загрузить данные приложения из localStorage
function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(APP_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (isValidAppData(parsed)) {
        parsed.settings = mergeSettings(parsed.settings);

        return parsed;
      }
    }

    const legacy = localStorage.getItem(LEGACY_KEY);

    // если есть устаревшие данные, переместить их в новый формат
    if (legacy) {
      const parsed = JSON.parse(legacy);

      if (isValidLegacyBoard(parsed)) {
        const migratedBoard: BoardData = {
          id:          'board-default',
          title:       'My Board',
          description: 'A simple board to organize my tasks',
          columns:     parsed.columns,
        };

        return {
          boards:         [migratedBoard],
          currentBoardId: 'board-default',
          settings:       DEFAULT_SETTINGS,
        };
      }
    }
  } catch {
    // если возникает ошибка при загрузке данных, вернуть дефолтную доску
  }

  return { boards: [DEFAULT_BOARD], currentBoardId: 'board-default', settings: DEFAULT_SETTINGS };
};

// класс для управления данными приложения
export class AppStore {
  boards:         BoardData[];
  currentBoardId: string;
  settings:       AppSettings;
  view:           AppView = AppView.Board;

  constructor() {
    const data          = loadAppData();
    this.boards         = data.boards;
    this.currentBoardId = data.currentBoardId;
    this.settings       = data.settings;

    makeAutoObservable(this, {
      currentBoard: computed,
      columns:      computed,
    });

    autorun(() => {
      const snapshot: AppData = {
        boards:         this.boards,
        currentBoardId: this.currentBoardId,
        settings:       this.settings,
      };

      // сохранить данные приложения в localStorage
      localStorage.setItem(APP_KEY, JSON.stringify(snapshot));
    });

    applyAccentColor(this.settings.accentColor);
  };

  get currentBoard(): BoardData | undefined {
    return this.boards.find(b => b.id === this.currentBoardId);
  };

  get columns(): Column[] {
    return this.currentBoard?.columns ?? [];
  };

  // маршрутизация между видами приложения
  setView(v: AppView) {
    this.view = v;
  }

  // управление досками
  selectBoard(id: string) {
    if (this.boards.find(b => b.id === id)) {
      this.currentBoardId = id;
      this.view           = AppView.Board;
    }
  };

  // создать новую доску
  createBoard(title: string, templateId: TemplateId) {
    const trimmed = title.trim() || 'New Board';
    const id      = nanoid();
    const columns: Column[] =
      templateId === 'empty'
        ? []
        : TEMPLATES[templateId].buildColumns();

    const board: BoardData = { id, title: trimmed, columns };
    this.boards.push(board);

    this.currentBoardId = id;
    this.view           = AppView.Board;
  };

  // удалить доску
  deleteBoard(id: string) {
    if (this.boards.length <= 1) return;

    const idx = this.boards.findIndex(b => b.id === id);

    if (idx === -1) return;

    this.boards.splice(idx, 1);

    if (this.currentBoardId === id) {
      this.currentBoardId = this.boards[0].id;
    }
  };

  // обновить метаданные доски
  updateBoardMeta(id: string, updates: { title?: string; description?: string }) {
    const board = this.boards.find(b => b.id === id);

    if (!board) return;

    if (updates.title !== undefined) board.title = updates.title;

    if (updates.description !== undefined) board.description = updates.description;
  };

  // управление настройками приложения
  updateSettings(updates: Partial<AppSettings>) {
    Object.assign(this.settings, updates);

    if (updates.accentColor) applyAccentColor(updates.accentColor);
  };

  // управление столбцами
  addColumn(title: string) {
    const board = this.currentBoard;

    if (!board) return;

    const trimmed = title.trim();

    if (!trimmed) return;

    board.columns.push({ id: nanoid(), title: trimmed, cards: [] });
  };

  // удалить столбец
  deleteColumn(columnId: string) {
    const board = this.currentBoard;

    if (!board) return;

    const idx = board.columns.findIndex(c => c.id === columnId);
    
    if (idx !== -1) board.columns.splice(idx, 1);
  };

  // управление карточками

  // добавить карточку в столбец
  addCard(columnId: string, title: string, label?: Card['label']) {
    const board = this.currentBoard;

    if (!board) return;

    const trimmed = title.trim();

    if (!trimmed) return;

    const column = board.columns.find(c => c.id === columnId);

    if (!column) return;

    column.cards.push({
      id: nanoid(),
      title: trimmed,
      label,
      dueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  };

  // переместить карточку между столбцами
  moveCard(cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) {
    const board = this.currentBoard;

    if (!board) return;

    const fromCol = board.columns.find(c => c.id === fromColumnId);
    const toCol   = board.columns.find(c => c.id === toColumnId);

    if (!fromCol || !toCol) return;

    const fromIndex = fromCol.cards.findIndex(c => c.id === cardId);

    if (fromIndex === -1) return;

    const [card] = fromCol.cards.splice(fromIndex, 1);
    const adjustedIndex = (fromColumnId === toColumnId && fromIndex < toIndex ? toIndex - 1 : toIndex);
    
    toCol.cards.splice(Math.max(0, adjustedIndex), 0, card);
  };

  // обновить карточку
  updateCard(columnId: string, cardId: string, updates: Partial<Omit<Card, 'id'>>) {
    const col = this.columns.find(c => c.id === columnId);

    if (!col) return;
    
    const card = col.cards.find(c => c.id === cardId);

    if (!card) return;

    Object.assign(card, updates);
  }

  // удалить карточку
  deleteCard(columnId: string, cardId: string) {
    const col = this.columns.find(c => c.id === columnId);
  
    if (!col) return;
    
    const idx = col.cards.findIndex(c => c.id === cardId);
    
    if (idx !== -1) col.cards.splice(idx, 1);
  }
};

export const appStore = new AppStore();
export { appStore as boardStore };
