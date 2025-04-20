import React, { useState, useEffect } from 'react';
import RecordRetriever from './RecordRetriever';
import StatisticsTable from './components/StatisticsTable';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import './theme.css';

export const Statistics = () => {
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        sort: 'maxScore',  // Changed from 'totalScore' to 'maxScore'
        order: 'desc',
        limit: 50,
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
        const { statsData, username } = await recordRetriever.getRecords(filters);
        setStatistics(statsData);
        setUsername(username);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    const handleFilterChange = (newFilters) => {
      setFilters({
        ...filters,
        ...newFilters,
        offset: 0 // Reset pagination when filters change
      });
    };
  
    const handlePageChange = (newOffset) => {
      setFilters({
        ...filters,
        offset: newOffset
      });
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
          <>
              <StatisticsTable 
                  statistics={statistics} 
                  currentUsername={username}
                  onFilterChange={handleFilterChange}
                  filters={filters}
                  onPageChange={handlePageChange}
                  currentOffset={parseInt(filters.offset)}
                  limit={parseInt(filters.limit)}
                />
            </>
        )}
      </div>
    );
  };
  
  export default Statistics;