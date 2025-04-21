import React, { useState, useEffect } from 'react';
import RecordRetriever from './RecordRetriever';
import StatisticsTable from './components/StatisticsTable';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import './theme.css';

export const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sort: 'maxScore',
    order: 'desc',
    limit: 10,
    offset: 0,
    gameType: '',
    minGames: '',
    minScore: '',
    registeredBefore: '',
    registeredAfter: ''
  });
  const [username, setUsername] = useState('');

  const recordRetriever = new RecordRetriever();

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const { users, pagination: pageInfo, username: user } = await recordRetriever.getRecords(filters);
      setStatistics(users);
      setPagination(pageInfo);
      setUsername(user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: newFilters.offset !== undefined ? newFilters.offset : 0,
      limit: newFilters.limit !== undefined ? Number(newFilters.limit) : prev.limit
    }));
  };

  const handlePageChange = (newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>Global Statistics</h1>
        <p>Welcome, {username}!</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <StatisticsTable
          statistics={statistics}
          totalCount={pagination.total}
          currentUsername={username}
          onFilterChange={handleFilterChange}
          filters={filters}
          onPageChange={handlePageChange}
          currentOffset={pagination.offset}
          limit={pagination.limit}
          getImageUrl={recordRetriever.getStaticProfileImageUrl.bind(recordRetriever)}
        />
      )}
    </div>
  );
};

export default Statistics;