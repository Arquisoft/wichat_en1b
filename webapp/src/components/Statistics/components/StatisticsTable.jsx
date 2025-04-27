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
  const columnMap = {
    username: 'username',
    totalGames: 'gamesPlayed',
    totalScore: 'totalScore',
    highScore: 'maxScore',
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

  return (
    <div className="statistics-table-container">
      <table className="statistics-table">
        <thead>
          <tr>
            <th>{t("statistics.avatar")}</th>
            <th onClick={() => handleHeaderClick('username')} className="sortable-header">
              {t("statistics.username")} {getSortIcon('username')}
            </th>
            <th onClick={() => handleHeaderClick('totalGames')} className="sortable-header">
              {t("statistics.gamesPlayed")} {getSortIcon('totalGames')}
            </th>
            <th onClick={() => handleHeaderClick('totalScore')} className="sortable-header">
              {t("statistics.totalScore")} {getSortIcon('totalScore')}
            </th>
            <th className="non-sortable-header">{t("statistics.avgScore")}</th>
            <th onClick={() => handleHeaderClick('highScore')} className="sortable-header">
              {t("statistics.highestScore")} {getSortIcon('highScore')}
            </th>
            <th className="non-sortable-header">{t("statistics.gameType")}</th>
            <th onClick={() => handleHeaderClick('registrationDate')} className="sortable-header">
              {t("statistics.memberSince")} {getSortIcon('registrationDate')}
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
                    {user.username} {isCurrentUser(user.username) && '(' + t("statistics.you") + ')'}
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
            <tr><td colSpan="9" className="no-results">{t("statistics.noStatsFound")}.</td></tr>
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
