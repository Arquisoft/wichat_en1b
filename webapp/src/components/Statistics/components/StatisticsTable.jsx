import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';

const StatisticsTable = ({
  statistics,
  totalCount,
  currentUsername,
  onFilterChange,
  filters,
  onPageChange,
  currentOffset,
  limit = 10,
  getImageUrl
}) => {
  const columnMap = {
    username: 'username',
    totalGames: 'gamesPlayed',
    totalScore: 'totalScore',
    highScore: 'maxScore',
    registrationDate: 'registrationDate'
  };

  const getSortIcon = (col) => {
    const field = columnMap[col] || col;
    if (filters.sort !== field) return '⇅';
    return filters.order === 'asc' ? '↑' : '↓';
  };

  const handleHeaderClick = (col) => {
    const field = columnMap[col] || col;
    if (!columnMap[col]) return;
    const isSame = filters.sort === field;
    onFilterChange({ sort: field, order: isSame && filters.order === 'asc' ? 'desc' : 'asc' });
  };

  const formatDate = (dateString) => dateString ? format(new Date(dateString), 'MM/dd/yyyy') : 'N/A';
  const isCurrentUser = (u) => u === currentUsername;

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const currentPage = Math.floor(currentOffset / limit) + 1;

  return (
    <div className="statistics-table-container">
      <table className="statistics-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th onClick={() => handleHeaderClick('username')} className="sortable-header">
              Username {getSortIcon('username')}
            </th>
            <th onClick={() => handleHeaderClick('totalGames')} className="sortable-header">
              Games Played {getSortIcon('totalGames')}
            </th>
            <th onClick={() => handleHeaderClick('totalScore')} className="sortable-header">
              Total Score {getSortIcon('totalScore')}
            </th>
            <th className="non-sortable-header">Avg. Score</th>
            <th onClick={() => handleHeaderClick('highScore')} className="sortable-header">
              High Score {getSortIcon('highScore')}
            </th>
            <th className="non-sortable-header">Game Type</th>
            <th onClick={() => handleHeaderClick('registrationDate')} className="sortable-header">
              Member Since {getSortIcon('registrationDate')}
            </th>
          </tr>
        </thead>
        <tbody>
          {statistics.length > 0 ? (
            statistics.map((user, i) => (
              <tr key={user.id} className={isCurrentUser(user.username) ? 'current-user-row' : ''}>
                <td>
                  <Avatar
                    src={getImageUrl(user.username)}
                    alt={user.username}
                    sx={{ width: 36, height: 36 }}
                  />
                </td>
                <td>
                  <Link
                    to={`/profile/${user.username}`}
                    className="username-link"
                    style={{ color: '#1976d2', textDecoration: 'none' }}
                  >
                    {user.username} {isCurrentUser(user.username) && '(You)'}
                  </Link>
                </td>
                <td>{user.totalGames}</td>
                <td>{user.totalScore}</td>
                <td>{user.averageScore != null ? user.averageScore.toFixed(1) : 'N/A'}</td>
                <td>{user.highScore}</td>
                <td>{user.preferredGameType || 'Mixed'}</td>
                <td>{formatDate(user.registrationDate)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9" className="no-results">No statistics found.</td></tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => onPageChange(0)}>First</button>
        <button disabled={currentPage === 1} onClick={() => onPageChange(currentOffset - limit)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentOffset + limit)}>Next</button>
        <button disabled={currentPage === totalPages} onClick={() => onPageChange((totalPages - 1) * limit)}>Last</button>
        <select value={limit} onChange={e => onFilterChange({ limit: Number(e.target.value) })}>
          {[5, 10, 20, 30].map(n => <option key={n} value={n}>{n} per page</option>)}
        </select>
      </div>
    </div>
  );
};

export default StatisticsTable;
