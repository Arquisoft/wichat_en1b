import React from 'react';
import { format } from 'date-fns';

const StatisticsFilter = ({ filters, onFilterChange }) => {
  const gameTypes = ['All', 'Quiz', 'Memory', 'Puzzle', 'Arcade']; // Add your actual game types

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (value) {
      // Format date to ISO string
      onFilterChange({ [name]: new Date(value).toISOString() });
    } else {
      onFilterChange({ [name]: '' });
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (e) {
      return '';
    }
  };

  const handleReset = () => {
    onFilterChange({
      gameType: '',
      minGames: '',
      minScore: '',
      registeredBefore: '',
      registeredAfter: ''
    });
  };

  return (
    <div className="filter-container">
      <h3>Filter Results</h3>
      <div className="filter-group">
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="gameType">Game Type:</label>
            <select 
              name="gameType" 
              value={filters.gameType} 
              onChange={handleInputChange}
            >
              <option value="">All Types</option>
              {gameTypes.map((type, index) => (
                <option key={index} value={type !== 'All' ? type : ''}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label htmlFor="minGames">Min. Games Played:</label>
            <input 
              type="number" 
              name="minGames" 
              value={filters.minGames} 
              onChange={handleInputChange}
              min="0"
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="minScore">Min. Score:</label>
            <input 
              type="number" 
              name="minScore" 
              value={filters.minScore} 
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="registeredAfter">Registered After:</label>
            <input 
              type="date" 
              name="registeredAfter" 
              value={formatDateForInput(filters.registeredAfter)} 
              onChange={handleDateChange}
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="registeredBefore">Registered Before:</label>
            <input 
              type="date" 
              name="registeredBefore" 
              value={formatDateForInput(filters.registeredBefore)} 
              onChange={handleDateChange}
            />
          </div>
          
          <div className="filter-item">
            <label htmlFor="limit">Results per page:</label>
            <select 
              name="limit" 
              value={filters.limit} 
              onChange={handleInputChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
      
      <button className="reset-button" onClick={handleReset}>
        Reset Filters
      </button>
    </div>
  );
};

export default StatisticsFilter;