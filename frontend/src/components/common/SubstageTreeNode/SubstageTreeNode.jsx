import React, { useState } from 'react'
import { FiChevronDown, FiChevronRight, FiPlusCircle, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import LinearProgress from '@mui/joy/LinearProgress'
import { formatDate } from '../functions/formatDate.js'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import './SubstageTreeNode.css'

// Utility: Build tree from flat list using parentSubstageId
export const buildSubstageTree = (flatList) => {
  const map = {}
  const roots = []

  // First pass: create map
  flatList.forEach((item) => {
    map[item.substageId] = { ...item, children: [] }
  })

  // Second pass: link parents
  flatList.forEach((item) => {
    if (item.parentSubstageId && map[item.parentSubstageId]) {
      map[item.parentSubstageId].children.push(map[item.substageId])
    } else {
      roots.push(map[item.substageId])
    }
  })

  return roots
}

// Check if all children are completed (recursively)
const areAllChildrenCompleted = (node) => {
  if (!node.children || node.children.length === 0) {
    return !!node.isCompleted
  }
  return node.children.every((child) => areAllChildrenCompleted(child))
}

const SubstageTreeNode = ({
  node,
  depth = 0,
  onAddChild,
  onDelete,
  onToggleComplete,
  onProgressEdit,
  stageId,
  projectNumber,
  employeeAccess,
}) => {
  const [expanded, setExpanded] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [executedStartDate, setExecutedStartDate] = useState(null)
  const [executedEndDate, setExecutedEndDate] = useState(null)
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressValue, setProgressValue] = useState(node.progress || 0)
  const [dialogSource, setDialogSource] = useState('checkbox') // 'checkbox' or 'progressEdit'
  const hasChildren = node.children && node.children.length > 0
  const navigate = useNavigate()
  const isCompleted = !!node.isCompleted
  const allChildrenDone = hasChildren ? areAllChildrenCompleted(node) : isCompleted
  const canComplete = !hasChildren || areAllChildrenCompleted(node)

  const handleCheckboxChange = () => {
    if (hasChildren && !areAllChildrenCompleted(node)) {
      return
    }
    if (!isCompleted) {
      // Opening: show dialog to get executed dates
      setExecutedStartDate(dayjs())
      setExecutedEndDate(dayjs())
      setDialogSource('checkbox')
      setDialogOpen(true)
    } else {
      // Unchecking: clear executed dates
      onToggleComplete && onToggleComplete(node.substageId, false, null, null)
    }
  }

  const handleDialogConfirm = () => {
    const formattedStart = executedStartDate
      ? dayjs(executedStartDate).format('YYYY-MM-DD')
      : null
    const formattedEnd = executedEndDate
      ? dayjs(executedEndDate).format('YYYY-MM-DD')
      : null
    setDialogOpen(false)

    if (dialogSource === 'checkbox') {
      onToggleComplete && onToggleComplete(node.substageId, true, formattedStart, formattedEnd)
    } else if (dialogSource === 'progressEdit') {
      // Progress edit to 100% — call onProgressEdit with executed dates
      onProgressEdit && onProgressEdit(node.substageId, 100, formattedStart, formattedEnd)
    }
  }

  const handleDialogCancel = () => {
    setDialogOpen(false)
    setExecutedStartDate(null)
    setExecutedEndDate(null)
  }

  const handleProgressEditStart = (e) => {
    e.stopPropagation()
    setProgressValue(node.progress || 0)
    setEditingProgress(true)
  }

  const handleProgressSave = (e) => {
    e.stopPropagation()
    const val = Math.max(0, Math.min(100, Math.round(Number(progressValue))))
    setEditingProgress(false)

    if (val >= 100) {
      // Block 100% if children aren't all completed
      if (hasChildren && !areAllChildrenCompleted(node)) {
        return
      }
      // Show executed dates dialog before saving 100%
      setExecutedStartDate(dayjs())
      setExecutedEndDate(dayjs())
      setDialogSource('progressEdit')
      setDialogOpen(true)
      return
    }

    if (onProgressEdit && val !== (node.progress || 0)) {
      onProgressEdit(node.substageId, val)
    }
  }

  const handleProgressCancel = (e) => {
    e.stopPropagation()
    setEditingProgress(false)
    setProgressValue(node.progress || 0)
  }

  const handleProgressKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleProgressSave(e)
    } else if (e.key === 'Escape') {
      handleProgressCancel(e)
    }
  }


  return (
    <div className="substage-tree-node" style={{ marginLeft: `${depth * 28}px` }}>
      <div className={`tree-node-header ${isCompleted ? 'completed' : ''}`}>
        {/* Completion checkbox */}
        <div className="tree-node-checkbox" title={
          hasChildren && !canComplete
            ? 'Complete all child substages first'
            : isCompleted ? 'Mark as incomplete' : 'Mark as complete'
        }>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleCheckboxChange}
            disabled={hasChildren && !canComplete}
            style={{
              width: '18px',
              height: '18px',
              cursor: hasChildren && !canComplete ? 'not-allowed' : 'pointer',
              accentColor: '#0061A1',
            }}
          />
        </div>

        <div className="tree-node-toggle" onClick={() => setExpanded(!expanded)}>
          {hasChildren ? (
            expanded ? (
              <FiChevronDown size={18} />
            ) : (
              <FiChevronRight size={18} />
            )
          ) : (
            <span className="tree-node-dot">•</span>
          )}
        </div>

        <div className="tree-node-content">
          <div className="tree-node-info">
            <span className={`tree-node-name ${isCompleted ? 'name-completed' : ''}`}>
              {node.stageName || node.substageName}
            </span>
            <span className="tree-node-meta">
              Owner: {node.owner || '—'} | Machine: {node.machine || '—'} | Duration: {node.duration || '—'}hrs
            </span>
            <span className="tree-node-dates">
              <strong>Planned:</strong> {node.startDate ? formatDate(node.startDate) : '—'} → {node.endDate ? formatDate(node.endDate) : '—'}
            </span>
            {isCompleted && (node.executedStartDate || node.executedEndDate) && (
              <span className="tree-node-dates" style={{ color: '#16a34a' }}>
                <strong>Executed:</strong> {node.executedStartDate ? formatDate(node.executedStartDate) : '—'} → {node.executedEndDate ? formatDate(node.executedEndDate) : '—'}
              </span>
            )}
          </div>

          <div className="tree-node-progress">
            <LinearProgress
              determinate
              value={node.progress || 0}
              sx={{ width: '100px', height: '6px' }}
            />
            {editingProgress ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  onKeyDown={handleProgressKeyDown}
                  autoFocus
                  style={{
                    width: '55px',
                    padding: '2px 6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: '2px solid #0061A1',
                    borderRadius: '6px',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>%</span>
                <button
                  onClick={handleProgressSave}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Save"
                >
                  <FiCheck size={14} />
                </button>
                <button
                  onClick={handleProgressCancel}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Cancel"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="tree-node-progress-text">{node.progress || 0}%</span>
                {onProgressEdit && (
                  <button
                    onClick={handleProgressEditStart}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                      transition: 'color 0.2s',
                    }}
                    title="Edit progress"
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#0061A1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#6c757d' }}
                  >
                    <FiEdit2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Completion status badge */}
          <div className="tree-node-status">
            {isCompleted ? (
              <span className="status-badge completed">✓ Done</span>
            ) : hasChildren ? (
              <span className="status-badge pending">
                {node.children.filter(c => c.isCompleted).length}/{node.children.length} done
              </span>
            ) : (
              <span className="status-badge pending">Pending</span>
            )}
          </div>

          <div className="tree-node-actions">
            {employeeAccess && (
              <button
                className="tree-action-btn add"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddChild && onAddChild(node.substageId, stageId, projectNumber)
                }}
                title="Add child substage"
              >
                <FiPlusCircle size={16} />
              </button>
            )}
            {employeeAccess && (
              <button
                className="tree-action-btn delete"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete && onDelete(node.substageId)
                }}
                title="Delete substage"
              >
                <RiDeleteBinLine size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="tree-node-children">
          {node.children.map((child) => (
            <SubstageTreeNode
              key={child.substageId}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onProgressEdit={onProgressEdit}
              stageId={stageId}
              projectNumber={projectNumber}
              employeeAccess={employeeAccess}
            />
          ))}
        </div>
      )}

      {/* Executed Date Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#0061A1' }}>
          Enter Executed Dates
        </DialogTitle>
        <DialogContent>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
            Please enter the actual start and end dates for <strong>{node.stageName || node.substageName}</strong>
          </p>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <DatePicker
                label="Executed Start Date*"
                value={executedStartDate}
                onChange={(val) => setExecutedStartDate(val)}
                sx={{ flex: 1 }}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
              <DatePicker
                label="Executed End Date*"
                value={executedEndDate}
                onChange={(val) => setExecutedEndDate(val)}
                sx={{ flex: 1 }}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleDialogCancel} sx={{ color: '#6c757d' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDialogConfirm}
            variant="contained"
            disabled={!executedStartDate || !executedEndDate}
            sx={{ backgroundColor: '#0061A1', '&:hover': { backgroundColor: '#004d80' } }}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SubstageTreeNode

