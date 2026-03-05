import React, { useState, useEffect } from 'react'
import {
  FiChevronRight,
  FiChevronDown,
  FiClock,
  FiUser,
  FiSettings,
  FiCalendar,
  FiLayers,
} from 'react-icons/fi'
import { formatDate } from '../../common/functions/formatDate.js'

const TYPE_CONFIG = {
  project: {
    color: '#16a34a',
    bgColor: '#dcfce7',
    icon: '🏗️',
    label: 'Project',
    borderColor: '#86efac',
  },
  stage: {
    color: '#0061A1',
    bgColor: '#dbeafe',
    icon: '📋',
    label: 'Stage',
    borderColor: '#93c5fd',
  },
  substage: {
    color: '#6366f1',
    bgColor: '#e8e0ff',
    icon: '📎',
    label: 'Substage',
    borderColor: '#a5b4fc',
  },
}

const TreeNode = ({ type, node, isLast = false, expandAll, searchTerm, children }) => {
  const [isOpen, setIsOpen] = useState(type === 'project')
  const [showHistory, setShowHistory] = useState(false)

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.substage

  const history = node.history || []
  const hasChildren = React.Children.count(children) > 0
  const hasHistory = history.length > 0

  useEffect(() => {
    if (expandAll) {
      setIsOpen(true)
      setShowHistory(true)
    } else {
      setIsOpen(type === 'project')
      setShowHistory(false)
    }
  }, [expandAll, type])

  // Highlight search match
  useEffect(() => {
    if (searchTerm) setIsOpen(true)
  }, [searchTerm])

  const getName = () => {
    if (type === 'project')
      return `${node.companyName || ''} — ${node.dieName || ''}`
    if (type === 'stage') return node.stageName || ''
    return node.substageName || node.stageName || ''
  }

  const progress = node.progress || 0
  const isComplete = progress >= 100

  return (
    <div className={`tree-node tree-node-${type}`}>
      {/* Node Header */}
      <div
        className="tree-node-header"
        style={{ borderLeft: `3px solid ${config.color}` }}
      >
        <div className="tree-node-top">
          {/* Expand/Collapse for children */}
          <button
            className="tree-expand-btn"
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: config.color }}
          >
            {isOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          </button>

          {/* Type Badge */}
          <span
            className="tree-type-badge"
            style={{ background: config.bgColor, color: config.color }}
          >
            {config.icon} {config.label}
          </span>

          {/* Name */}
          <span className="tree-node-name">{getName()}</span>

          {/* Progress */}
          <span
            className="tree-node-progress"
            style={{ color: isComplete ? '#16a34a' : config.color }}
          >
            {isComplete && '✓ '}{progress}%
          </span>

          {/* History count badge */}
          {hasHistory && (
            <button
              className={`tree-history-badge ${showHistory ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setShowHistory(!showHistory)
              }}
              title={`${history.length} historical change(s)`}
            >
              <FiClock size={12} />
              <span>{history.length}</span>
            </button>
          )}
        </div>

        {/* Info Row */}
        <div className="tree-node-info">
          {type === 'project' && (
            <>
              <span className="tree-info-item">
                <strong>#{node.projectNumber}</strong>
              </span>
              {node.dieNumber && (
                <span className="tree-info-item">Die #: {node.dieNumber}</span>
              )}
              {node.projectType && (
                <span className="tree-info-item">Type: {node.projectType}</span>
              )}
              {node.projectStatus && (
                <span
                  className="tree-info-item"
                  style={{
                    color:
                      node.projectStatus === 'Completed'
                        ? '#16a34a'
                        : node.projectStatus === 'Overdue'
                        ? '#dc2626'
                        : '#2563eb',
                    fontWeight: 600,
                  }}
                >
                  {node.projectStatus}
                </span>
              )}
            </>
          )}
          {(type === 'stage' || type === 'substage') && (
            <>
              {node.ownerName && (
                <span className="tree-info-item">
                  <FiUser size={11} /> {node.ownerName}
                </span>
              )}
              {node.machine && (
                <span className="tree-info-item">
                  <FiSettings size={11} /> {node.machine}
                </span>
              )}
              {node.duration && (
                <span className="tree-info-item">
                  <FiClock size={11} /> {node.duration} days
                </span>
              )}
              {node.parentStageName && type === 'substage' && (
                <span className="tree-info-item">
                  <FiLayers size={11} /> {node.parentStageName}
                </span>
              )}
            </>
          )}
          {node.startDate && (
            <span className="tree-info-item">
              <FiCalendar size={11} /> {formatDate(node.startDate)} → {formatDate(node.endDate)}
            </span>
          )}
          {(node.executedStartDate || node.executedEndDate) && (
            <span className="tree-info-item" style={{ color: '#16a34a', fontWeight: 600 }}>
              Executed: {node.executedStartDate ? formatDate(node.executedStartDate) : '—'} → {node.executedEndDate ? formatDate(node.executedEndDate) : '—'}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="tree-progress-bar">
          <div
            className="tree-progress-fill"
            style={{
              width: `${progress}%`,
              background: isComplete ? '#16a34a' : config.color,
            }}
          />
        </div>
      </div>

      {/* History Versions (collapsible) */}
      {showHistory && hasHistory && (
        <div className="tree-history-section">
          <div className="tree-history-title">
            <FiClock size={13} />
            <span>Version History ({history.length} changes)</span>
          </div>
          <div className="tree-history-list">
            {history.map((version, idx) => (
              <HistoryVersion
                key={idx}
                version={version}
                type={type}
                config={config}
                isLast={idx === history.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Children (stages or substages) */}
      {isOpen && hasChildren && (
        <div className="tree-children">{children}</div>
      )}
    </div>
  )
}

const HistoryVersion = ({ version, type, config, isLast }) => {
  const [expanded, setExpanded] = useState(false)

  const formatTimestamp = (ts) => {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`history-version ${isLast ? 'last' : ''}`}>
      <div className="history-version-connector">
        <div className="hv-dot" style={{ background: config.color }} />
        {!isLast && <div className="hv-line" />}
      </div>
      <div
        className={`history-version-card ${expanded ? 'expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="hv-header">
          <div className="hv-left">
            <span className="hv-time">{formatTimestamp(version.timestamp)}</span>
            {version.updateReason && (
              <span className="hv-reason">
                📝 {version.updateReason}
              </span>
            )}
          </div>
          <div className="hv-right">
            <span
              className="hv-progress"
              style={{ color: (version.progress || 0) >= 100 ? '#16a34a' : config.color }}
            >
              {version.progress || 0}%
            </span>
            <button className="hv-expand">
              {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="hv-details">
            <div className="hv-details-grid">
              {version.startDate && (
                <div className="hv-detail">
                  <span className="hv-detail-label">Planned</span>
                  <span className="hv-detail-value">
                    {formatDate(version.startDate)} → {formatDate(version.endDate)}
                  </span>
                </div>
              )}
              {(version.executedStartDate || version.executedEndDate) && (
                <div className="hv-detail">
                  <span className="hv-detail-label" style={{ color: '#16a34a' }}>Executed</span>
                  <span className="hv-detail-value" style={{ color: '#16a34a' }}>
                    {version.executedStartDate ? formatDate(version.executedStartDate) : '—'} → {version.executedEndDate ? formatDate(version.executedEndDate) : '—'}
                  </span>
                </div>
              )}
              {(type === 'stage' || type === 'substage') && (
                <>
                  {version.ownerName && (
                    <div className="hv-detail">
                      <span className="hv-detail-label">Owner</span>
                      <span className="hv-detail-value">{version.ownerName}</span>
                    </div>
                  )}
                  {version.machine && (
                    <div className="hv-detail">
                      <span className="hv-detail-label">Machine</span>
                      <span className="hv-detail-value">{version.machine}</span>
                    </div>
                  )}
                  {version.duration && (
                    <div className="hv-detail">
                      <span className="hv-detail-label">Duration</span>
                      <span className="hv-detail-value">{version.duration} days</span>
                    </div>
                  )}
                </>
              )}
              {type === 'project' && (
                <>
                  {version.projectStatus && (
                    <div className="hv-detail">
                      <span className="hv-detail-label">Status</span>
                      <span className="hv-detail-value">{version.projectStatus}</span>
                    </div>
                  )}
                  {version.projectType && (
                    <div className="hv-detail">
                      <span className="hv-detail-label">Type</span>
                      <span className="hv-detail-value">{version.projectType}</span>
                    </div>
                  )}
                </>
              )}
              {version.createdByName && (
                <div className="hv-detail">
                  <span className="hv-detail-label">Changed By</span>
                  <span className="hv-detail-value">{version.createdByName || version.projectCreatedByName}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TreeNode
