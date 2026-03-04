import React, { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiClock, FiUser, FiCalendar, FiSettings, FiLayers } from 'react-icons/fi'
import { formatDate } from '../../common/functions/formatDate.js'

const HistoryItem = ({ entry, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTypeConfig = (type) => {
    switch (type) {
      case 'stage':
        return {
          color: '#0061A1',
          bgColor: '#dbeafe',
          icon: '📋',
          label: 'Stage',
        }
      case 'substage':
        return {
          color: '#6366f1',
          bgColor: '#e8e0ff',
          icon: '📎',
          label: 'Substage',
        }
      case 'project':
        return {
          color: '#16a34a',
          bgColor: '#dcfce7',
          icon: '🏗️',
          label: 'Project',
        }
      default:
        return {
          color: '#6c757d',
          bgColor: '#f1f3f5',
          icon: '📝',
          label: 'Change',
        }
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case 'created':
        return { text: 'Created', color: '#16a34a' }
      case 'updated':
        return { text: 'Updated', color: '#f59e0b' }
      case 'completed':
        return { text: 'Completed', color: '#0061A1' }
      case 'deleted':
        return { text: 'Deleted', color: '#dc2626' }
      default:
        return { text: 'Modified', color: '#6c757d' }
    }
  }

  const typeConfig = getTypeConfig(entry.type)
  const actionConfig = getActionLabel(entry.action)

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatFullDate = (timestamp) => {
    if (!timestamp) return '—'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="history-item-wrapper">
      {/* Timeline connector */}
      <div className="timeline-connector">
        <div
          className="timeline-dot"
          style={{ background: typeConfig.color }}
        />
        {!isLast && <div className="timeline-line" />}
      </div>

      {/* Content */}
      <div
        className={`history-item-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="history-item-header">
          <div className="history-item-left">
            <div className="history-item-badges">
              <span
                className="type-badge"
                style={{
                  background: typeConfig.bgColor,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.icon} {typeConfig.label}
              </span>
              {entry.action && (
                <span
                  className="action-badge"
                  style={{ color: actionConfig.color }}
                >
                  {actionConfig.text}
                </span>
              )}
              {entry.historyOf && (
                <span className="history-badge">v{entry.historyOf}</span>
              )}
            </div>
            <h4 className="history-item-name">{entry.itemName}</h4>
            
            {/* Quick info row */}
            <div className="history-quick-info">
              {entry.ownerName && (
                <span className="quick-info-item">
                  <FiUser size={12} /> Owner: {entry.ownerName}
                </span>
              )}
              {entry.machine && (
                <span className="quick-info-item">
                  <FiSettings size={12} /> {entry.machine}
                </span>
              )}
              {entry.parentStageName && (
                <span className="quick-info-item">
                  <FiLayers size={12} /> Stage: {entry.parentStageName}
                </span>
              )}
              {entry.duration && (
                <span className="quick-info-item">
                  <FiClock size={12} /> {entry.duration} days
                </span>
              )}
            </div>

            {entry.updateReason && (
              <p className="history-item-reason">
                📝 {entry.updateReason}
              </p>
            )}
          </div>

          <div className="history-item-right">
            <div className="history-item-meta">
              {entry.createdBy && (
                <span className="meta-item">
                  <FiUser size={12} />
                  {entry.createdBy}
                </span>
              )}
              <span className="meta-item">
                <FiClock size={12} />
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
            <div className="history-item-progress">
              <span
                className="progress-value"
                style={{
                  color: entry.progress >= 100 ? '#16a34a' : typeConfig.color,
                }}
              >
                {entry.progress || 0}%
              </span>
              {entry.progress >= 100 && <span className="completed-check">✓</span>}
            </div>
            <button className="expand-btn">
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="history-item-details">
            <div className="details-grid">
              {/* Dates Section */}
              <div className="detail-section">
                <h5 className="detail-section-title">📅 Dates</h5>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Created At</span>
                    <span className="detail-value">{formatFullDate(entry.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Planned Start Date</span>
                    <span className="detail-value">{formatDate(entry.startDate) || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Planned End Date</span>
                    <span className="detail-value">{formatDate(entry.endDate) || '—'}</span>
                  </div>
                </div>
                {(entry.executedStartDate || entry.executedEndDate) && (
                  <div className="detail-row" style={{ marginTop: '8px' }}>
                    <div className="detail-item">
                      <span className="detail-label" style={{ color: '#16a34a' }}>Executed Start Date</span>
                      <span className="detail-value" style={{ color: '#16a34a', fontWeight: 600 }}>
                        {formatDate(entry.executedStartDate) || '—'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label" style={{ color: '#16a34a' }}>Executed End Date</span>
                      <span className="detail-value" style={{ color: '#16a34a', fontWeight: 600 }}>
                        {formatDate(entry.executedEndDate) || '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* People Section */}
              <div className="detail-section">
                <h5 className="detail-section-title">👥 People</h5>
                <div className="detail-row">
                  {entry.ownerName && (
                    <div className="detail-item">
                      <span className="detail-label">Owner</span>
                      <span className="detail-value highlight">{entry.ownerName}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Created By</span>
                    <span className="detail-value">{entry.createdBy || '—'}</span>
                  </div>
                  {entry.updatedBy && entry.updatedBy !== entry.createdBy && (
                    <div className="detail-item">
                      <span className="detail-label">Updated By</span>
                      <span className="detail-value">{entry.updatedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage/Substage specific info */}
              {(entry.type === 'stage' || entry.type === 'substage') && (
                <div className="detail-section">
                  <h5 className="detail-section-title">⚙️ Details</h5>
                  <div className="detail-row">
                    {entry.parentStageName && (
                      <div className="detail-item">
                        <span className="detail-label">Parent Stage</span>
                        <span className="detail-value highlight">{entry.parentStageName}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Machine</span>
                      <span className="detail-value">{entry.machine || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{entry.duration ? `${entry.duration} days` : '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project specific info */}
              {entry.type === 'project' && (
                <div className="detail-section">
                  <h5 className="detail-section-title">🏢 Project Info</h5>
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Company</span>
                      <span className="detail-value">{entry.companyName || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Die Name</span>
                      <span className="detail-value">{entry.dieName || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Die Number</span>
                      <span className="detail-value">{entry.dieNumber || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Project Type</span>
                      <span className="detail-value">{entry.projectType || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className={`detail-value status-${entry.status?.toLowerCase()}`}>
                        {entry.status || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Section */}
              <div className="detail-section">
                <h5 className="detail-section-title">📊 Progress</h5>
                <div className="progress-display">
                  <div className="progress-number">
                    <span className="progress-big" style={{ color: entry.progress >= 100 ? '#16a34a' : typeConfig.color }}>
                      {entry.progress || 0}%
                    </span>
                    {entry.progress >= 100 && <span className="progress-complete-badge">Complete</span>}
                  </div>
                  <div className="progress-bar-large">
                    <div
                      className="progress-bar-fill-large"
                      style={{
                        width: `${entry.progress || 0}%`,
                        background: entry.progress >= 100 ? '#16a34a' : typeConfig.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* History Reference */}
              {entry.historyOf && (
                <div className="detail-section history-ref">
                  <span className="history-ref-badge">
                    📜 Historical version of #{entry.historyOf}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryItem
