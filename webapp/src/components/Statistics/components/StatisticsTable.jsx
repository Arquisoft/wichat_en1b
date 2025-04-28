import React from 'react';
import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  const { t, i18n } = useTranslation();

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' });
  };
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
            <th>{t("statistics.avatar")}</th>
            <th onClick={() => handleHeaderClick('username')} className="sortable-header">
              {t("statistics.username")} {getSortIcon('username')}
            </th>
            <th onClick={() => handleHeaderClick('gamesPlayed')} className="sortable-header">
            {t("statistics.gamesPlayed")} {getSortIcon('gamesPlayed')}
            </th>
            <th onClick={() => handleHeaderClick('questionsAnswered')} className="sortable-header">
              {t("statistics.questions")} {getSortIcon('questionsAnswered')}
            </th>
            <th onClick={() => handleHeaderClick('correctAnswers')} className="sortable-header">
              {t("statistics.correct")} {getSortIcon('correctAnswers')}
            </th>
            <th onClick={() => handleHeaderClick('accuracy')} className="sortable-header">
              {t("statistics.accuracy")} {getSortIcon('accuracy')}
            </th>
            <th onClick={() => handleHeaderClick('totalScore')} className="sortable-header">
              {t("statistics.totalScore")} {getSortIcon('totalScore')}
            </th>
            <th onClick={() => handleHeaderClick('registrationDate')} className="sortable-header">
              {t("statistics.memberSince")} {getSortIcon('registrationDate')}
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
                    {user.username} {isCurrentUser(user.username) && '(' + t("statistics.you") + ')'}
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
            <tr><td colSpan="8" className="no-results">{t("statistics.noStatsFound")}</td></tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => onPageChange(0)}>{t("statistics.pagination.first")}</button>
        <button disabled={currentPage === 1} onClick={() => onPageChange(currentOffset - limit)}>{t("statistics.pagination.previous")}</button>
        <span>{t("statistics.pagination.page", { page: currentPage, total: totalPages })}</span>
        <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentOffset + limit)}>{t("statistics.pagination.next")}</button>
        <button disabled={currentPage === totalPages} onClick={() => onPageChange((totalPages - 1) * limit)}>{t("statistics.pagination.last")}</button>
        <select value={limit} onChange={e => onFilterChange({ limit: Number(e.target.value) })}>
          {[5, 10, 20, 30].map(n => <option key={n} value={n}>{t("statistics.pagination.perPage", { amount: n })}</option>)}
        </select>
      </div>
    </div>
  );
};

export default StatisticsTable;