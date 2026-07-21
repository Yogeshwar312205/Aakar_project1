import React, { useState, useEffect, useMemo } from 'react'
import './../AddProject/AddProject.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProjectById,
  fetchProjects,
  resetProjectState,
  updateProject,
} from '../../../features/projectSlice.js'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../common/ProjectForm.jsx'
import { FiArrowLeftCircle, FiSave, FiPlusCircle, FiTrash2 } from 'react-icons/fi'
import {
  fetchActiveStagesByProjectNumber,
  resetStageState,
  deleteStage,
  addStage,
} from '../../../features/stageSlice.js'
import {
  getActiveSubStagesByStageId,
  addSubStage,
  deleteSubStage,
  resetSubstageState,
} from '../../../features/subStageSlice.js'
import { getAllEmployees } from '../../../features/employeeSlice.js'
import LinearProgress from '@mui/joy/LinearProgress'
import { formatDate } from '../../common/functions/formatDate.js'
import { toast } from 'react-toastify'
import SubstageTreeNode, {
  buildSubstageTree,
} from '../../common/SubstageTreeNode/SubstageTreeNode.jsx'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { differenceInDays } from 'date-fns'
import { getProjectManagementAccess } from '../../../utils/projectAccess.js'

const UpdateProject = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  )
  const projectAccess = getProjectManagementAccess(employeeAccess)

  const params = useParams()
  const pNo = params.id
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { project = {}, loading: projectLoading } = useSelector(
    (state) => state.projects
  )
  const { activeStages = [], loading: stageLoading } = useSelector(
    (state) => state.stages
  )
  const { activeSubStages = [] } = useSelector((state) => state.substages)
  const { employees } = useSelector((state) => state.employee)

  const [inputValues, setInputValues] = useState({
    projectNumber: '',
    companyName: '',
    dieName: '',
    dieNumber: '',
    projectStatus: '',
    startDate: '',
    endDate: '',
    projectType: '',
    projectPOLink: '',
    progress: 0,
    projectDesignDocLink: '',
    updateReason: '',
  })

  // Stage management state
  const [selectedStageId, setSelectedStageId] = useState(null)
  const [showAddStage, setShowAddStage] = useState(false)
  const [newStage, setNewStage] = useState({
    stageName: '',
    machine: '',
    duration: '',
    owner: '',
    startDate: '',
    endDate: '',
    progress: 0,
  })

  // Pending stages/substages (not yet saved to DB)
  const [pendingStages, setPendingStages] = useState([])
  const [pendingSubstages, setPendingSubstages] = useState([])
  const [deletedStageIds, setDeletedStageIds] = useState([])
  const [deletedSubstageIds, setDeletedSubstageIds] = useState([])

  // Substage management state
  const [showAddSubstage, setShowAddSubstage] = useState(false)
  const [addSubstageParentId, setAddSubstageParentId] = useState(null)
  const [newSubstage, setNewSubstage] = useState({
    substageName: '',
    machine: '',
    duration: '',
    owner: '',
    startDate: '',
    endDate: '',
    progress: 0,
  })

  const navigate = useNavigate()

  useEffect(() => {
    if (pNo) {
      dispatch(fetchProjectById(pNo))
      dispatch(fetchActiveStagesByProjectNumber(pNo))
      dispatch(fetchProjects())
      dispatch(getAllEmployees())
    }
    return () => {
      dispatch(resetProjectState())
      dispatch(resetStageState())
      dispatch(resetSubstageState())
    }
  }, [dispatch, pNo])

  // Load substages when a stage is selected
  useEffect(() => {
    if (selectedStageId) {
      dispatch(getActiveSubStagesByStageId(selectedStageId))
    }
  }, [dispatch, selectedStageId])

  // Calculate project progress from stages (excluding deleted ones)
  const projectProgress = useMemo(() => {
    const validStages = activeStages.filter(s => !deletedStageIds.includes(s.stageId))
    const allStages = [...validStages, ...pendingStages]
    if (allStages.length === 0) return project?.progress || 0
    const totalProgress = allStages.reduce(
      (acc, s) => acc + Number(s.progress || 0),
      0
    )
    return Math.round(totalProgress / allStages.length)
  }, [activeStages, pendingStages, deletedStageIds, project])

  useEffect(() => {
    if (project && Object.keys(project).length > 0) {
      setInputValues({
        ...project,
        progress: projectProgress,
      })
    }
  }, [project, projectProgress])

  const employeeList = employees?.map(
    (emp) => `${emp.employee.employeeName}(${emp.employee.customEmployeeId})`
  ) || []

  // Merge active stages with pending stages (filter out deleted ones)
  const mergedStages = useMemo(() => {
    const existingStages = activeStages.filter(s => !deletedStageIds.includes(s.stageId))
    return [...existingStages, ...pendingStages]
  }, [activeStages, pendingStages, deletedStageIds])

  // Merge active substages with pending substages for selected stage (filter out deleted ones)
  const mergedSubstages = useMemo(() => {
    if (!selectedStageId) return []
    const existingSubs = activeSubStages
      .filter(s => s.stageId === selectedStageId && !deletedSubstageIds.includes(s.substageId))
    const pendingSubs = pendingSubstages.filter(s => s.stageId === selectedStageId)
    return [...existingSubs, ...pendingSubs]
  }, [activeSubStages, pendingSubstages, selectedStageId, deletedSubstageIds])

  // Build substage tree for selected stage
  const substageTree = buildSubstageTree(mergedSubstages || [])

  // Get selected stage details
  const selectedStage = mergedStages.find((s) => s.stageId === selectedStageId || s.tempId === selectedStageId)

  // Helper function to handle stage date/duration changes
  const handleNewStageChange = (field, value) => {
    const updated = { ...newStage, [field]: value }

    if (field === 'startDate' || field === 'endDate') {
      // Auto-calculate duration when both dates are available
      if (updated.startDate && updated.endDate) {
        const start = new Date(updated.startDate)
        const end = new Date(updated.endDate)
        if (end >= start) {
          updated.duration = differenceInDays(end, start)
        }
      }
    } else if (field === 'duration') {
      // Auto-calculate end date when duration and start date are available
      const durationInDays = parseInt(value, 10)
      if (!isNaN(durationInDays) && durationInDays >= 0 && updated.startDate) {
        const startDate = new Date(updated.startDate)
        if (!isNaN(startDate.getTime())) {
          const newEndDate = new Date(startDate)
          newEndDate.setDate(startDate.getDate() + durationInDays)
          updated.endDate = newEndDate.toISOString().split('T')[0]
        }
      }
    }

    setNewStage(updated)
  }

  // Helper function to handle substage date/duration changes
  const handleNewSubstageChange = (field, value) => {
    const updated = { ...newSubstage, [field]: value }

    if (field === 'startDate' || field === 'endDate') {
      // Auto-calculate duration when both dates are available
      if (updated.startDate && updated.endDate) {
        const start = new Date(updated.startDate)
        const end = new Date(updated.endDate)
        if (end >= start) {
          updated.duration = differenceInDays(end, start)
        }
      }
    } else if (field === 'duration') {
      // Auto-calculate end date when duration and start date are available
      const durationInDays = parseInt(value, 10)
      if (!isNaN(durationInDays) && durationInDays >= 0 && updated.startDate) {
        const startDate = new Date(updated.startDate)
        if (!isNaN(startDate.getTime())) {
          const newEndDate = new Date(startDate)
          newEndDate.setDate(startDate.getDate() + durationInDays)
          updated.endDate = newEndDate.toISOString().split('T')[0]
        }
      }
    }

    setNewSubstage(updated)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!inputValues.updateReason) {
      toast.error('Please provide a reason for updating')
      return
    }

    try {
      // 1. Delete stages marked for deletion
      if (projectAccess.stage.delete) {
        for (const stageId of deletedStageIds) {
          try {
            await dispatch(deleteStage(stageId)).unwrap()
          } catch (error) {
            // If stage doesn't exist (404), skip it silently
            if (error?.response?.status === 404 || error?.code === 'ERR_BAD_REQUEST') {
              console.log(`Stage ${stageId} not found in database, skipping deletion`)
              continue
            }
            // For other errors, throw to stop the process
            throw error
          }
        }
      }

      // 2. Delete substages marked for deletion
      if (projectAccess.substage.delete) {
        // Filter out tempIds (they start with 'temp-' or 'temp_') and ensure only real DB IDs are deleted
        const validSubstageIds = deletedSubstageIds.filter(id => {
          const idStr = String(id)
          // Skip if it's a tempId
          if (idStr.startsWith('temp-') || idStr.startsWith('temp_')) {
            console.log(`Skipping tempId: ${id}`)
            return false
          }
          // Skip if it exists in pendingSubstages
          if (pendingSubstages.some(s => s.tempId === id || s.substageId === id)) {
            console.log(`Skipping pending substage: ${id}`)
            return false
          }
          return true
        })

        for (const substageId of validSubstageIds) {
          try {
            await dispatch(deleteSubStage(substageId)).unwrap()
          } catch (error) {
            // If substage doesn't exist (404), skip it silently
            if (error?.response?.status === 404 || error?.code === 'ERR_BAD_REQUEST') {
              console.log(`Substage ${substageId} not found in database, skipping deletion`)
              continue
            }
            // For other errors, throw to stop the process
            throw error
          }
        }
      }

      // 3. Save pending stages to database and map tempIds to real IDs
      const stageIdMapping = {} // Map tempId to real stageId
      if (projectAccess.stage.add) {
        for (const stage of pendingStages) {
          const stageData = {
            projectNumber: pNo,
            stageName: stage.stageName,
            startDate: stage.startDate || new Date().toISOString().split('T')[0],
            endDate: stage.endDate || new Date().toISOString().split('T')[0],
            owner: stage.owner || null,
            machine: stage.machine || '',
            duration: stage.duration || 0,
            seqPrevStage:
              activeStages.length > 0 ? activeStages[activeStages.length - 1].stageId : null,
            createdBy: user.employeeId,
            progress: stage.progress || 0,
          }
          const result = await dispatch(addStage(stageData)).unwrap()
          
          // Map tempId to real database stageId
          // Backend returns insertId from the MySQL INSERT operation
          const newStageId = result?.insertId || result?.stageId || result?.id
          if (stage.tempId && newStageId) {
            stageIdMapping[stage.tempId] = newStageId
            console.log(`✅ Mapped tempId ${stage.tempId} to real stageId ${newStageId}`)
          } else {
            console.warn('Warning: Could not map tempId for stage:', stage, 'Result:', result)
          }
        }
      }

      // 4. Save pending substages to database with corrected stageIds
      if (projectAccess.substage.add && pendingSubstages.length > 0) {
        for (const substage of pendingSubstages) {
          const ownerString =
            substage.owner ||
            `${user.employeeName || 'User'}(${user.customEmployeeId || user.employeeId})`

          // If substage's stageId is a tempId, replace it with the real stageId
          let realStageId = substage.stageId
          const stageIdStr = String(substage.stageId)
          if ((stageIdStr.startsWith('temp-') || stageIdStr.startsWith('temp_')) && stageIdMapping[substage.stageId]) {
            realStageId = stageIdMapping[substage.stageId]
            console.log(`✅ Replacing substage's tempId ${substage.stageId} with real stageId ${realStageId}`)
          } else if (stageIdStr.startsWith('temp-') || stageIdStr.startsWith('temp_')) {
            // TempId exists but no mapping found - log error
            console.error(`❌ ERROR: No mapping found for tempId ${substage.stageId}. Available mappings:`, stageIdMapping)
            throw new Error(`Cannot save substage: Stage tempId ${substage.stageId} has no mapping to real stageId`)
          }

          // Similarly, handle parentSubstageId if it's a tempId (for nested substages)
          let realParentSubstageId = substage.parentSubstageId
          if (realParentSubstageId) {
            const parentIdStr = String(realParentSubstageId)
            if (parentIdStr.startsWith('temp-') || parentIdStr.startsWith('temp_')) {
              // This would require tracking substage tempId mappings as well
              // For now, set to null if parent is a tempId (rare edge case)
              console.warn(`⚠️ Parent substage has tempId ${realParentSubstageId}, setting to null`)
              realParentSubstageId = null
            }
          }

          const substageData = {
            stageId: realStageId, // Use mapped real stageId
            parentSubstageId: realParentSubstageId || null,
            substagename: substage.substageName,
            startDate: substage.startDate || new Date().toISOString().split('T')[0],
            endDate: substage.endDate || new Date().toISOString().split('T')[0],
            owner: ownerString,
            machine: substage.machine || '',
            duration: substage.duration || 0,
            createdBy: user.employeeId,
            progress: substage.progress || 0,
            projectNumber: pNo,
            seqPrevStage: null,
          }
          await dispatch(addSubStage(substageData)).unwrap()
        }
        
        // Clear pending substages after successful save
        setPendingSubstages([])
        
        // Refresh substages to get updated parent completion status from backend
        // The backend automatically marks parents as incomplete when children are added
        if (selectedStageId) {
          // If selectedStageId is a tempId, get the real stageId from mapping
          let realSelectedStageId = selectedStageId
          const selectedIdStr = String(selectedStageId)
          if ((selectedIdStr.startsWith('temp-') || selectedIdStr.startsWith('temp_')) && stageIdMapping[selectedStageId]) {
            realSelectedStageId = stageIdMapping[selectedStageId]
            console.log(`Using mapped real stageId ${realSelectedStageId} for refresh instead of ${selectedStageId}`)
          }
          
          // Only refresh if we have a valid real stageId (not a tempId)
          const realIdStr = String(realSelectedStageId)
          if (!realIdStr.startsWith('temp-') && !realIdStr.startsWith('temp_')) {
            await dispatch(getActiveSubStagesByStageId(realSelectedStageId)).unwrap()
          } else {
            console.log(`Skipping substage refresh for tempId ${selectedStageId} - will be refreshed on next page load`)
          }
        }
      }

      // 5. Refresh stages and project to get updated progress from backend
      await dispatch(fetchActiveStagesByProjectNumber(pNo))

      // 6. Update project
      if (projectAccess.project.update) {
        await dispatch(
          updateProject({
            id: pNo,
            data: {
              ...inputValues,
              progress: projectProgress,
            },
          })
        ).unwrap()
      }

      toast.success('Project updated successfully!')
      navigate(-1)
    } catch (err) {
      console.error('Error updating project:', err)
      toast.error('Failed to update project')
    }
  }

  // Stage management handlers - Add to pending state (not DB)
  const handleAddStage = (e) => {
    e.preventDefault()
    if (!projectAccess.stage.add) {
      toast.error('You do not have permission to add stages')
      return
    }
    if (!newStage.stageName.trim()) {
      toast.error('Stage name is required')
      return
    }
    if (!newStage.startDate || !newStage.endDate) {
      toast.error('Start date and end date are required')
      return
    }

    // Add to pending stages with a temporary ID
    const tempId = `temp-stage-${Date.now()}`
    const pendingStage = {
      tempId,
      stageId: tempId, // Use tempId as stageId for display
      stageName: newStage.stageName,
      startDate: newStage.startDate,
      endDate: newStage.endDate,
      owner: newStage.owner || null,
      machine: newStage.machine || '',
      duration: newStage.duration || 0,
      progress: newStage.progress || 0,
      isPending: true, // Flag to identify pending stages
    }

    setPendingStages([...pendingStages, pendingStage])
    toast.info('Stage added (pending save)')
    setShowAddStage(false)
    setNewStage({
      stageName: '',
      machine: '',
      duration: '',
      owner: '',
      startDate: '',
      endDate: '',
      progress: 0,
    })
  }

  const handleDeleteStage = (stageId, stageName) => {
    if (!projectAccess.stage.delete) {
      toast.error('You do not have permission to delete stages')
      return
    }
    if (window.confirm(`Delete stage "${stageName}" and all its substages?`)) {
      // Check if it's a pending stage (not yet in DB)
      const isPending = pendingStages.some(s => s.tempId === stageId)

      if (isPending) {
        // Remove from pending stages
        setPendingStages(pendingStages.filter(s => s.tempId !== stageId))
        // Remove any pending substages for this stage
        setPendingSubstages(pendingSubstages.filter(s => s.stageId !== stageId))
        toast.info('Stage removed')
      } else {
        // Mark for deletion (will be deleted on Save Details)
        setDeletedStageIds([...deletedStageIds, stageId])
        // Also mark all substages of this stage for deletion
        const substagesToDelete = activeSubStages
          .filter(s => s.stageId === stageId)
          .map(s => s.substageId)
        setDeletedSubstageIds([...deletedSubstageIds, ...substagesToDelete])
        toast.info('Stage marked for deletion (pending save)')
      }

      if (selectedStageId === stageId) {
        setSelectedStageId(null)
      }
    }
  }

  // Substage management handlers - Add to pending state (not DB)
  const handleAddSubstage = (e) => {
    e.preventDefault()
    if (!projectAccess.substage.add) {
      toast.error('You do not have permission to add substages')
      return
    }
    if (!newSubstage.substageName.trim()) {
      toast.error('Substage name is required')
      return
    }
    if (!newSubstage.startDate || !newSubstage.endDate) {
      toast.error('Start date and end date are required')
      return
    }

    const ownerString = newSubstage.owner ||
      `${user.employeeName || 'User'}(${user.customEmployeeId || user.employeeId})`

    // Add to pending substages with a temporary ID
    const tempId = `temp-substage-${Date.now()}`
    const pendingSubstage = {
      tempId,
      substageId: tempId, // Use tempId as substageId for display
      stageId: selectedStageId,
      parentSubstageId: addSubstageParentId,
      substageName: newSubstage.substageName,
      stageName: newSubstage.substageName, // For display in tree
      startDate: newSubstage.startDate,
      endDate: newSubstage.endDate,
      owner: ownerString,
      machine: newSubstage.machine || '',
      duration: newSubstage.duration || 0,
      progress: newSubstage.progress || 0,
      isPending: true, // Flag to identify pending substages
      isCompleted: 0, // New substages are not completed
    }

    // If adding a child to a completed parent, mark parent as incomplete
    if (addSubstageParentId) {
      // Update the parent in activeSubStages if it exists
      const parentInActive = activeSubStages.find(s => s.substageId === addSubstageParentId)
      if (parentInActive && parentInActive.isCompleted) {
        // Update the active substage locally to show immediate feedback
        const updatedActiveSubstages = activeSubStages.map(s => 
          s.substageId === addSubstageParentId 
            ? { ...s, isCompleted: 0, progress: 0, executedStartDate: null, executedEndDate: null }
            : s
        )
        // Note: This won't persist unless you have a way to update the Redux state
        // The backend will handle the actual update when saving
      }
      
      // Update parent in pendingSubstages if it exists
      const updatedPending = pendingSubstages.map(s =>
        s.substageId === addSubstageParentId || s.tempId === addSubstageParentId
          ? { ...s, isCompleted: 0, progress: 0, executedStartDate: null, executedEndDate: null }
          : s
      )
      setPendingSubstages([...updatedPending, pendingSubstage])
    } else {
      setPendingSubstages([...pendingSubstages, pendingSubstage])
    }

    toast.info('Substage added (pending save). Parent marked as incomplete.')
    setShowAddSubstage(false)
    setNewSubstage({
      substageName: '',
      machine: '',
      duration: '',
      owner: '',
      startDate: '',
      endDate: '',
      progress: 0,
    })
    setAddSubstageParentId(null)
  }

  const handleDeleteSubstage = (substageId) => {
    if (!projectAccess.substage.delete) {
      toast.error('You do not have permission to delete substages')
      return
    }
    if (window.confirm('Delete this substage and all its children?')) {
      // Check if it's a pending substage (not yet in DB)
      const isPending = pendingSubstages.some(s => s.tempId === substageId)
      // Also check if it's a tempId (starts with 'temp-' or 'temp_')
      const idStr = String(substageId)
      const isTempId = idStr.startsWith('temp-') || idStr.startsWith('temp_')

      if (isPending || isTempId) {
        // Remove from pending substages (and any children)
        setPendingSubstages(pendingSubstages.filter(
          s => s.tempId !== substageId && s.parentSubstageId !== substageId
        ))
        toast.info('Substage removed')
      } else {
        // Mark for deletion (will be deleted on Save Details)
        // Only add if it's not already in the list and it's a valid DB ID
        if (!deletedSubstageIds.includes(substageId)) {
          setDeletedSubstageIds([...deletedSubstageIds, substageId])
          toast.info('Substage marked for deletion (pending save)')
        }
      }
    }
  }

  const handleAddChildSubstage = (parentId) => {
    setAddSubstageParentId(parentId)
    setShowAddSubstage(true)
    setNewSubstage({
      substageName: '',
      machine: '',
      duration: '',
      owner: '',
      startDate: '',
      endDate: '',
      progress: 0,
    })
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
              <span className="font-semibold">Update project</span>
            </div>
          </div>
          <button
            className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
            type="submit"
          >
            <FiSave size={20} />
            <span>Save Changes</span>
          </button>
        </section>

        <div className="formDiv">
          {/* Project Form - editable fields */}
          {projectAccess.project.update && (
            <ProjectForm
              action={'update'}
              inputValues={inputValues}
              setInputValues={setInputValues}
            />
          )}

          {/* Update Reason (required) */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
              Reason for Update *
            </label>
            <textarea
              value={inputValues.updateReason || ''}
              onChange={(e) => setInputValues({ ...inputValues, updateReason: e.target.value })}
              placeholder="Describe what changed and why..."
              required
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Stages Management Section */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#212529', margin: 0 }}>
                Stage Management
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6c757d',
                    background: '#f1f3f5',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    marginLeft: '8px',
                  }}
                >
                  {mergedStages.length} stages
                </span>
              </h3>
              {projectAccess.stage.add && (
                <button
                  type="button"
                  onClick={() => setShowAddStage(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#0061A1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <FiPlusCircle size={16} />
                  Add Stage
                </button>
              )}
            </div>

            {/* Add Stage Form */}
            {showAddStage && (
              <div
                style={{
                  padding: '16px',
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: '12px' }}>
                  Adding new stage
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Stage Name *"
                    value={newStage.stageName}
                    onChange={(e) => handleNewStageChange('stageName', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      flex: '1',
                      minWidth: '180px',
                    }}
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date *"
                      value={newStage.startDate ? dayjs(newStage.startDate) : null}
                      onChange={(date) => handleNewStageChange('startDate', date ? dayjs(date).format('YYYY-MM-DD') : '')}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          sx: { width: '150px' },
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date *"
                      value={newStage.endDate ? dayjs(newStage.endDate) : null}
                      onChange={(date) => handleNewStageChange('endDate', date ? dayjs(date).format('YYYY-MM-DD') : '')}
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          sx: { width: '150px' },
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <input
                    type="number"
                    placeholder="Duration (Days)"
                    value={newStage.duration}
                    onChange={(e) => handleNewStageChange('duration', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      width: '120px',
                    }}
                  />
                  <select
                    value={newStage.owner}
                    onChange={(e) => handleNewStageChange('owner', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      minWidth: '160px',
                    }}
                  >
                    <option value="">-- Owner --</option>
                    {employeeList.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Machine"
                    value={newStage.machine}
                    onChange={(e) => handleNewStageChange('machine', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      width: '120px',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Progress (%)"
                    min="0"
                    max="100"
                    value={newStage.progress}
                    onChange={(e) => handleNewStageChange('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      width: '100px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={handleAddStage}
                    style={{
                      padding: '8px 20px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Add Stage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStage(false)
                      setNewStage({
                        stageName: '',
                        machine: '',
                        duration: '',
                        owner: '',
                        startDate: '',
                        endDate: '',
                        progress: 0,
                      })
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Stage List */}
            {mergedStages.length > 0 ? (
              mergedStages.map((stage, index) => {
                const stageProgress = stage.progress || 0
                const isSelected = selectedStageId === stage.stageId || selectedStageId === stage.tempId
                const isPending = stage.isPending
                return (
                  <div
                    key={stage.stageId || stage.tempId}
                    onClick={() => setSelectedStageId(isSelected ? null : (stage.stageId || stage.tempId))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: isPending ? '#fefce8' : isSelected ? '#dbeafe' : stageProgress >= 100 ? '#f0fdf4' : '#f8f9fa',
                      border: `2px solid ${isPending ? '#facc15' : isSelected ? '#0061A1' : stageProgress >= 100 ? '#86efac' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isPending ? '#eab308' : stageProgress >= 100 ? '#16a34a' : '#0061A1',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {isPending ? '•' : stageProgress >= 100 ? '✓' : index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#212529' }}>
                        {stage.stageName}
                        {isPending && (
                          <span style={{
                            fontSize: '10px',
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                          }}>
                            Pending Save
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Owner: {stage.owner || '—'} • {formatDate(stage.startDate)} → {formatDate(stage.endDate)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: stageProgress >= 100 ? '#16a34a' : '#0061A1' }}>
                        {stageProgress}%
                      </div>
                      <LinearProgress
                        determinate
                        value={stageProgress}
                        sx={{ width: '80px', height: '6px', borderRadius: '3px' }}
                      />
                    </div>
                    {projectAccess.stage.delete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteStage(stage.stageId || stage.tempId, stage.stageName)
                        }}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete Stage"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#adb5bd' }}>
                No stages yet. Click "Add Stage" to create one.
              </div>
            )}

            {/* Substage Management Panel (shown when a stage is selected) */}
            {selectedStageId && selectedStage && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0061A1' }}>
                    Substages for: {selectedStage.stageName}
                    {mergedSubstages.length > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#6c757d',
                          background: '#e5e7eb',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginLeft: '8px',
                        }}
                      >
                        {mergedSubstages.length} total
                      </span>
                    )}
                  </h4>
                  {projectAccess.substage.add && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddSubstageParentId(null)
                        setShowAddSubstage(true)
                        setNewSubstage({
                          substageName: '',
                          machine: '',
                          duration: '',
                          owner: '',
                          startDate: '',
                          endDate: '',
                          progress: 0,
                        })
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#0061A1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <FiPlusCircle size={14} />
                      Add Substage
                    </button>
                  )}
                </div>

                {/* Add Substage Form */}
                {showAddSubstage && projectAccess.substage.add && (
                  <div
                    style={{
                      padding: '12px',
                      background: '#fffbeb',
                      border: '1px solid #fcd34d',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: '10px' }}>
                      {addSubstageParentId
                        ? `Adding child substage under ID #${addSubstageParentId}`
                        : `Adding substage to ${selectedStage.stageName}`}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Substage Name *"
                        value={newSubstage.substageName}
                        onChange={(e) => handleNewSubstageChange('substageName', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          flex: '1',
                          minWidth: '150px',
                        }}
                      />
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date *"
                          value={newSubstage.startDate ? dayjs(newSubstage.startDate) : null}
                          onChange={(date) => handleNewSubstageChange('startDate', date ? dayjs(date).format('YYYY-MM-DD') : '')}
                          format="DD-MM-YYYY"
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { width: '140px' },
                            },
                          }}
                        />
                      </LocalizationProvider>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="End Date *"
                          value={newSubstage.endDate ? dayjs(newSubstage.endDate) : null}
                          onChange={(date) => handleNewSubstageChange('endDate', date ? dayjs(date).format('YYYY-MM-DD') : '')}
                          format="DD-MM-YYYY"
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { width: '140px' },
                            },
                          }}
                        />
                      </LocalizationProvider>
                      <input
                        type="number"
                        placeholder="Duration (Days)"
                        value={newSubstage.duration}
                        onChange={(e) => handleNewSubstageChange('duration', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '100px',
                        }}
                      />
                      <select
                        value={newSubstage.owner}
                        onChange={(e) => handleNewSubstageChange('owner', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          minWidth: '140px',
                        }}
                      >
                        <option value="">-- Owner --</option>
                        {employeeList.map((emp) => (
                          <option key={emp} value={emp}>
                            {emp}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Machine"
                        value={newSubstage.machine}
                        onChange={(e) => handleNewSubstageChange('machine', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '100px',
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Progress (%)"
                        min="0"
                        max="100"
                        value={newSubstage.progress}
                        onChange={(e) => handleNewSubstageChange('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          width: '90px',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={handleAddSubstage}
                        style={{
                          padding: '6px 16px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Add Substage
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSubstage(false)
                          setAddSubstageParentId(null)
                          setNewSubstage({
                            substageName: '',
                            machine: '',
                            duration: '',
                            owner: '',
                            startDate: '',
                            endDate: '',
                            progress: 0,
                          })
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Substage Tree View */}
                {substageTree.length > 0 ? (
                  <div>
                    {substageTree.map((node) => (
                      <SubstageTreeNode
                        key={node.substageId}
                        node={node}
                        depth={0}
                        onAddChild={handleAddChildSubstage}
                        onDelete={handleDeleteSubstage}
                        onToggleComplete={null}
                        stageId={selectedStageId}
                        projectNumber={pNo}
                        canAdd={projectAccess.substage.add}
                        canDelete={projectAccess.substage.delete}
                      />
                    ))}
                  </div>
                ) : (
                  !showAddSubstage && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#adb5bd',
                        fontSize: '13px',
                        background: '#f1f3f5',
                        borderRadius: '8px',
                      }}
                    >
                      No substages yet. Click "Add Substage" to create one.
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}

export default UpdateProject
