import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiPlusCircle } from 'react-icons/fi'
import { RiDeleteBinLine } from 'react-icons/ri'
import { FiEdit2 } from 'react-icons/fi'
import {
  fetchAllTemplates,
  deleteTemplate,
  resetTemplateState,
} from '../../../features/stageTemplateSlice.js'
import { toast } from 'react-toastify'
import './AllTemplates.css'

const AllTemplates = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { templates, loading, error } = useSelector(
    (state) => state.stageTemplates
  )

  useEffect(() => {
    dispatch(fetchAllTemplates())
    return () => {
      dispatch(resetTemplateState())
    }
  }, [dispatch])

  const handleDelete = (templateId, name) => {
    if (window.confirm(`Are you sure you want to delete template "${name}"?`)) {
      dispatch(deleteTemplate(templateId))
        .then(() => {
          toast.success('Template deleted successfully!')
        })
        .catch(() => {
          toast.error('Failed to delete template')
        })
    }
  }

  return (
    <div className="all-templates">
      <section className="templates-header">
        <div className="templates-title">
          <h2>Stage Templates</h2>
          <p className="templates-subtitle">
            Create reusable stage templates for quick project setup
          </p>
        </div>
        <button
          className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
          onClick={() => navigate('/addTemplate')}
        >
          <FiPlusCircle
            style={{ marginRight: '10px', width: '25px', height: '25px' }}
          />
          Create Template
        </button>
      </section>

      {loading && <p className="loading-message">Loading templates...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="templates-grid">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.templateId} className="template-card">
              <div className="template-card-header">
                <h3 className="template-name">{template.templateName}</h3>
                <span className="template-item-count">
                  {template.itemCount || 0} stages
                </span>
              </div>
              {template.description && (
                <p className="template-description">{template.description}</p>
              )}
              <div className="template-card-footer">
                <span className="template-created-by">
                  By: {template.createdByName || 'Unknown'}
                </span>
                <div className="template-actions">
                  <button
                    className="template-action-btn edit"
                    onClick={() =>
                      navigate(`/editTemplate/${template.templateId}`)
                    }
                    title="Edit template"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    className="template-action-btn delete"
                    onClick={() =>
                      handleDelete(template.templateId, template.templateName)
                    }
                    title="Delete template"
                  >
                    <RiDeleteBinLine size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="no-templates">
              <p>No templates created yet.</p>
              <p className="no-templates-hint">
                Create your first template to speed up project creation!
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default AllTemplates
