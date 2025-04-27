import React from 'react';
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
  // Map column names to their actual field names in the data
  const columnMap = {
    username: 'username',
    gamesPlayed: 'gamesPlayed',
    questionsAnswered: 'questionsAnswered',
    correctAnswers: 'correctAnswers',
    incorrectAnswers: 'incorrectAnswers',
    accuracy: 'accuracy',
    totalScore: 'totalScore', // Sum of scores from games
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

  // Calculate accuracy as percentage
  const calculateAccuracy = (correct, total) => {
    if (!total) return 0;
    return (correct / total * 100).toFixed(1);
  };

  return (
    <div className="statistics-table-container">
      <table className="statistics-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th onClick={() => handleHeaderClick('username')} className="sortable-header">
              Username {getSortIcon('username')}
            </th>
            <th onClick={() => handleHeaderClick('gamesPlayed')} className="sortable-header">
              Games Played {getSortIcon('gamesPlayed')}
            </th>
            <th onClick={() => handleHeaderClick('questionsAnswered')} className="sortable-header">
              Questions {getSortIcon('questionsAnswered')}
            </th>
            <th onClick={() => handleHeaderClick('correctAnswers')} className="sortable-header">
              Correct {getSortIcon('correctAnswers')}
            </th>
            <th onClick={() => handleHeaderClick('accuracy')} className="sortable-header">
              Accuracy % {getSortIcon('accuracy')}
            </th>
            <th onClick={() => handleHeaderClick('totalScore')} className="sortable-header">
              Total Score {getSortIcon('totalScore')}
            </th>
            <th onClick={() => handleHeaderClick('registrationDate')} className="sortable-header">
              Member Since {getSortIcon('registrationDate')}
            </th>
          </tr>
        </thead>
        <tbody>
          {statistics.length > 0 ? (
            statistics.map((user) => (
              <tr key={user._id} className={isCurrentUser(user.username) ? 'current-user-row' : ''}>
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
                <td>{user.gamesPlayed}</td>
                <td>{user.questionsAnswered}</td>
                <td>{user.correctAnswers}</td>
                <td>
                  {calculateAccuracy(user.correctAnswers, user.questionsAnswered)}%
                </td>
                <td>{user.totalScore || user.games?.reduce((sum, game) => sum + game.score, 0) || 0}</td>
                <td>{formatDate(user.registrationDate)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="8" className="no-results">No statistics found.</td></tr>
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