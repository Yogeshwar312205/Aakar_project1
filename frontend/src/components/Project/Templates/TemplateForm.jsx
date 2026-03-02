import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeftCircle, FiEdit, FiPlusCircle } from 'react-icons/fi'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { RiDeleteBinLine } from 'react-icons/ri'
import { TextField } from '@mui/material'
import { v4 as uuid4 } from 'uuid'
import {
  createTemplate,
  fetchTemplateById,
  updateTemplate,
  resetTemplateState,
} from '../../../features/stageTemplateSlice.js'
import { toast } from 'react-toastify'
import './AllTemplates.css'

// Recursive component for rendering a single template item node
const TemplateItemNode = ({
  item,
  items,
  depth,
  onItemChange,
  onDeleteItem,
  onAddChild,
}) => {
  const [expanded, setExpanded] = useState(true)
  const children = items.filter((i) => i.parentTempId === item.tempId)
  const hasChildren = children.length > 0

  return (
    <div style={{ marginLeft: `${depth * 28}px`, marginBottom: '4px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          background: depth === 0 ? '#f8f9fa' : '#fefefe',
          border: '1px solid #e9ecef',
          borderRadius: '6px',
        }}
      >
        {/* Expand/collapse toggle */}
        <div
          style={{ cursor: 'pointer', minWidth: '20px', display: 'flex', alignItems: 'center' }}
          onClick={() => setExpanded(!expanded)}
        >
          {hasChildren ? (
            expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />
          ) : (
            <span style={{ color: '#adb5bd', fontSize: '14px' }}>•</span>
          )}
        </div>

        {/* Depth label */}
        <span
          style={{
            fontWeight: 600,
            color: depth === 0 ? '#0061A1' : '#6c757d',
            fontSize: '12px',
            minWidth: '60px',
          }}
        >
          {depth === 0 ? 'Stage' : `L${depth} Sub`}
        </span>

        <TextField
          label="Name"
          variant="outlined"
          value={item.stageName}
          onChange={(e) => onItemChange(item.tempId, 'stageName', e.target.value)}
          required
          size="small"
          sx={{ width: '220px' }}
        />
        <TextField
          label="Machine"
          variant="outlined"
          value={item.machine}
          onChange={(e) => onItemChange(item.tempId, 'machine', e.target.value)}
          size="small"
          sx={{ width: '150px' }}
        />
        <TextField
          label="Duration (Hrs)"
          variant="outlined"
          type="number"
          value={item.duration}
          onChange={(e) => onItemChange(item.tempId, 'duration', e.target.value)}
          size="small"
          sx={{ width: '120px' }}
        />

        {/* Add child substage button */}
        <button
          type="button"
          onClick={() => onAddChild(item.tempId)}
          title="Add child substage"
          style={{
            color: '#0061A1',
            background: 'none',
            border: '1px solid #0061A1',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          <FiPlusCircle size={14} />
          Sub
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDeleteItem(item.tempId)}
          title="Remove item"
          style={{
            color: '#dc3545',
            background: 'none',
            border: '1px solid transparent',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '4px',
          }}
        >
          <RiDeleteBinLine size={16} />
        </button>
      </div>

      {/* Render children recursively */}
      {expanded && hasChildren && (
        <div
          style={{
            borderLeft: '2px solid #dee2e6',
            marginLeft: '10px',
            paddingLeft: '4px',
            marginTop: '2px',
          }}
        >
          {children.map((child) => (
            <TemplateItemNode
              key={child.tempId}
              item={child}
              items={items}
              depth={depth + 1}
              onItemChange={onItemChange}
              onDeleteItem={onDeleteItem}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const TemplateForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const isEdit = !!params.id
  const { template, loading } = useSelector((state) => state.stageTemplates)

  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState([])

  useEffect(() => {
    if (isEdit && params.id) {
      dispatch(fetchTemplateById(params.id))
    }
    return () => {
      dispatch(resetTemplateState())
    }
  }, [dispatch, isEdit, params.id])

  useEffect(() => {
    if (isEdit && template && template.templateId) {
      setTemplateName(template.templateName || '')
      setDescription(template.description || '')
      setItems(
        (template.items || []).map((item) => ({
          ...item,
          tempId: item.itemId ? String(item.itemId) : uuid4(),
          parentTempId: item.parentItemId ? String(item.parentItemId) : null,
        }))
      )
    }
  }, [isEdit, template])

  // Add a top-level stage
  const handleAddStage = () => {
    setItems([
      ...items,
      {
        tempId: uuid4(),
        stageName: '',
        machine: '',
        duration: '',
        orderIndex: items.length,
        parentTempId: null,
      },
    ])
  }

  // Add a child substage under a given parent
  const handleAddChild = (parentTempId) => {
    setItems([
      ...items,
      {
        tempId: uuid4(),
        stageName: '',
        machine: '',
        duration: '',
        orderIndex: items.length,
        parentTempId: parentTempId,
      },
    ])
  }

  const handleItemChange = (tempId, field, value) => {
    setItems(
      items.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    )
  }

  // Delete item and all its descendants recursively
  const handleDeleteItem = (tempId) => {
    const collectDescendants = (parentId) => {
      const children = items.filter((i) => i.parentTempId === parentId)
      let ids = [parentId]
      children.forEach((child) => {
        ids = ids.concat(collectDescendants(child.tempId))
      })
      return ids
    }
    const idsToRemove = collectDescendants(tempId)
    setItems(items.filter((item) => !idsToRemove.includes(item.tempId)))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!templateName.trim()) {
      toast.error('Template name is required')
      return
    }

    // Build items payload with parentItemId mapped from parentTempId
    const payload = {
      templateName: templateName.trim(),
      description: description.trim(),
      items: items.map((item, index) => ({
        tempId: item.tempId,
        stageName: item.stageName,
        machine: item.machine,
        duration: item.duration ? Number(item.duration) : null,
        orderIndex: index,
        parentItemId: item.parentTempId || null,
      })),
    }

    try {
      if (isEdit) {
        await dispatch(
          updateTemplate({ id: params.id, data: payload })
        ).unwrap()
        toast.success('Template updated successfully!')
      } else {
        await dispatch(createTemplate(payload)).unwrap()
        toast.success('Template created successfully!')
      }
      navigate('/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    }
  }

  // Get top-level items (no parent)
  const rootItems = items.filter((item) => !item.parentTempId)

  return (
    <section className="all-templates">
      <form onSubmit={handleSave}>
        <section className="add-employee-head flex justify-between mb-3 w-[100%]">
          <div className="flex items-center gap-3 justify-between">
            <FiArrowLeftCircle
              size={28}
              className="text-[#0061A1] hover:cursor-pointer"
              onClick={() => window.history.back()}
            />
            <div className="text-[17px]">
              <span>Templates / </span>
              <span className="font-semibold">
                {isEdit ? 'Edit Template' : 'Create Template'}
              </span>
            </div>
          </div>
          <button
            className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
            type="submit"
            disabled={loading}
          >
            <FiEdit size={20} className="edit-icon" />
            <span>{loading ? 'Saving...' : 'Save Template'}</span>
          </button>
        </section>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
            Template Details
          </h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <TextField
              label="Template Name"
              variant="outlined"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              sx={{
                width: '300px',
                '& .MuiOutlinedInput-root': { height: '50px' },
                '& .MuiFormLabel-root': {
                  height: '50px',
                  lineHeight: '50px',
                  top: '-15px',
                },
              }}
            />
            <TextField
              label="Description"
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': { height: '50px' },
                '& .MuiFormLabel-root': {
                  height: '50px',
                  lineHeight: '50px',
                  top: '-15px',
                },
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ margin: 0 }}>Stages & Substages</h3>
            <button
              type="button"
              className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-2 hover:cursor-pointer"
              onClick={handleAddStage}
            >
              <FiPlusCircle
                style={{ marginRight: '8px', width: '20px', height: '20px' }}
              />
              Add Stage
            </button>
          </div>

          {/* Info banner */}
          <div
            style={{
              background: '#f0f7ff',
              border: '1px solid #b3d7ff',
              borderRadius: '6px',
              padding: '8px 14px',
              marginBottom: '12px',
              fontSize: '13px',
              color: '#0061A1',
            }}
          >
            💡 Click the <strong>+Sub</strong> button on any item to add a child substage under it. 
            You can nest substages infinitely deep.
          </div>

          {rootItems.length > 0 ? (
            <div>
              {rootItems.map((item) => (
                <TemplateItemNode
                  key={item.tempId}
                  item={item}
                  items={items}
                  depth={0}
                  onItemChange={handleItemChange}
                  onDeleteItem={handleDeleteItem}
                  onAddChild={handleAddChild}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
                color: '#868e96',
                background: '#f8f9fa',
                borderRadius: '6px',
                border: '1px dashed #dee2e6',
              }}
            >
              No stages added yet. Click "Add Stage" to get started, then use "+Sub" 
              to add substages under each stage.
            </div>
          )}
        </div>
      </form>
    </section>
  )
}

export default TemplateForm
