import React, { useState } from 'react'
import { FiSearch, FiFilter, FiX, FiCalendar, FiDownload } from 'react-icons/fi'

const HistoryFilters = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  dateRange,
  setDateRange,
  onExport,
  totalCount,
  filteredCount,
}) => {
  const [showFilters, setShowFilters] = useState(false)

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setDateRange({ start: '', end: '' })
  }

  const hasActiveFilters =
    searchTerm || typeFilter !== 'all' || dateRange.start || dateRange.end

  return (
    <div className="history-filters">
      {/* Search Bar */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Filter Toggle & Actions */}
      <div className="filter-actions">
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter size={16} />
          Filters
          {hasActiveFilters && <span className="filter-badge" />}
        </button>

        <button className="export-btn" onClick={onExport}>
          <FiDownload size={16} />
          Export
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-row">
            {/* Type Filter */}
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <div className="type-buttons">
                {['all', 'stage', 'substage'].map((type) => (
                  <button
                    key={type}
                    className={`type-btn ${typeFilter === type ? 'active' : ''}`}
                    onClick={() => setTypeFilter(type)}
                  >
                    {type === 'all' && '📋 All'}
                    {type === 'stage' && '📋 Stages'}
                    {type === 'substage' && '📎 Substages'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="filter-group">
              <label className="filter-label">
                <FiCalendar size={14} /> Date Range
              </label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="date-input"
                  placeholder="From"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="date-input"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="filters-footer">
              <span className="results-count">
                Showing {filteredCount} of {totalCount} entries
              </span>
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <FiX size={14} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryFilters
