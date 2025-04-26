import React from 'react';
import '../theme.css';

const StatisticsFilters = ({
    filters,
    onFilterChange
  }) => {

    const handleResetFilters = () => {
      onFilterChange({
        minGames: undefined,
        minScore: undefined,
        registeredAfter: undefined,
        registeredBefore: undefined,
        offset: 0
      });
    };

    return (
      <div className="statistics-filters">
        <div className="filter-group">
          <label htmlFor="minGames">Min Games</label>
          <input
            id="minGames"
            type="number"
            min="0"
            value={filters.minGames ?? ''}
            onChange={e =>
              onFilterChange({ minGames: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="filter-group">
          <label htmlFor="minScore">Min Score</label>
          <input
            id="minScore"
            type="number"
            min="0"
            value={filters.minScore ?? ''}
            onChange={e =>
              onFilterChange({ minScore: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="filter-group">
          <label htmlFor="registeredAfter">Registered After</label>
          <input
            id="registeredAfter"
            type="date"
            value={filters.registeredAfter || ''}
            onChange={e =>
              onFilterChange({ registeredAfter: e.target.value || undefined })
            }
          />
        </div>
        <div className="filter-group">
          <label htmlFor="registeredBefore">Registered Before</label>
          <input
            id="registeredBefore"
            type="date"
            value={filters.registeredBefore || ''}
            onChange={e =>
              onFilterChange({ registeredBefore: e.target.value || undefined })
            }
          />
        </div>
        <div className="filter-group">
          <button 
            className="reset-filters-button" 
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  };
  
  export default StatisticsFilters;
