export const LABELS = ['UI/UX', 'Dev', 'Research', 'Design', 'QA'] as const;

// labels
export type Label = (typeof LABELS)[number];

// card input (no id yet)
export interface CardInput {
  title:    string;
  label?:   Label;
  dueDate?: string;
};

// card data
export interface Card extends CardInput {
  id: string;
};

// column data
export interface Column {
  id:    string;     
  title: string;
  cards: Card[];
};

// board data
export interface BoardData {
  id:           string;
  title:        string;
  description?: string;
  columns:      Column[];
};

// app settings
export interface AppSettings {
  workspaceName: string;
  accentColor:   string;
  compactMode:   boolean;
};

// app data
export interface AppData {
  boards:         BoardData[];
  currentBoardId: string;
  settings:       AppSettings;
};

// template IDs
export type TemplateId = 'empty' | 'sprint' | 'personal';

// app views
export const AppView = {
  Board:     'board',
  Templates: 'templates',
  Settings:  'settings',
} as const;

export type AppView = (typeof AppView)[keyof typeof AppView];
