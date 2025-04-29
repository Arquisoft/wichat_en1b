import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatisticsTable from './components/StatisticsTable';
import RecordRetriever from './RecordRetriever';

jest.mock('axios');
jest.mock('js-cookie');

describe('RecordRetriever', () => {
  const token = 'fake-token';
  beforeEach(() => {
    Cookies.get.mockReturnValue(JSON.stringify({ username: 'testuser', token }));
  });

  test('throws if no cookie', async () => {
    Cookies.get.mockReturnValue(null);
    const rr = new RecordRetriever();
    await expect(rr.getRecords()).rejects.toThrow("profile.errors.failedToRetrieveStatistics");
  });

  test('fetches records with correct URL and headers', async () => {
    const respData = { users: [], pagination: { total: 0, limit: 10, offset: 0 }, username: 'testuser' };
    axios.get.mockResolvedValue({ data: respData });

    const rr = new RecordRetriever();
    const result = await rr.getRecords({ limit: 5, gameType: 'custom' });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/statistics?limit=5&gameType=custom'),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('pagination');
  });
});

describe('StatisticsTable', () => {
  const mockStats = [
    { id: 1, username: 'alice', totalGames: 10, totalScore: 100, averageScore: 10, highScore: 20, preferredGameType: 'classical', registrationDate: '2025-01-01T00:00:00Z' },
    { id: 2, username: 'bob', totalGames: 5, totalScore: 50, averageScore: 10, highScore: 15, preferredGameType: 'suddenDeath', registrationDate: '2025-02-01T00:00:00Z' }
  ];
  const defaultProps = {
    statistics: mockStats,
    totalCount: 2,
    currentUsername: 'alice',
    filters: { sort: 'username', order: 'asc', gameType: '' },
    onFilterChange: jest.fn(),
    onPageChange: jest.fn(),
    currentOffset: 0,
    limit: 10,
    getImageUrl: jest.fn().mockReturnValue('/default-avatar.png')
  };

  test('renders header and rows', () => {
    render(
      <MemoryRouter>
        <StatisticsTable {...defaultProps} />
      </MemoryRouter>
    );
  
    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/games played/i)).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
  });

  test('avatar renders img with correct src', () => {
    render(
      <MemoryRouter>
        <StatisticsTable
          {...defaultProps}
          getImageUrl={jest.fn().mockReturnValue('/default-avatar.png')}
        />
      </MemoryRouter>
    );
    const avatars = screen.getAllByRole('img');
    avatars.forEach((img) => {
      expect(img).toHaveAttribute('src', '/default-avatar.png');
    });
  });

  test('per-page select changes limit', () => {
    render(
      <MemoryRouter>
        <StatisticsTable {...defaultProps} />
      </MemoryRouter>
    );
    const select = screen.getByDisplayValue('10 per page');
    fireEvent.change(select, { target: { value: '20' } });
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({ limit: 20 });
  });
});
