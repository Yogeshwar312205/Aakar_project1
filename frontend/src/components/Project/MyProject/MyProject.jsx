import React, { useEffect, useState, useCallback } from 'react'
import { FiArrowLeftCircle, FiEdit, FiClock, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { FaChartGantt } from 'react-icons/fa6'
import { formatDate } from '../../common/functions/formatDate.js'
import { useDispatch, useSelector } from 'react-redux'
import LinearProgress from '@mui/joy/LinearProgress'
import {
  fetchProjectById,
  fetchProjectHistory,
  resetProjectState,
} from '../../../features/projectSlice.js'
import { useNavigate, useParams } from 'react-router-dom'

import '../AddProject/AddProject.css'
import {
  fetchActiveStagesByProjectNumber,
  resetStageState,
} from '../../../features/stageSlice.js'
import { updateStageProgress } from '../../../features/stageSlice.js'
import './MyProject.css'
import { BASE_URL } from '../../../constants.js'
import { ProjectHistory } from '../ProjectHistory/index.js'
import { toast } from 'react-toastify'
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

const MyProject = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]

  const params = useParams()
  const pNo = params.id
  const dispatch = useDispatch()

  const { project = {}, projectHistory = {}, loading } = useSelector((state) => state.projects)
  const { activeStages = [] } = useSelector((state) => state.stages)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('stages')
  const [editingStageId, setEditingStageId] = useState(null)
  const [stageProgressValue, setStageProgressValue] = useState(0)
  const [stageDateDialogOpen, setStageDateDialogOpen] = useState(false)
  const [stageDateDialogStageId, setStageDateDialogStageId] = useState(null)
  const [stageExecStartDate, setStageExecStartDate] = useState(null)
  const [stageExecEndDate, setStageExecEndDate] = useState(null)

  useEffect(() => {
    dispatch(fetchProjectById(pNo))
    dispatch(fetchActiveStagesByProjectNumber(pNo))
    dispatch(fetchProjectHistory(pNo))
    return () => {
      dispatch(resetProjectState())
      dispatch(resetStageState())
    }
  }, [dispatch, pNo])

  const handleRefreshHistory = useCallback(() => {
    dispatch(fetchProjectHistory(pNo))
  }, [dispatch, pNo])

  const handleStageProgressEditStart = (e, stageId, currentProgress) => {
    e.stopPropagation()
    setEditingStageId(stageId)
    setStageProgressValue(currentProgress || 0)
  }

  const handleStageProgressSave = async (e, stageId) => {
    e.stopPropagation()
    const val = Math.max(0, Math.min(100, Math.round(Number(stageProgressValue))))
    setEditingStageId(null)

    if (val >= 100) {
      // Show executed dates dialog before saving 100%
      setStageDateDialogStageId(stageId)
      setStageExecStartDate(dayjs())
      setStageExecEndDate(dayjs())
      setStageDateDialogOpen(true)
      return
    }

    try {
      await dispatch(updateStageProgress({ stageId, progress: val })).unwrap()
      toast.success(`Stage progress updated to ${val}%`)
      dispatch(fetchActiveStagesByProjectNumber(pNo))
      dispatch(fetchProjectById(pNo))
    } catch (err) {
      const msg = err?.message || 'Failed to update stage progress'
      toast.error(msg)
    }
  }

  const handleStageDateDialogConfirm = async () => {
    const formattedStart = stageExecStartDate ? dayjs(stageExecStartDate).format('YYYY-MM-DD') : null
    const formattedEnd = stageExecEndDate ? dayjs(stageExecEndDate).format('YYYY-MM-DD') : null
    setStageDateDialogOpen(false)
    try {
      await dispatch(updateStageProgress({
        stageId: stageDateDialogStageId,
        progress: 100,
        executedStartDate: formattedStart,
        executedEndDate: formattedEnd,
      })).unwrap()
      toast.success('Stage progress updated to 100%')
      dispatch(fetchActiveStagesByProjectNumber(pNo))
      dispatch(fetchProjectById(pNo))
    } catch (err) {
      const msg = err?.message || 'Failed to update stage progress'
      toast.error(msg)
    }
  }

  const handleStageDateDialogCancel = () => {
    setStageDateDialogOpen(false)
    setStageExecStartDate(null)
    setStageExecEndDate(null)
  }

  const handleStageProgressCancel = (e) => {
    e.stopPropagation()
    setEditingStageId(null)
    setStageProgressValue(0)
  }

  const handleStageProgressKeyDown = (e, stageId) => {
    if (e.key === 'Enter') {
      handleStageProgressSave(e, stageId)
    } else if (e.key === 'Escape') {
      handleStageProgressCancel(e)
    }
  }

  const {
    projectNumber,
    companyName,
    dieName,
    dieNumber,
    projectStatus,
    startDate,
    endDate,
    executedStartDate,
    executedEndDate,
    projectType,
    projectPOLink,
    projectDesignDocLink,
    progress,
    projectCreatedBy,
  } = project

  return (
    <section className="addProject">
      <div className="addForm">
        <section className="add-employee-head flex justify-between mb-3 w-[100%]">
          <div className="flex items-center gap-3">
            <FiArrowLeftCircle
              size={28}
              className="text-[#0061A1] hover:cursor-pointer"
              onClick={() => window.history.back()}
            />
            <div className="text-[17px]">
              <span>Dashboard / </span>
              <span className="font-semibold">My Project</span>
            </div>
          </div>
          <div className="buttonContainer">
            <button
              className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
              onClick={() => navigate(`/myProject/gantt/${projectNumber}`)}
            >
              <FaChartGantt size={20} />
              <span>Gantt Chart</span>
            </button>
            {(employeeAccess[3] == '1' || employeeAccess[5] == '1') && (
              <button
                className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                onClick={() => navigate(`/updateProject/${projectNumber}`)}
              >
                <FiEdit size={20} />
                <span>Edit Project</span>
              </button>
            )}
          </div>
        </section>

        <div className="formDiv">
          {/* Project Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)',
              borderRadius: '12px',
              border: '1px solid #b3d7ff',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    background: '#0061A1',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  #{projectNumber}
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background:
                      projectStatus === 'Completed'
                        ? '#dcfce7'
                        : projectStatus === 'Overdue'
                        ? '#fee2e2'
                        : '#dbeafe',
                    color:
                      projectStatus === 'Completed'
                        ? '#16a34a'
                        : projectStatus === 'Overdue'
                        ? '#dc2626'
                        : '#2563eb',
                  }}
                >
                  {projectStatus}
                </span>
              </div>
              <h2 style={{ margin: '8px 0 4px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                {companyName} — {dieName}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                Die #: {dieNumber} • Type: {projectType} • <strong>Planned:</strong> {formatDate(startDate)} → {formatDate(endDate)}
              </p>
              {(executedStartDate || executedEndDate) && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                  <strong>Executed:</strong> {executedStartDate ? formatDate(executedStartDate) : '—'} → {executedEndDate ? formatDate(executedEndDate) : '—'}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: progress >= 100 ? '#16a34a' : '#0061A1',
                  lineHeight: 1,
                }}
              >
                {progress || 0}%
              </div>
              <LinearProgress
                determinate
                value={progress || 0}
                sx={{ width: '100px', height: '8px', borderRadius: '4px', marginTop: '6px' }}
              />
            </div>
          </div>

          {/* Document Links */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {projectPOLink && (
              <a
                href={`${BASE_URL}/${projectPOLink}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  background: '#f1f3f5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0061A1',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                📄 PO Document
              </a>
            )}
            {projectDesignDocLink && (
              <a
                href={`${BASE_URL}/${projectDesignDocLink}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  background: '#f1f3f5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0061A1',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                📐 Design Document
              </a>
            )}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0',
              borderBottom: '2px solid #e5e7eb',
              marginBottom: '16px',
            }}
          >
            <button
              onClick={() => setActiveTab('stages')}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: activeTab === 'stages' ? 700 : 500,
                color: activeTab === 'stages' ? '#0061A1' : '#6c757d',
                border: 'none',
                borderBottom: activeTab === 'stages' ? '3px solid #0061A1' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              📋 Stages ({activeStages.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: activeTab === 'history' ? 700 : 500,
                color: activeTab === 'history' ? '#0061A1' : '#6c757d',
                border: 'none',
                borderBottom: activeTab === 'history' ? '3px solid #0061A1' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              <FiClock style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              History ({(projectHistory.stages || []).length} stages)
            </button>
          </div>

          {/* Stages Tab */}
          {activeTab === 'stages' && (
            <div>
              {activeStages.length > 0 ? (
                activeStages.map((stage, index) => {
                  const stageProgress = stage.progress || 0
                  const isEditing = editingStageId === stage.stageId
                  return (
                    <div
                      key={stage.stageId}
                      onClick={() => {
                        if (!isEditing) {
                          navigate(`/myProject/${pNo}/myStage/${stage.stageId}`)
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '14px 16px',
                        marginBottom: '8px',
                        background: stageProgress >= 100 ? '#f0fdf4' : '#f8f9fa',
                        border: `1px solid ${stageProgress >= 100 ? '#86efac' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        cursor: isEditing ? 'default' : 'pointer',
                        transition: 'box-shadow 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
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
                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#212529' }}>
                          {stage.stageName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          Owner: {stage.owner} • Machine: {stage.machine} • <strong>Planned:</strong> {formatDate(stage.startDate)} → {formatDate(stage.endDate)}
                        </div>
                        {(stage.executedStartDate || stage.executedEndDate) && (
                          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                            <strong>Executed:</strong> {stage.executedStartDate ? formatDate(stage.executedStartDate) : '—'} → {stage.executedEndDate ? formatDate(stage.executedEndDate) : '—'}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={stageProgressValue}
                              onChange={(e) => setStageProgressValue(e.target.value)}
                              onKeyDown={(e) => handleStageProgressKeyDown(e, stage.stageId)}
                              autoFocus
                              style={{
                                width: '55px',
                                padding: '4px 6px',
                                fontSize: '16px',
                                fontWeight: 700,
                                border: '2px solid #0061A1',
                                borderRadius: '6px',
                                textAlign: 'center',
                                outline: 'none',
                              }}
                            />
                            <span style={{ fontSize: '16px', fontWeight: 700 }}>%</span>
                            <button
                              onClick={(e) => handleStageProgressSave(e, stage.stageId)}
                              style={{
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Save"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={handleStageProgressCancel}
                              style={{
                                background: '#e5e7eb',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Cancel"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <span
                                style={{
                                  fontSize: '20px',
                                  fontWeight: 700,
                                  color: stageProgress >= 100 ? '#16a34a' : '#0061A1',
                                }}
                              >
                                {stageProgress}%
                              </span>
                              <button
                                onClick={(e) => handleStageProgressEditStart(e, stage.stageId, stageProgress)}
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
                                <FiEdit2 size={14} />
                              </button>
                            </div>
                            <LinearProgress
                              determinate
                              value={stageProgress}
                              sx={{ width: '80px', height: '6px', borderRadius: '3px' }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#adb5bd' }}>
                  No stages found for this project.
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <ProjectHistory
              history={projectHistory}
              onRefresh={handleRefreshHistory}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Executed Date Dialog for Stage Progress 100% */}
      <Dialog open={stageDateDialogOpen} onClose={handleStageDateDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#0061A1' }}>
          Enter Executed Dates
        </DialogTitle>
        <DialogContent>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
            Stage progress is being set to <strong>100%</strong>. Please enter the actual start and end dates.
          </p>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <DatePicker
                label="Executed Start Date*"
                value={stageExecStartDate}
                onChange={(val) => setStageExecStartDate(val)}
                sx={{ flex: 1 }}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
              <DatePicker
                label="Executed End Date*"
                value={stageExecEndDate}
                onChange={(val) => setStageExecEndDate(val)}
                sx={{ flex: 1 }}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </div>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleStageDateDialogCancel} sx={{ color: '#6c757d' }}>
            Cancel
          </Button>
          <Button
            onClick={handleStageDateDialogConfirm}
            variant="contained"
            disabled={!stageExecStartDate || !stageExecEndDate}
            sx={{ backgroundColor: '#0061A1', '&:hover': { backgroundColor: '#004d80' } }}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}

export default MyProject

