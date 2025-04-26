import React from 'react';
import { Box } from '@mui/material';

const StatisticsFilters = ({
  filters,
  onFilterChange
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2, flexWrap: 'wrap' }}>
      <div>
        <label htmlFor="minGames">Min Games: </label>
        <input
          id="minGames"
          type="number"
          min="0"
          value={filters.minGames ?? ''}
          onChange={e =>
            onFilterChange({ minGames: e.target.value ? Number(e.target.value) : undefined })
          }
          style={{ width: 80 }}
        />
      </div>
      <div>
        <label htmlFor="minScore">Min Score: </label>
        <input
          id="minScore"
          type="number"
          min="0"
          value={filters.minScore ?? ''}
          onChange={e =>
            onFilterChange({ minScore: e.target.value ? Number(e.target.value) : undefined })
          }
          style={{ width: 80 }}
        />
      </div>
      <div>
        <label htmlFor="registeredAfter">Registered After: </label>
        <input
          id="registeredAfter"
          type="date"
          value={filters.registeredAfter || ''}
          onChange={e =>
            onFilterChange({ registeredAfter: e.target.value || undefined })
          }
        />
      </div>
      <div>
        <label htmlFor="registeredBefore">Registered Before: </label>
        <input
          id="registeredBefore"
          type="date"
          value={filters.registeredBefore || ''}
          onChange={e =>
            onFilterChange({ registeredBefore: e.target.value || undefined })
          }
        />
      </div>
    </Box>
  );
};

export default StatisticsFilters;
