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

const UpdateProject = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
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
    duration: 0,
    owner: '',
  })

  // Substage management state
  const [showAddSubstage, setShowAddSubstage] = useState(false)
  const [addSubstageParentId, setAddSubstageParentId] = useState(null)
  const [newSubstage, setNewSubstage] = useState({
    substageName: '',
    machine: '',
    duration: 0,
    owner: '',
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

  // Calculate project progress from stages
  const projectProgress = useMemo(() => {
    if (activeStages.length === 0) return project?.progress || 0
    const totalProgress = activeStages.reduce(
      (acc, s) => acc + Number(s.progress || 0),
      0
    )
    return Math.round(totalProgress / activeStages.length)
  }, [activeStages, project])

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

  // Build substage tree for selected stage
  const substageTree = buildSubstageTree(activeSubStages || [])

  // Get selected stage details
  const selectedStage = activeStages.find((s) => s.stageId === selectedStageId)

  const handleSave = (e) => {
    e.preventDefault()
    if (!inputValues.updateReason) {
      toast.error('Please provide a reason for updating')
      return
    }

    dispatch(
      updateProject({
        id: pNo,
        data: {
          ...inputValues,
          progress: projectProgress,
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Project updated successfully!')
        navigate(-1)
      })
      .catch((err) => {
        console.error('Error updating project:', err)
        toast.error('Failed to update project')
      })
  }

  // Stage management handlers
  const handleAddStage = async (e) => {
    e.preventDefault()
    if (!newStage.stageName.trim()) {
      toast.error('Stage name is required')
      return
    }

    const stageData = {
      projectNumber: pNo,
      stageName: newStage.stageName,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      owner: newStage.owner || null,
      machine: newStage.machine || '',
      duration: newStage.duration || 0,
      seqPrevStage: activeStages.length > 0 ? activeStages[activeStages.length - 1].stageId : null,
      createdBy: user.employeeId,
      progress: 0,
    }

    try {
      await dispatch(addStage(stageData)).unwrap()
      toast.success('Stage added!')
      setShowAddStage(false)
      setNewStage({ stageName: '', machine: '', duration: 0, owner: '' })
      dispatch(fetchActiveStagesByProjectNumber(pNo))
    } catch (err) {
      console.error('Add stage error:', err)
      toast.error('Failed to add stage')
    }
  }

  const handleDeleteStage = async (stageId, stageName) => {
    if (window.confirm(`Delete stage "${stageName}" and all its substages?`)) {
      try {
        await dispatch(deleteStage(stageId)).unwrap()
        toast.success('Stage deleted!')
        if (selectedStageId === stageId) {
          setSelectedStageId(null)
        }
        dispatch(fetchActiveStagesByProjectNumber(pNo))
      } catch (err) {
        toast.error('Failed to delete stage')
      }
    }
  }

  // Substage management handlers
  const handleAddSubstage = async (e) => {
    e.preventDefault()
    if (!newSubstage.substageName.trim()) {
      toast.error('Substage name is required')
      return
    }

    const ownerString = newSubstage.owner ||
      `${user.employeeName || 'User'}(${user.customEmployeeId || user.employeeId})`

    const substageData = {
      stageId: selectedStageId,
      parentSubstageId: addSubstageParentId,
      substagename: newSubstage.substageName,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      owner: ownerString,
      machine: newSubstage.machine || '',
      duration: newSubstage.duration || 0,
      createdBy: user.employeeId,
      progress: 0,
      projectNumber: pNo,
      seqPrevStage: null,
    }

    try {
      await dispatch(addSubStage(substageData)).unwrap()
      toast.success('Substage added!')
      setShowAddSubstage(false)
      setNewSubstage({ substageName: '', machine: '', duration: 0, owner: '' })
      setAddSubstageParentId(null)
      dispatch(getActiveSubStagesByStageId(selectedStageId))
    } catch (err) {
      console.error('Add substage error:', err)
      toast.error('Failed to add substage')
    }
  }

  const handleDeleteSubstage = async (substageId) => {
    if (window.confirm('Delete this substage and all its children?')) {
      try {
        await dispatch(deleteSubStage(substageId)).unwrap()
        toast.success('Substage deleted!')
        dispatch(getActiveSubStagesByStageId(selectedStageId))
      } catch (err) {
        toast.error('Failed to delete substage')
      }
    }
  }

  const handleAddChildSubstage = (parentId) => {
    setAddSubstageParentId(parentId)
    setShowAddSubstage(true)
    setNewSubstage({ substageName: '', machine: '', duration: 0, owner: '' })
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
          {employeeAccess[3] == '1' && (
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
                📋 Stage Management
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
                  {activeStages.length} stages
                </span>
              </h3>
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
            </div>

            {/* Add Stage Form */}
            {showAddStage && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', minWidth: '100%' }}>
                  Adding new stage
                </span>
                <input
                  type="text"
                  placeholder="Stage Name *"
                  value={newStage.stageName}
                  onChange={(e) => setNewStage({ ...newStage, stageName: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    flex: '1',
                    minWidth: '180px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Machine"
                  value={newStage.machine}
                  onChange={(e) => setNewStage({ ...newStage, machine: e.target.value })}
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
                  placeholder="Duration (hrs)"
                  value={newStage.duration}
                  onChange={(e) => setNewStage({ ...newStage, duration: Number(e.target.value) })}
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
                  onChange={(e) => setNewStage({ ...newStage, owner: e.target.value })}
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
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStage(false)}
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
            )}

            {/* Stage List */}
            {activeStages.length > 0 ? (
              activeStages.map((stage, index) => {
                const stageProgress = stage.progress || 0
                const isSelected = selectedStageId === stage.stageId
                return (
                  <div
                    key={stage.stageId}
                    onClick={() => setSelectedStageId(isSelected ? null : stage.stageId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: isSelected ? '#dbeafe' : stageProgress >= 100 ? '#f0fdf4' : '#f8f9fa',
                      border: `2px solid ${isSelected ? '#0061A1' : stageProgress >= 100 ? '#86efac' : '#e5e7eb'}`,
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
                        background: stageProgress >= 100 ? '#16a34a' : '#0061A1',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {stageProgress >= 100 ? '✓' : index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#212529' }}>
                        {stage.stageName}
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteStage(stage.stageId, stage.stageName)
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
                    {activeSubStages.length > 0 && (
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
                        {activeSubStages.length} total
                      </span>
                    )}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setAddSubstageParentId(null)
                      setShowAddSubstage(true)
                      setNewSubstage({ substageName: '', machine: '', duration: 0, owner: '' })
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
                </div>

                {/* Add Substage Form */}
                {showAddSubstage && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#fffbeb',
                      border: '1px solid #fcd34d',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', minWidth: '100%' }}>
                      {addSubstageParentId
                        ? `Adding child substage under ID #${addSubstageParentId}`
                        : `Adding substage to ${selectedStage.stageName}`}
                    </span>
                    <input
                      type="text"
                      placeholder="Substage Name *"
                      value={newSubstage.substageName}
                      onChange={(e) => setNewSubstage({ ...newSubstage, substageName: e.target.value })}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        flex: '1',
                        minWidth: '150px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Machine"
                      value={newSubstage.machine}
                      onChange={(e) => setNewSubstage({ ...newSubstage, machine: e.target.value })}
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
                      placeholder="Duration"
                      value={newSubstage.duration}
                      onChange={(e) => setNewSubstage({ ...newSubstage, duration: Number(e.target.value) })}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        width: '80px',
                      }}
                    />
                    <select
                      value={newSubstage.owner}
                      onChange={(e) => setNewSubstage({ ...newSubstage, owner: e.target.value })}
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
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSubstage(false)
                        setAddSubstageParentId(null)
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
                        employeeAccess={true}
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
