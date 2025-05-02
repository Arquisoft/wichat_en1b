import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Statistics from './Statistics';

const mockGetRecords = jest.fn();

jest.mock('./RecordRetriever', () => {
  return jest.fn().mockImplementation(() => ({
    getRecords: mockGetRecords
  }));
});

describe('Statistics Component', () => {

  it('renders the component', () => {
    mockGetRecords.mockResolvedValue({ users: [], pagination: {}, username: 'Test' });
    render(<Statistics />);

    expect(screen.getByRole('heading', { name: 'Global statistics' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Global 🌍' })).toBeInTheDocument();
;
    fireEvent.click(screen.getByRole('tab', { name: 'Classical 🎲' }));
  });
});