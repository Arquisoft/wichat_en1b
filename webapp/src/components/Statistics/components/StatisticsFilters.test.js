import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticsFilters from './StatisticsFilters';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

describe('StatisticsFilters', () => {
  const mockOnFilterChange = jest.fn();
  const defaultFilters = {
    minGames: undefined,
    minScore: undefined,
    registeredAfter: undefined,
    registeredBefore: undefined,
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  test('renders all filter inputs and reset button', () => {
    render(<StatisticsFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByLabelText('statistics.filters.minGames')).toBeInTheDocument();
    expect(screen.getByLabelText('statistics.filters.minScore')).toBeInTheDocument();
    expect(screen.getByLabelText('statistics.filters.registeredAfter')).toBeInTheDocument();
    expect(screen.getByLabelText('statistics.filters.registeredBefore')).toBeInTheDocument();
    expect(screen.getByText('statistics.filters.reset')).toBeInTheDocument();
  });

  test('calls onFilterChange when minGames is updated', () => {
    render(<StatisticsFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

    const minGamesInput = screen.getByLabelText('statistics.filters.minGames');
    fireEvent.change(minGamesInput, { target: { value: '5' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ minGames: 5 });
  });

  test('calls onFilterChange when reset button is clicked', () => {
    render(<StatisticsFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

    const resetButton = screen.getByText('statistics.filters.reset');
    fireEvent.click(resetButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      minGames: undefined,
      minScore: undefined,
      registeredAfter: undefined,
      registeredBefore: undefined,
      offset: 0,
    });
  });

  test('calls onFilterChange when registeredAfter is updated', () => {
    render(<StatisticsFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

    const registeredAfterInput = screen.getByLabelText('statistics.filters.registeredAfter');
    fireEvent.change(registeredAfterInput, { target: { value: '2025-05-01' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ registeredAfter: '2025-05-01' });
  });

  test('calls onFilterChange when registeredBefore is updated', () => {
    render(<StatisticsFilters filters={defaultFilters} onFilterChange={mockOnFilterChange} />);

    const registeredBeforeInput = screen.getByLabelText('statistics.filters.registeredBefore');
    fireEvent.change(registeredBeforeInput, { target: { value: '2025-05-02' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ registeredBefore: '2025-05-02' });
  });
});