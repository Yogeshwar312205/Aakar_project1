import React, { useEffect, useState, useCallback } from 'react'
import { FiArrowLeftCircle, FiEdit, FiClock } from 'react-icons/fi'
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
import './MyProject.css'
import { BASE_URL } from '../../../constants.js'
import { ProjectHistory } from '../ProjectHistory/index.js'

const MyProject = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]

  const params = useParams()
  const pNo = params.id
  const dispatch = useDispatch()

  const { project = {}, projectHistory = [], loading } = useSelector((state) => state.projects)
  const { activeStages = [] } = useSelector((state) => state.stages)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('stages')

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
              History ({projectHistory.length})
            </button>
          </div>

          {/* Stages Tab */}
          {activeTab === 'stages' && (
            <div>
              {activeStages.length > 0 ? (
                activeStages.map((stage, index) => {
                  const stageProgress = stage.progress || 0
                  return (
                    <div
                      key={stage.stageId}
                      onClick={() => navigate(`/myProject/${pNo}/myStage/${stage.stageId}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '14px 16px',
                        marginBottom: '8px',
                        background: stageProgress >= 100 ? '#f0fdf4' : '#f8f9fa',
                        border: `1px solid ${stageProgress >= 100 ? '#86efac' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
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
                        <div
                          style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: stageProgress >= 100 ? '#16a34a' : '#0061A1',
                          }}
                        >
                          {stageProgress}%
                        </div>
                        <LinearProgress
                          determinate
                          value={stageProgress}
                          sx={{ width: '80px', height: '6px', borderRadius: '3px' }}
                        />
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
    </section>
  )
}

export default MyProject
