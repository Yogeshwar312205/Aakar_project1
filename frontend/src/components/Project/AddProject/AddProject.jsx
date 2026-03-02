import React, { useEffect, useMemo, useState } from 'react'
import './AddProject.css'
import getTodayDate from '../../common/functions/getTodayDate'
import ProjectForm from '../common/ProjectForm'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { FiSave } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addProject } from '../../../features/projectSlice.js'
import AddStage from '../AddStage/AddStage'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { stageList } from '../../../features/stageSlice.js'
import { getAllEmployees } from '../../../features/employeeSlice.js'
import {
  fetchAllTemplates,
  fetchTemplateById,
  applyTemplate,
} from '../../../features/stageTemplateSlice.js'

const AddProject = () => {
  const { user } = useSelector((state) => state.auth)
  console.log(user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { employees } = useSelector((state) => state.employee)
  const { templates } = useSelector((state) => state.stageTemplates)

  useEffect(() => {
    dispatch(stageList())
    dispatch(getAllEmployees())
    dispatch(fetchAllTemplates())
  }, [dispatch])

  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateInfo, setTemplateInfo] = useState(null) // store full template for preview

  const [inputValues, setInputValues] = useState({
    projectNumber: '',
    companyName: '',
    dieName: '',
    dieNumber: '',
    projectStatus: '',
    startDate: getTodayDate(),
    endDate: '',
    projectType: '',
    progress: '',
    projectPOLink: '',
    projectDesignDocLink: '',
    projectCreatedBy: user.employeeId,
  })

  const [stages, setStages] = useState([
    {
      id: crypto.randomUUID(),
      projectNumber: inputValues.projectNumber,
      stageName: '',
      startDate: getTodayDate(),
      endDate: null,
      owner: '',
      machine: '',
      duration: '',
      progress: '',
      seqPrevStage: null,
      createdBy: user.employeeId,
      substages: [], // Support nested substages
    },
  ])

  // Handle template selection — show preview and populate stages with substages tree
  const handleTemplateSelect = async (e) => {
    const templateId = e.target.value
    setSelectedTemplateId(templateId)

    if (!templateId) {
      setTemplateInfo(null)
      return
    }

    try {
      const result = await dispatch(fetchTemplateById(templateId)).unwrap()
      const templateData = result.data
      const templateItems = templateData?.items || []
      setTemplateInfo(templateData)

      if (templateItems.length > 0) {
        // Build tree structure from flat template items
        const buildSubstagesTree = (parentId) => {
          return templateItems
            .filter((i) => i.parentItemId === parentId)
            .map((item) => ({
              id: crypto.randomUUID(),
              substageName: item.stageName || '',
              startDate: getTodayDate(),
              endDate: null,
              owner: '',
              machine: item.machine || '',
              duration: item.duration || '',
              progress: '',
              substages: buildSubstagesTree(item.itemId),
            }))
        }

        // Get top-level items (stages) and build their substage trees
        const topLevelItems = templateItems.filter((i) => !i.parentItemId)
        const childItems = templateItems.filter((i) => i.parentItemId)

        const newStages = topLevelItems.map((item) => ({
          id: crypto.randomUUID(),
          projectNumber: inputValues.projectNumber,
          stageName: item.stageName || '',
          startDate: getTodayDate(),
          endDate: null,
          owner: '',
          machine: item.machine || '',
          duration: item.duration || '',
          progress: '',
          seqPrevStage: null,
          createdBy: user.employeeId,
          substages: buildSubstagesTree(item.itemId),
        }))
        setStages(newStages)
        toast.success(
          `Template loaded! ${topLevelItems.length} stages + ${childItems.length} substages ready to customize.`
        )
      }
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
    }
  }

  const projectProgress = useMemo(() => {
    if (stages.length === 0) return 0
    const totalProgress = stages.reduce(
      (acc, stage) => acc + Number(stage.progress || 0),
      0
    )
    return totalProgress / stages.length
  }, [stages])

  useEffect(() => {
    setInputValues((prevValues) => ({
      ...prevValues,
      progress: projectProgress,
    }))
  }, [stages, projectProgress])

  const handleSave = (e) => {
    e.preventDefault()
    const projectData = {
      ...inputValues,
      stages,
    }

    const resetAndNavigate = () => {
      setInputValues({
        projectNumber: '',
        companyName: '',
        dieName: '',
        dieNumber: '',
        projectStatus: '',
        startDate: getTodayDate(),
        endDate: null,
        projectType: '',
        progress: '',
        projectPOLink: '',
        projectDesignDocLink: '',
        projectCreatedBy: user.employeeId,
      })
      setStages([
        {
          id: crypto.randomUUID(),
          projectNumber: '',
          stageName: '',
          startDate: getTodayDate(),
          endDate: null,
          owner: '',
          machine: '',
          duration: '',
          progress: '',
          seqPrevStage: null,
          createdBy: user.employeeId,
          substages: [],
        },
      ])
      navigate(-1)
    }

    console.log('Saving project data:', projectData)
    dispatch(addProject(projectData))
      .unwrap()
      .then(() => {
        // Template stages/substages are already included in projectData from handleTemplateSelect
        // No need to call applyTemplate - it would create duplicate substages
        toast.success('Project saved successfully!')
        resetAndNavigate()
      })
      .catch((err) => {
        console.error('Error saving project:', err)
        toast.error('Failed to save project!')
      })
  }

  // Build a simple preview tree of the template items
  const renderTemplatePreview = () => {
    if (!templateInfo || !templateInfo.items || templateInfo.items.length === 0) return null
    const items = templateInfo.items
    const topLevel = items.filter((i) => !i.parentItemId)

    const renderChildren = (parentId, depth) => {
      const children = items.filter((i) => i.parentItemId === parentId)
      if (children.length === 0) return null
      return (
        <ul style={{ margin: '4px 0', paddingLeft: `${20}px`, listStyle: 'none' }}>
          {children.map((child) => (
            <li key={child.itemId} style={{ fontSize: '13px', color: '#495057', padding: '2px 0' }}>
              <span style={{ color: '#adb5bd' }}>└</span> {child.stageName}
              {child.machine && <span style={{ color: '#868e96' }}> ({child.machine})</span>}
              {renderChildren(child.itemId, depth + 1)}
            </li>
          ))}
        </ul>
      )
    }

    return (
      <div
        style={{
          background: '#f0f7ff',
          border: '1px solid #b3d7ff',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '12px',
        }}
      >
        <strong style={{ color: '#0061A1', fontSize: '14px' }}>
          Template Preview — "{templateInfo.templateName}"
        </strong>
        <p style={{ fontSize: '12px', color: '#6c757d', margin: '4px 0 8px' }}>
          This template will auto-create the following tree structure of stages and substages:
        </p>
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'none' }}>
          {topLevel.map((item) => (
            <li key={item.itemId} style={{ fontSize: '14px', fontWeight: 600, color: '#212529', padding: '2px 0' }}>
              📁 {item.stageName}
              {item.machine && <span style={{ color: '#868e96', fontWeight: 400 }}> ({item.machine})</span>}
              {renderChildren(item.itemId, 1)}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <section className="addProject">
      <form className="addForm" onSubmit={handleSave}>
        <section className="add-employee-head flex justify-between mb-3 w-[100%]">
          <div className="flex items-center gap-3 justify-between">
            <FiArrowLeftCircle
              size={28}
              className="text-[#0061A1] hover:cursor-pointer"
              onClick={() => window.history.back()}
            />
            <div className="text-[17px]">
              <span>Dashboard / </span>
              <span className="font-semibold">Save project</span>
            </div>
          </div>
          <button
            className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
            type="submit"
          >
            <FiEdit size={20} className="edit-icon" />
            <span>Save details</span>
          </button>
        </section>
        <div className="formDiv">
          <ProjectForm
            inputValues={inputValues}
            setInputValues={setInputValues}
            action={'add'}
          />

          {/* Template Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '16px 0',
              padding: '12px 16px',
              background: '#f0f7ff',
              borderRadius: '8px',
              border: '1px solid #b3d7ff',
            }}
          >
            <label
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#0061A1',
                whiteSpace: 'nowrap',
              }}
            >
              Apply Template:
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                minWidth: '250px',
                background: '#fff',
              }}
            >
              <option value="">-- No Template (Manual) --</option>
              {templates &&
                templates.map((t) => (
                  <option key={t.templateId} value={t.templateId}>
                    {t.templateName}
                    {t.itemCount ? ` (${t.itemCount} items)` : ''}
                  </option>
                ))}
            </select>
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              Add stages and substages below. Use the tree structure to organize your project.
            </span>
          </div>

          {/* Template tree preview */}
          {renderTemplatePreview()}

          <AddStage
            stages={stages}
            setStages={setStages}
            setInputValues={setInputValues}
            action={'add'}
            stageList={stageList}
            employees={employees}
            useTreeView={true}
          />
        </div>
      </form>
    </section>
  )
}

export default AddProject
