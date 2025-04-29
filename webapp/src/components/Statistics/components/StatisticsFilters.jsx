import React from 'react';
import '../theme.css';
import { useTranslation } from 'react-i18next';

const StatisticsFilters = ({
    filters,
    onFilterChange
  }) => {

    const { t } = useTranslation();
    
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
          <label htmlFor="minGames">{t("statistics.filters.minGames")}</label>
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
          <label htmlFor="minScore">{t("statistics.filters.minScore")}</label>
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
          <label htmlFor="registeredAfter">{t("statistics.filters.registeredAfter")}</label>
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
          <label htmlFor="registeredBefore">{t("statistics.filters.registeredBefore")}</label>
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
            {t("statistics.filters.reset")}
          </button>
        </div>
      </div>
    );
  };
  
  export default StatisticsFilters;
