import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Paper, Box, Typography } from '@mui/material';
import RecordRetriever from './RecordRetriever';
import StatisticsTable from './components/StatisticsTable';
import StatisticsFilters from './components/StatisticsFilters';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import './theme.css';

export const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState({
    sort: 'totalScore',       // Default sort by totalScore
    order: 'desc',
    limit: 10,
    offset: 0,
    gameType: '',
    minGames: undefined,
    minScore: undefined
  });
  const [username, setUsername] = useState('');
  const { t } = useTranslation();

  const recordRetriever = new RecordRetriever();

  // Map tab index to game type for filtering
  const tabToGameType = {
    0: '', // Global (all game types)
    1: 'classical',
    2: 'suddenDeath',
    3: 'timeTrial'
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setFilters(prev => ({
      ...prev,
      gameType: tabToGameType[newValue],
      offset: 0 // Reset to first page when changing tabs
    }));
  };

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

  // Get tab title based on selected tab
  const getTabTitle = () => {
    switch (selectedTab) {
      case 0: return "statistics.statisticTypes.global";
      case 1: return "statistics.statisticTypes.classical";
      case 2: return "statistics.statisticTypes.suddenDeath";
      case 3: return "statistics.statisticTypes.timeTrial";
      default: return "Statistics";
    }
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>{t("statistics.globalStatistics")}</h1>
        <p>{t("statistics.welcome", { username: username })}</p>
      </div>

      <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="Statistics game mode tabs"
          >
            <Tab label={t("statistics.statisticTypes.global")} />
            <Tab label={t("statistics.statisticTypes.classical")} />
            <Tab label={t("statistics.statisticTypes.suddenDeath")} />
            <Tab label={t("statistics.statisticTypes.timeTrial")} />
          </Tabs>
        </Box>

        <StatisticsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <Typography variant="h5" component="div" sx={{ mb: 2 }}>
          {t(getTabTitle())}
        </Typography>

        {error && <ErrorMessage message={t(error)} />}

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
            getImageUrl={(username) => recordRetriever.getStaticProfileImageUrl(username)}
          />
        )}
      </Paper>
    </div>
  );
};

export default Statistics;
