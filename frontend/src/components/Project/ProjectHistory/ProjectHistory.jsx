import React, { useState, useMemo, useCallback } from 'react'
import { FiClock, FiRefreshCw } from 'react-icons/fi'
import HistoryItem from './HistoryItem.jsx'
import HistoryFilters from './HistoryFilters.jsx'
import './ProjectHistory.css'

const ProjectHistory = ({ history = [], onRefresh, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Filter and search history
  const filteredHistory = useMemo(() => {
    let filtered = [...history]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.type === typeFilter)
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.itemName?.toLowerCase().includes(searchLower) ||
          entry.updateReason?.toLowerCase().includes(searchLower) ||
          entry.updatedBy?.toLowerCase().includes(searchLower)
      )
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      filtered = filtered.filter(
        (entry) => new Date(entry.timestamp) >= startDate
      )
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59)
      filtered = filtered.filter(
        (entry) => new Date(entry.timestamp) <= endDate
      )
    }

    return filtered
  }, [history, typeFilter, searchTerm, dateRange])

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups = {}
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    filteredHistory.forEach((entry) => {
      const entryDate = new Date(entry.timestamp).toDateString()
      let groupKey

      if (entryDate === today) {
        groupKey = 'Today'
      } else if (entryDate === yesterday) {
        groupKey = 'Yesterday'
      } else {
        groupKey = new Date(entry.timestamp).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(entry)
    })

    return groups
  }, [filteredHistory])

  // Export functionality
  const handleExport = useCallback(() => {
    const csvContent = [
      ['Type', 'Item Name', 'Owner', 'Created By', 'Machine', 'Duration', 'Progress', 'Start Date', 'End Date', 'Created At', 'Update Reason', 'Parent Stage'].join(','),
      ...filteredHistory.map((entry) =>
        [
          entry.type,
          `"${entry.itemName || ''}"`,
          `"${entry.ownerName || ''}"`,
          `"${entry.createdBy || ''}"`,
          `"${entry.machine || ''}"`,
          entry.duration || '',
          entry.progress || 0,
          entry.startDate || '',
          entry.endDate || '',
          entry.createdAt ? new Date(entry.createdAt).toISOString() : '',
          `"${entry.updateReason || ''}"`,
          `"${entry.parentStageName || ''}"`,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredHistory])

  const dateGroups = Object.keys(groupedHistory)

  return (
    <div className="project-history">
      {/* Header */}
      <div className="history-header">
        <div className="history-title">
          <FiClock size={20} />
          <h3>Project History</h3>
          <span className="history-count">{history.length} entries</span>
        </div>
        {onRefresh && (
          <button
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={onRefresh}
            disabled={loading}
          >
            <FiRefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        )}
      </div>

      {/* Filters */}
      <HistoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExport}
        totalCount={history.length}
        filteredCount={filteredHistory.length}
      />

      {/* Timeline */}
      <div className="history-timeline">
        {loading ? (
          <div className="history-loading">
            <div className="loading-spinner" />
            <p>Loading history...</p>
          </div>
        ) : dateGroups.length > 0 ? (
          dateGroups.map((dateGroup) => (
            <div key={dateGroup} className="history-date-group">
              <div className="date-group-header">
                <div className="date-group-dot" />
                <span className="date-group-label">{dateGroup}</span>
              </div>
              <div className="date-group-items">
                {groupedHistory[dateGroup].map((entry, index) => (
                  <HistoryItem
                    key={`${entry.type}-${entry.itemId}-${index}`}
                    entry={entry}
                    isLast={
                      dateGroup === dateGroups[dateGroups.length - 1] &&
                      index === groupedHistory[dateGroup].length - 1
                    }
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="history-empty">
            <FiClock size={48} />
            <h4>No History Found</h4>
            {history.length > 0 ? (
              <p>No entries match your current filters. Try adjusting your search criteria.</p>
            ) : (
              <p>Changes to stages and substages will appear here as your project progresses.</p>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {history.length > 0 && (
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-value">
              {history.filter((h) => h.type === 'stage').length}
            </span>
            <span className="stat-label">Stage Updates</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {history.filter((h) => h.type === 'substage').length}
            </span>
            <span className="stat-label">Substage Updates</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {history.filter((h) => h.progress >= 100).length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectHistory
