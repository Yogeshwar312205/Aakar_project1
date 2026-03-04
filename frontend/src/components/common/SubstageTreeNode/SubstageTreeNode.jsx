import React, { useState } from 'react'
import { FiChevronDown, FiChevronRight, FiPlusCircle } from 'react-icons/fi'
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
  stageId,
  projectNumber,
  employeeAccess,
}) => {
  const [expanded, setExpanded] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [executedStartDate, setExecutedStartDate] = useState(null)
  const [executedEndDate, setExecutedEndDate] = useState(null)
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
    onToggleComplete && onToggleComplete(node.substageId, true, formattedStart, formattedEnd)
  }

  const handleDialogCancel = () => {
    setDialogOpen(false)
    setExecutedStartDate(null)
    setExecutedEndDate(null)
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
            <span className="tree-node-progress-text">{node.progress || 0}%</span>
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
