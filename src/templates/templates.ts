import { nanoid } from 'nanoid';
import { type CardInput, type Column, type TemplateId } from '../types/kanban';

export interface TemplateDefinition {
  id:           TemplateId;
  title:        string;
  description:  string;
  icon:         string;
  columnNames:  string[];
  buildColumns: () => Column[];
};

// create a column
function col(title: string, cards: CardInput[]): Column {
  return {
    id: nanoid(),
    title,
    cards: cards.map(c => ({ id: nanoid(), ...c })),
  };
};

// 
export const TEMPLATES: Record<Exclude<TemplateId, 'empty'>, TemplateDefinition> = {
  sprint: {
    id:           'sprint',
    title:        'Sprint Board',
    description:  'Agile sprint workflow with backlog and review stages',
    icon:         '🚀',
    columnNames:  ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
    buildColumns: (): Column[] => [
      col('Backlog', [
        { title: 'Define acceptance criteria', label: 'Dev' },
        { title: 'Write API documentation', label: 'Dev' },
        { title: 'Accessibility audit', label: 'QA' },
      ]),
      col('To Do', [
        { title: 'Design onboarding screens', label: 'UI/UX', dueDate: 'Aug 14' },
        { title: 'Setup CI pipeline', label: 'Dev', dueDate: 'Aug 15' },
      ]),
      col('In Progress', [
        { title: 'Implement auth flow', label: 'Dev', dueDate: 'Aug 12' },
        { title: 'Mobile responsive layout', label: 'UI/UX', dueDate: 'Aug 13' },
      ]),
      col('Review', [
        { title: 'Code review: Dashboard', label: 'Dev', dueDate: 'Aug 12' },
      ]),
      col('Done', [
        { title: 'Project kickoff', label: 'Dev', dueDate: 'Aug 1' },
        { title: 'Tech stack decision', label: 'Research', dueDate: 'Aug 3' },
      ]),
    ],
  },
  personal: {
    id:           'personal',
    title:        'Personal Tasks',
    description:  'Simple personal task tracker for everyday life',
    icon:         '🌸',
    columnNames:  ['Ideas', 'This Week', 'Doing', 'Completed'],
    buildColumns: (): Column[] => [
      col('Ideas', [
        { title: 'Learn a new language', label: 'Research' },
        { title: 'Start journaling', label: 'Design' },
        { title: 'Explore new coffee shops', label: 'Research' },
      ]),
      col('This Week', [
        { title: 'Go to the gym 3×', dueDate: 'Aug 14' },
        { title: 'Read 30 pages', dueDate: 'Aug 13' },
        { title: 'Meal prep for the week', dueDate: 'Aug 12' },
      ]),
      col('Doing', [
        { title: 'Finish online course', label: 'Dev', dueDate: 'Aug 12' },
        { title: 'Redesign portfolio site', label: 'Design', dueDate: 'Aug 15' },
      ]),
      col('Completed', [
        { title: 'Set up new laptop', dueDate: 'Aug 5' },
        { title: 'Buy a plant', dueDate: 'Aug 3' },
      ]),
    ],
  },
};

export const EMPTY_TEMPLATE: Omit<TemplateDefinition, 'buildColumns'> = {
  id:           'empty',
  title:        'Empty Board',
  description:  'Start from scratch with a blank board',
  icon:         '✨',
  columnNames:  [],
};
