import React, { useState } from 'react'
import { FiChevronDown, FiChevronRight, FiPlusCircle } from 'react-icons/fi'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import LinearProgress from '@mui/joy/LinearProgress'
import { formatDate } from '../functions/formatDate.js'
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
  const hasChildren = node.children && node.children.length > 0
  const navigate = useNavigate()
  const isCompleted = !!node.isCompleted
  const allChildrenDone = hasChildren ? areAllChildrenCompleted(node) : isCompleted
  const canComplete = !hasChildren || areAllChildrenCompleted(node)

  const handleCheckboxChange = () => {
    if (hasChildren && !areAllChildrenCompleted(node)) {
      // Don't allow marking as complete if children are not done
      return
    }
    onToggleComplete && onToggleComplete(node.substageId, !isCompleted)
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
              {node.startDate ? formatDate(node.startDate) : '—'} → {node.endDate ? formatDate(node.endDate) : '—'}
            </span>
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
    </div>
  )
}

export default SubstageTreeNode
