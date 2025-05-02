import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticsTable from './StatisticsTable';
import { MemoryRouter } from 'react-router-dom';

const mockStatistics = [
  {
    _id: '1',
    username: 'user1',
    gamesPlayed: 10,
    questionsAnswered: 50,
    correctAnswers: 40,
    totalScore: 100,
    registrationDate: '2023-01-01',
  },
  {
    _id: '2',
    username: 'user2',
    gamesPlayed: 5,
    questionsAnswered: 20,
    correctAnswers: 10,
    totalScore: 50,
    registrationDate: '2023-02-01',
  },
];

describe('StatisticsTable', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnPageChange = jest.fn();
  const mockGetImageUrl = jest.fn((username) => `https://example.com/${username}.png`);

  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table headers correctly', () => {
    renderWithRouter(
      <StatisticsTable
        statistics={mockStatistics}
        totalCount={2}
        currentUsername="user1"
        onFilterChange={mockOnFilterChange}
        filters={{ sort: 'username', order: 'asc' }}
        onPageChange={mockOnPageChange}
        currentOffset={0}
        limit={10}
        getImageUrl={mockGetImageUrl}
      />
    );

    expect(screen.getByText('Username ↑')).toBeInTheDocument();
    expect(screen.getByText('Games played ⇅')).toBeInTheDocument();
    expect(screen.getByText('Questions ⇅')).toBeInTheDocument();
    expect(screen.getByText('Correct ⇅')).toBeInTheDocument();
    expect(screen.getByText('Accuracy % ⇅')).toBeInTheDocument();
    expect(screen.getByText('Total score ⇅')).toBeInTheDocument();
    expect(screen.getByText('Member since ⇅')).toBeInTheDocument();
  });

  it('renders user statistics correctly', () => {
    renderWithRouter(
      <StatisticsTable
        statistics={mockStatistics}
        totalCount={2}
        currentUsername="user1"
        onFilterChange={mockOnFilterChange}
        filters={{ sort: 'username', order: 'asc' }}
        onPageChange={mockOnPageChange}
        currentOffset={0}
        limit={10}
        getImageUrl={mockGetImageUrl}
      />
    );

    expect(screen.getByText('user1 (You)')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();

    expect(screen.getAllByText('10')).toHaveLength(2);
    expect(screen.getAllByText('50')).toHaveLength(2);
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('calls onFilterChange when a sortable header is clicked', () => {
    renderWithRouter(
      <StatisticsTable
        statistics={mockStatistics}
        totalCount={2}
        currentUsername="user1"
        onFilterChange={mockOnFilterChange}
        filters={{ sort: 'username', order: 'asc' }}
        onPageChange={mockOnPageChange}
        currentOffset={0}
        limit={10}
        getImageUrl={mockGetImageUrl}
      />
    );

    fireEvent.click(screen.getByText('Username ↑'));
    expect(mockOnFilterChange).toHaveBeenCalledWith({ sort: 'username', order: 'desc' });
  });

  it('disables pagination buttons correctly', () => {
    renderWithRouter(
      <StatisticsTable
        statistics={mockStatistics}
        totalCount={2}
        currentUsername="user1"
        onFilterChange={mockOnFilterChange}
        filters={{ sort: 'username', order: 'asc' }}
        onPageChange={mockOnPageChange}
        currentOffset={0}
        limit={10}
        getImageUrl={mockGetImageUrl}
      />
    );

    expect(screen.getByText('First')).toBeDisabled();
    expect(screen.getByText('Previous')).toBeDisabled();
  });

  it('calls onPageChange when pagination buttons are clicked', () => {
    renderWithRouter(
      <StatisticsTable
        statistics={mockStatistics}
        totalCount={20}
        currentUsername="user1"
        onFilterChange={mockOnFilterChange}
        filters={{ sort: 'username', order: 'asc' }}
        onPageChange={mockOnPageChange}
        currentOffset={0}
        limit={10}
        getImageUrl={mockGetImageUrl}
      />
    );

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnPageChange).toHaveBeenCalledWith(10);
  });
});