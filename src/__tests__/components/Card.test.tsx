import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../../components/Card/Card';
import { type Card as CardType } from '../../types/kanban';

// Мокаем store, чтобы Card можно было тестировать изолированно
const mockDeleteCard = jest.fn();
const mockUpdateCard = jest.fn();

jest.mock('../../stores/BoardStore', () => ({
  boardStore: {
    deleteCard: (...args: unknown[]) => mockDeleteCard(...args),
    updateCard: (...args: unknown[]) => mockUpdateCard(...args),
  },
  appStore: {
    deleteCard: (...args: unknown[]) => mockDeleteCard(...args),
    updateCard: (...args: unknown[]) => mockUpdateCard(...args),
  },
}));

// Мокаем EditCardForm, чтобы не нужно было рендерить его внутренности
jest.mock('../../components/Card/EditCardForm', () => ({
  EditCardForm: ({ onCancel }: { onCancel: () => void; onSave: (u: object) => void }) => (
    <div data-testid="edit-card-form">
      <button onClick={onCancel}>cancel-edit</button>
    </div>
  ),
}));

const baseCard: CardType = {
  id: 'card-test-1',
  title: 'Write unit tests',
  label: 'Dev',
  dueDate: 'Aug 12',
};

function renderCard(overrides?: Partial<CardType>, isDndDisabled?: boolean) {
  const card = { ...baseCard, ...overrides };
  return render(<Card card={card} columnId="col-1" isDndDisabled={isDndDisabled} />);
}

describe('Card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the card title', () => {
    renderCard();
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
  });

  it('renders the label', () => {
    renderCard();
    expect(screen.getByText('Dev')).toBeInTheDocument();
  });

  it('renders the due date', () => {
    renderCard();
    expect(screen.getByText('Aug 12')).toBeInTheDocument();
  });

  it('does not render a label when it is absent', () => {
    renderCard({ label: undefined });
    expect(screen.queryByText('Dev')).not.toBeInTheDocument();
  });

  it('does not render a date when it is absent', () => {
    renderCard({ dueDate: undefined });
    expect(screen.queryByText('Aug 12')).not.toBeInTheDocument();
  });

  it('shows the EditCardForm when the edit button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTitle('Edit'));
    expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();
  });

  it('hides the EditCardForm when cancel is clicked inside it', () => {
    renderCard();
    fireEvent.click(screen.getByTitle('Edit'));
    expect(screen.getByTestId('edit-card-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('cancel-edit'));
    expect(screen.queryByTestId('edit-card-form')).not.toBeInTheDocument();
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
  });

  it('calls boardStore.deleteCard with correct args when delete button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTitle('Delete'));
    expect(mockDeleteCard).toHaveBeenCalledTimes(1);
    expect(mockDeleteCard).toHaveBeenCalledWith('col-1', 'card-test-1');
  });

  it('is draggable by default', () => {
    const { container } = renderCard();
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('draggable', 'true');
  });

  it('is not draggable when isDndDisabled is true', () => {
    const { container } = renderCard(undefined, true);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('draggable', 'false');
  });
});
