import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../../components/Board/FilterBar';
import { LABELS, type Label } from '../../types/kanban';

function renderFilterBar(overrides?: {
  filterText?: string
  filterLabels?: Set<Label>
  onFilterTextChange?: jest.Mock
  onToggleLabel?: jest.Mock
  onClear?: jest.Mock
}) {
  const props = {
    filterText: '',
    filterLabels: new Set<Label>(),
    onFilterTextChange: jest.fn(),
    onToggleLabel: jest.fn(),
    onClear: jest.fn(),
    ...overrides,
  };
  return { ...render(<FilterBar {...props} />), props };
}

describe('FilterBar', () => {
  it('renders the search input', () => {
    renderFilterBar();
    expect(screen.getByPlaceholderText('Search cards…')).toBeInTheDocument();
  });

  it('renders all 5 label chips', () => {
    renderFilterBar();
    LABELS.forEach(label => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('calls onFilterTextChange when typing in the search input', async () => {
    const onFilterTextChange = jest.fn();
    renderFilterBar({ onFilterTextChange });
    const input = screen.getByPlaceholderText('Search cards…');
    await userEvent.type(input, 'design');
    expect(onFilterTextChange).toHaveBeenCalled();
  });

  it('calls onToggleLabel with the correct label when a chip is clicked', () => {
    const onToggleLabel = jest.fn();
    renderFilterBar({ onToggleLabel });
    fireEvent.click(screen.getByRole('button', { name: 'Dev' }));
    expect(onToggleLabel).toHaveBeenCalledWith('Dev');
  });

  it('does not show the clear button when filter is empty', () => {
    renderFilterBar({ filterText: '', filterLabels: new Set() });
    expect(screen.queryByText(/clear filter/i)).not.toBeInTheDocument();
  });

  it('shows the clear button when filterText is non-empty', () => {
    renderFilterBar({ filterText: 'hello' });
    expect(screen.getByText(/clear filter/i)).toBeInTheDocument();
  });

  it('shows the clear button when filterLabels has entries', () => {
    renderFilterBar({ filterLabels: new Set<Label>(['Dev']) });
    expect(screen.getByText(/clear filter/i)).toBeInTheDocument();
  });

  it('calls onClear when the clear button is clicked', () => {
    const onClear = jest.fn();
    renderFilterBar({ filterText: 'hello', onClear });
    fireEvent.click(screen.getByText(/clear filter/i));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('shows the inline × button to clear search when filterText is non-empty', () => {
    renderFilterBar({ filterText: 'abc' });
    // The × button inside the search wrapper
    const clearInputBtns = screen.getAllByText('×');
    expect(clearInputBtns.length).toBeGreaterThan(0);
  });

  it('calls onFilterTextChange with empty string when inline × is clicked', () => {
    const onFilterTextChange = jest.fn();
    renderFilterBar({ filterText: 'abc', onFilterTextChange });
    // Find the × button inside the search wrapper (not "× Clear filter")
    const buttons = screen.getAllByText('×');
    // The inline clear is the one inside the search wrapper
    fireEvent.click(buttons[0]);
    expect(onFilterTextChange).toHaveBeenCalledWith('');
  });
});
