import React, { useCallback, useEffect, useState } from 'react'
import { RiDeleteBinLine } from 'react-icons/ri'
import { FiPlusCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { TextField, Autocomplete } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { v4 as uuid4 } from 'uuid'
import getTodayDate from '../../common/functions/getTodayDate'

const StageTreeNode = ({
  node,
  depth = 0,
  onUpdate,
  onDelete,
  onAddChild,
  stagesList = [],
  employeeList = [],
  isStage = true,
  action = 'add',
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isChanged, setIsChanged] = useState(false)
  const hasChildren = node.substages && node.substages.length > 0

  const handleChange = useCallback(
    (field, value) => {
      const updatedNode = { ...node }

      if (field === 'startDate' || field === 'endDate') {
        updatedNode[field] = value ? dayjs(value).format('YYYY-MM-DD') : ''
      } else if (field === 'progress') {
        const numericValue = Math.min(100, Math.max(0, Number(value)))
        updatedNode[field] = isNaN(numericValue) ? 0 : numericValue
      } else {
        updatedNode[field] = value
      }

      if (updatedNode.endDate && updatedNode.startDate && updatedNode.endDate < updatedNode.startDate) {
        updatedNode.endDate = ''
        updatedNode.duration = 0
      }

      setIsChanged(true)
      onUpdate(updatedNode)
    },
    [node, onUpdate]
  )

  const handleAddSubstage = () => {
    const newSubstage = {
      id: uuid4(),
      substageName: '',
      startDate: getTodayDate(),
      endDate: '',
      owner: '',
      machine: '',
      duration: '',
      progress: '',
      substages: [],
    }
    onAddChild(node.id, newSubstage)
    setIsExpanded(true)
  }

  const nameField = isStage ? 'stageName' : 'substageName'
  const nodeLabel = isStage ? 'Stage' : 'Substage'

  return (
    <div className="stage-tree-node" style={{ marginLeft: depth > 0 ? '24px' : '0' }}>
      {/* Node Header with expand/collapse and main info */}
      <div
        className="node-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: `1.5px solid ${isStage ? 'rgba(0, 97, 161, 0.5)' : 'rgba(125, 125, 125, 0.6)'}`,
          borderRadius: '10px',
          margin: '8px 0',
          background: isStage ? '#f8fbff' : '#fafafa',
          overflow: 'hidden',
        }}
      >
        {/* Row 1: Expand button, name, and actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 12px',
            borderBottom: '1px solid #eee',
            background: isStage ? '#e8f4fd' : '#f0f0f0',
          }}
        >
          {/* Expand/Collapse button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#0061A1',
            }}
          >
            {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
          </button>

          {/* Depth indicator */}
          <span
            style={{
              fontWeight: 700,
              color: isStage ? '#0061A1' : '#666',
              marginRight: '12px',
              fontSize: '14px',
              minWidth: '70px',
            }}
          >
            {nodeLabel}
          </span>

          {/* Name field */}
          <Autocomplete
            disablePortal
            freeSolo
            size="small"
            value={node[nameField] || ''}
            onInputChange={(event, newInputValue) => {
              handleChange(nameField, newInputValue)
            }}
            options={stagesList}
            sx={{ width: '200px', marginRight: '12px' }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={`${nodeLabel} Name`}
                size="small"
                required
                sx={{
                  '& .MuiOutlinedInput-root': { height: '40px' },
                  '& .MuiInputLabel-root': { fontSize: '14px' },
                }}
              />
            )}
          />

          {/* Add Substage button */}
          <button
            type="button"
            onClick={handleAddSubstage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: '1px solid #0061A1',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#0061A1',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              marginLeft: 'auto',
            }}
          >
            <FiPlusCircle size={14} />
            Add Substage
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: '#666',
              marginLeft: '8px',
            }}
          >
            <RiDeleteBinLine size={18} />
          </button>
        </div>

        {/* Row 2: Fields (collapsible) */}
        {isExpanded && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 16px',
              alignItems: 'center',
            }}
          >
            {/* Owner */}
            <Autocomplete
              disablePortal
              freeSolo
              size="small"
              value={node.owner || ''}
              onInputChange={(event, newInputValue) => {
                handleChange('owner', newInputValue)
              }}
              options={employeeList}
              sx={{ width: '180px' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Owner"
                  size="small"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': { height: '40px' },
                    '& .MuiInputLabel-root': { fontSize: '14px' },
                  }}
                />
              )}
            />

            {/* Start Date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={node.startDate ? dayjs(node.startDate) : null}
                onChange={(date) => handleChange('startDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    required: true,
                    sx: {
                      width: '150px',
                      '& .MuiOutlinedInput-root': { height: '40px' },
                      '& .MuiInputLabel-root': { fontSize: '14px' },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            {/* End Date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={node.endDate ? dayjs(node.endDate) : null}
                onChange={(date) => handleChange('endDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    required: true,
                    sx: {
                      width: '150px',
                      '& .MuiOutlinedInput-root': { height: '40px' },
                      '& .MuiInputLabel-root': { fontSize: '14px' },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            {/* Duration */}
            <TextField
              type="number"
              label="Duration (Hrs)"
              size="small"
              value={node.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              required
              sx={{
                width: '120px',
                '& .MuiOutlinedInput-root': { height: '40px' },
                '& .MuiInputLabel-root': { fontSize: '14px' },
              }}
            />

            {/* Machine */}
            <TextField
              label="Machine"
              size="small"
              value={node.machine || ''}
              onChange={(e) => handleChange('machine', e.target.value)}
              sx={{
                width: '120px',
                '& .MuiOutlinedInput-root': { height: '40px' },
                '& .MuiInputLabel-root': { fontSize: '14px' },
              }}
            />

            {/* Progress */}
            <TextField
              type="number"
              label="Progress (%)"
              size="small"
              value={node.progress || ''}
              onChange={(e) => handleChange('progress', e.target.value)}
              inputProps={{ min: 0, max: 100 }}
              sx={{
                width: '110px',
                '& .MuiOutlinedInput-root': { height: '40px' },
                '& .MuiInputLabel-root': { fontSize: '14px' },
              }}
            />

            {/* Update Reason (only shown in update mode when changed) */}
            {action === 'update' && isChanged && (
              <TextField
                label="Update Reason"
                size="small"
                value={node.updateReason || ''}
                onChange={(e) => handleChange('updateReason', e.target.value)}
                required
                sx={{
                  width: '180px',
                  '& .MuiOutlinedInput-root': { height: '40px' },
                  '& .MuiInputLabel-root': { fontSize: '14px' },
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Render Children (substages) */}
      {isExpanded && hasChildren && (
        <div
          style={{
            borderLeft: '2px solid #0061A1',
            marginLeft: '12px',
            paddingLeft: '8px',
          }}
        >
          {node.substages.map((child) => (
            <StageTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdate={(updatedChild) => {
                const updatedNode = { ...node }
                updatedNode.substages = updateNodeRecursive(updatedNode.substages, updatedChild)
                onUpdate(updatedNode)
              }}
              onDelete={(childId) => {
                const updatedNode = { ...node }
                updatedNode.substages = removeNodeRecursive(updatedNode.substages, childId)
                onUpdate(updatedNode)
              }}
              onAddChild={(parentId, newChild) => {
                const updatedNode = { ...node }
                updatedNode.substages = addChildRecursive(updatedNode.substages, parentId, newChild)
                onUpdate(updatedNode)
              }}
              stagesList={stagesList}
              employeeList={employeeList}
              isStage={false}
              action={action}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to update a node recursively
const updateNodeRecursive = (nodes, updatedNode) => {
  return nodes.map((node) => {
    if (node.id === updatedNode.id) {
      return { ...updatedNode, substages: updatedNode.substages || node.substages || [] }
    }
    return {
      ...node,
      substages: node.substages ? updateNodeRecursive(node.substages, updatedNode) : [],
    }
  })
}

// Helper function to remove a node recursively
const removeNodeRecursive = (nodes, nodeId) => {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      substages: node.substages ? removeNodeRecursive(node.substages, nodeId) : [],
    }))
}

// Helper function to add a child recursively
const addChildRecursive = (nodes, parentId, newChild) => {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        substages: [...(node.substages || []), newChild],
      }
    }
    return {
      ...node,
      substages: node.substages ? addChildRecursive(node.substages, parentId, newChild) : [],
    }
  })
}

export default StageTreeNode
