import React, { useState } from 'react';
import { format } from 'date-fns';

const StatisticsTable = ({ 
  statistics, 
  currentUsername, 
  onFilterChange,
  filters,
  onPageChange,
  currentOffset,
  limit
}) => {
  // State for active filters
  const [activeFilter, setActiveFilter] = useState(null);
  const gameTypes = ['All', 'Quiz', 'Memory', 'Puzzle', 'Arcade']; // Add your actual game types
  
  // Check if statistics is an array
  const users = Array.isArray(statistics) ? statistics : [];
  const totalCount = users.length; // This might need to come from the API if pagination is server-side

  const getSortIcon = (column) => {
    if (filters.sort !== column) return '⇅';
    return filters.order === 'asc' ? '↑' : '↓';
  };

  const handleHeaderClick = (column) => {
    onFilterChange({
      sort: column,
      order: filters.sort === column && filters.order === 'asc' ? 'desc' : 'asc'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isCurrentUser = (username) => {
    return username === currentUsername;
  };

  const toggleFilterDropdown = (filterName) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

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

  const handleResetFilters = () => {
    onFilterChange({
      gameType: '',
      minGames: '',
      minScore: '',
      registeredBefore: '',
      registeredAfter: ''
    });
    setActiveFilter(null);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(currentOffset / limit) + 1;
    
    return (
      <div className="pagination">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(0)}
        >
          First
        </button>
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentOffset - limit)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button 
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentOffset + limit)}
        >
          Next
        </button>
        <button 
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange((Math.max(totalPages - 1, 0)) * limit)}
        >
          Last
        </button>
        
        <select 
          value={filters.limit}
          onChange={(e) => onFilterChange({ limit: e.target.value })}
          className="page-size-selector"
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>
    );
  };

  const renderFilterDropdown = (filterName) => {
    if (activeFilter !== filterName) return null;

    switch (filterName) {
      case 'gameType':
        return (
          <div className="filter-dropdown">
            <div className="filter-dropdown-content">
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
          </div>
        );
      case 'minGames':
        return (
          <div className="filter-dropdown">
            <div className="filter-dropdown-content">
              <label>Minimum Games:</label>
              <input 
                type="number" 
                name="minGames" 
                value={filters.minGames} 
                onChange={handleInputChange} 
                min="0"
              />
            </div>
          </div>
        );
      case 'minScore':
        return (
          <div className="filter-dropdown">
            <div className="filter-dropdown-content">
              <label>Minimum Score:</label>
              <input 
                type="number" 
                name="minScore" 
                value={filters.minScore} 
                onChange={handleInputChange} 
                min="0"
              />
            </div>
          </div>
        );
      case 'registrationDate':
        return (
          <div className="filter-dropdown">
            <div className="filter-dropdown-content">
              <div className="date-filter-group">
                <label>From:</label>
                <input 
                  type="date" 
                  name="registeredAfter" 
                  value={formatDateForInput(filters.registeredAfter)} 
                  onChange={handleDateChange}
                />
              </div>
              <div className="date-filter-group">
                <label>To:</label>
                <input 
                  type="date" 
                  name="registeredBefore" 
                  value={formatDateForInput(filters.registeredBefore)} 
                  onChange={handleDateChange}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="statistics-table-container">
      {(filters.gameType || filters.minGames || filters.minScore || filters.registeredBefore || filters.registeredAfter) && (
        <div className="active-filters">
          <span>Active Filters:</span>
          {filters.gameType && (
            <div className="filter-tag">
              Game Type: {filters.gameType}
              <button onClick={() => onFilterChange({ gameType: '' })}>×</button>
            </div>
          )}
          {filters.minGames && (
            <div className="filter-tag">
              Min Games: {filters.minGames}
              <button onClick={() => onFilterChange({ minGames: '' })}>×</button>
            </div>
          )}
          {filters.minScore && (
            <div className="filter-tag">
              Min Score: {filters.minScore}
              <button onClick={() => onFilterChange({ minScore: '' })}>×</button>
            </div>
          )}
          {filters.registeredAfter && (
            <div className="filter-tag">
              From: {new Date(filters.registeredAfter).toLocaleDateString()}
              <button onClick={() => onFilterChange({ registeredAfter: '' })}>×</button>
            </div>
          )}
          {filters.registeredBefore && (
            <div className="filter-tag">
              To: {new Date(filters.registeredBefore).toLocaleDateString()}
              <button onClick={() => onFilterChange({ registeredBefore: '' })}>×</button>
            </div>
          )}
          <button className="reset-filters-btn" onClick={handleResetFilters}>Reset All</button>
        </div>
      )}

      <table className="statistics-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th 
              onClick={() => handleHeaderClick('username')}
              className="sortable-header"
            >
              Username {getSortIcon('username')}
            </th>
            <th className="filter-header">
              <div className="header-content">
                <span onClick={() => handleHeaderClick('totalGames')}>
                  Games Played {getSortIcon('totalGames')}
                </span>
                <button 
                  className="filter-button"
                  onClick={() => toggleFilterDropdown('minGames')}
                >
                  ⚙️
                </button>
              </div>
              {renderFilterDropdown('minGames')}
            </th>
            <th className="filter-header">
              <div className="header-content">
                <span onClick={() => handleHeaderClick('totalScore')}>
                  Total Score {getSortIcon('totalScore')}
                </span>
                <button 
                  className="filter-button"
                  onClick={() => toggleFilterDropdown('minScore')}
                >
                  ⚙️
                </button>
              </div>
              {renderFilterDropdown('minScore')}
            </th>
            <th 
              onClick={() => handleHeaderClick('averageScore')}
              className="sortable-header"
            >
              Avg. Score {getSortIcon('averageScore')}
            </th>
            <th 
              onClick={() => handleHeaderClick('highScore')}
              className="sortable-header"
            >
              High Score {getSortIcon('highScore')}
            </th>
            <th className="filter-header">
              <div className="header-content">
                <span onClick={() => handleHeaderClick('gameType')}>
                  Game Type {getSortIcon('gameType')}
                </span>
                <button 
                  className="filter-button"
                  onClick={() => toggleFilterDropdown('gameType')}
                >
                  ⚙️
                </button>
              </div>
              {renderFilterDropdown('gameType')}
            </th>
            <th className="filter-header">
              <div className="header-content">
                <span onClick={() => handleHeaderClick('registrationDate')}>
                  Member Since {getSortIcon('registrationDate')}
                </span>
                <button 
                  className="filter-button"
                  onClick={() => toggleFilterDropdown('registrationDate')}
                >
                  ⚙️
                </button>
              </div>
              {renderFilterDropdown('registrationDate')}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr 
                key={user.id || index} 
                className={isCurrentUser(user.username) ? 'current-user-row' : ''}
              >
                <td>{currentOffset + index + 1}</td>
                <td>{user.username} {isCurrentUser(user.username) && '(You)'}</td>
                <td>{user.totalGames}</td>
                <td>{user.totalScore}</td>
                <td>{user.averageScore ? user.averageScore.toFixed(1) : 'N/A'}</td>
                <td>{user.highScore || 'N/A'}</td>
                <td>{user.preferredGameType || 'Mixed'}</td>
                <td>{formatDate(user.registrationDate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-results">No statistics found matching your criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {renderPagination()}
    </div>
  );
};

export default StatisticsTable;