import React, { useState, useMemo, useCallback } from 'react'
import { FiClock, FiRefreshCw, FiSearch, FiX, FiDownload } from 'react-icons/fi'
import TreeNode from './TreeNode.jsx'
import './ProjectHistory.css'

const ProjectHistory = ({ history = {}, onRefresh, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandAll, setExpandAll] = useState(false)

  const { project = {}, stages = [] } = history

  // Count total history entries
  const totalHistoryCount = useMemo(() => {
    let count = (project.history || []).length
    stages.forEach((stage) => {
      count += (stage.history || []).length
      const countSubstages = (subs) => {
        (subs || []).forEach((ss) => {
          count += (ss.history || []).length
          countSubstages(ss.children)
        })
      }
      countSubstages(stage.substages)
    })
    return count
  }, [project, stages])

  // Filter tree by search term
  const matchesSearch = useCallback(
    (node, type) => {
      if (!searchTerm) return true
      const s = searchTerm.toLowerCase()
      const name =
        type === 'project'
          ? `${node.companyName || ''} ${node.dieName || ''}`
          : type === 'stage'
          ? node.stageName || ''
          : node.substageName || node.stageName || ''
      return (
        name.toLowerCase().includes(s) ||
        (node.ownerName || '').toLowerCase().includes(s) ||
        (node.machine || '').toLowerCase().includes(s) ||
        (node.updateReason || '').toLowerCase().includes(s)
      )
    },
    [searchTerm]
  )

  const stageMatchesSearch = useCallback(
    (stage) => {
      if (matchesSearch(stage, 'stage')) return true
      const checkSubs = (subs) =>
        (subs || []).some(
          (ss) => matchesSearch(ss, 'substage') || checkSubs(ss.children)
        )
      return checkSubs(stage.substages)
    },
    [matchesSearch]
  )

  const filteredStages = useMemo(() => {
    if (!searchTerm) return stages
    return stages.filter(stageMatchesSearch)
  }, [stages, searchTerm, stageMatchesSearch])

  // Export all data as CSV
  const handleExport = useCallback(() => {
    const rows = [
      ['Level', 'Name', 'Owner', 'Machine', 'Duration', 'Progress', 'Planned Start', 'Planned End', 'Executed Start', 'Executed End', 'History Count'].join(',')
    ]

    // Project
    rows.push(
      ['Project', `"${project.companyName || ''} - ${project.dieName || ''}"`, '', '', '', project.progress || 0, project.startDate || '', project.endDate || '', project.executedStartDate || '', project.executedEndDate || '', (project.history || []).length].join(',')
    )

    stages.forEach((stage) => {
      rows.push(
        ['Stage', `"${stage.stageName || ''}"`, `"${stage.ownerName || ''}"`, `"${stage.machine || ''}"`, stage.duration || '', stage.progress || 0, stage.startDate || '', stage.endDate || '', stage.executedStartDate || '', stage.executedEndDate || '', (stage.history || []).length].join(',')
      )
      const exportSubs = (subs, depth) => {
        (subs || []).forEach((ss) => {
          const prefix = '  '.repeat(depth)
          rows.push(
            [`${prefix}Substage`, `"${ss.substageName || ss.stageName || ''}"`, `"${ss.ownerName || ''}"`, `"${ss.machine || ''}"`, ss.duration || '', ss.progress || 0, ss.startDate || '', ss.endDate || '', ss.executedStartDate || '', ss.executedEndDate || '', (ss.history || []).length].join(',')
          )
          exportSubs(ss.children, depth + 1)
        })
      }
      exportSubs(stage.substages, 1)
    })

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-tree-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [project, stages])

  const hasData = project.projectNumber || stages.length > 0

  return (
    <div className="project-history">
      {/* Header */}
      <div className="history-header">
        <div className="history-title">
          <FiClock size={20} />
          <h3>Project History</h3>
          <span className="history-count">{totalHistoryCount} changes</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={`tree-toggle-btn ${expandAll ? 'active' : ''}`}
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
          <button className="export-btn" onClick={handleExport} title="Export CSV">
            <FiDownload size={16} />
          </button>
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
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: '16px' }}>
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search stages, substages, owners, machines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Tree */}
      <div className="history-tree">
        {loading ? (
          <div className="history-loading">
            <div className="loading-spinner" />
            <p>Loading history...</p>
          </div>
        ) : hasData ? (
          <>
            {/* Project Node */}
            {project.projectNumber && (
              <TreeNode
                type="project"
                node={project}
                expandAll={expandAll}
                searchTerm={searchTerm}
              >
                {filteredStages.map((stage, idx) => (
                  <TreeNode
                    key={stage.stageId}
                    type="stage"
                    node={stage}
                    isLast={idx === filteredStages.length - 1}
                    expandAll={expandAll}
                    searchTerm={searchTerm}
                  >
                    {(stage.substages || []).map((ss, ssIdx) => (
                      <SubstageTree
                        key={ss.substageId}
                        substage={ss}
                        isLast={ssIdx === (stage.substages || []).length - 1}
                        expandAll={expandAll}
                        searchTerm={searchTerm}
                      />
                    ))}
                  </TreeNode>
                ))}
              </TreeNode>
            )}
          </>
        ) : (
          <div className="history-empty">
            <FiClock size={48} />
            <h4>No History Found</h4>
            <p>Changes to the project, stages, and substages will appear here.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      {hasData && (
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-value">{stages.length}</span>
            <span className="stat-label">Stages</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {stages.reduce((acc, s) => {
                const countSubs = (subs) =>
                  (subs || []).reduce((a, ss) => a + 1 + countSubs(ss.children), 0)
                return acc + countSubs(s.substages)
              }, 0)}
            </span>
            <span className="stat-label">Substages</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{totalHistoryCount}</span>
            <span className="stat-label">Total Changes</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Recursive substage renderer
const SubstageTree = ({ substage, isLast, expandAll, searchTerm }) => (
  <TreeNode
    type="substage"
    node={substage}
    isLast={isLast}
    expandAll={expandAll}
    searchTerm={searchTerm}
  >
    {(substage.children || []).map((child, idx) => (
      <SubstageTree
        key={child.substageId}
        substage={child}
        isLast={idx === (substage.children || []).length - 1}
        expandAll={expandAll}
        searchTerm={searchTerm}
      />
    ))}
  </TreeNode>
)

export default ProjectHistory
