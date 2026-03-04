import React, { useEffect, useMemo, useState } from 'react'
import '../AddProject/AddProject.css'
import { FiArrowLeftCircle } from 'react-icons/fi'
import { FaChartGantt } from 'react-icons/fa6'

import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import {
  fetchActiveStagesByProjectNumber,
  fetchSingleStageById,
} from '../../../features/stageSlice.js'
import {
  getActiveSubStagesByStageId,
  resetSubstageState,
  toggleSubStageCompletion,
} from '../../../features/subStageSlice.js'
import LinearProgress from '@mui/joy/LinearProgress'
import { formatDate } from '../../common/functions/formatDate.js'
import SubstageTreeNode, {
  buildSubstageTree,
} from '../../common/SubstageTreeNode/SubstageTreeNode.jsx'
import { toast } from 'react-toastify'

const MyStage = () => {
  const params = useParams()
  const { pNo, sNo } = params
  const dispatch = useDispatch()

  const { stage = {}, activeStages = [] } = useSelector((state) => state.stages)
  const { activeSubStages = [] } = useSelector((state) => state.substages)

  const navigate = useNavigate()

  useEffect(() => {
    dispatch(getActiveSubStagesByStageId(sNo))
    dispatch(fetchActiveStagesByProjectNumber(pNo))
    dispatch(fetchSingleStageById(sNo))
    return () => {
      dispatch(resetSubstageState())
    }
  }, [dispatch, sNo])

  const {
    stageName = '',
    startDate = null,
    endDate = null,
    executedStartDate = null,
    executedEndDate = null,
    owner = '',
    machine = '',
    duration = '',
    createdBy = '',
    progress = 0,
  } = stage

  // Build tree from flat substage list
  const substageTree = buildSubstageTree(activeSubStages || [])

  // Calculate stage progress from substages
  const calculatedProgress = useMemo(() => {
    if (!activeSubStages || activeSubStages.length === 0) return progress || 0
    const total = activeSubStages.length
    const completed = activeSubStages.filter((s) => s.isCompleted).length
    return Math.round((completed / total) * 100)
  }, [activeSubStages, progress])

  const handleToggleComplete = async (substageId, isCompleted, executedStartDate, executedEndDate) => {
    try {
      await dispatch(toggleSubStageCompletion({ substageId, isCompleted, executedStartDate, executedEndDate })).unwrap()
      toast.success(isCompleted ? 'Substage marked complete!' : 'Substage marked incomplete')
      // Refresh substages and stage data to update progress
      dispatch(getActiveSubStagesByStageId(sNo))
      dispatch(fetchSingleStageById(sNo))
    } catch (err) {
      toast.error('Failed to update completion status')
    }
  }

  return (
    <section className="addProject">
      <div className="addForm">
        <section className="add-employee-head flex justify-between mb-3 w-[100%]">
          <div className="flex items-center gap-3 justify-between">
            <FiArrowLeftCircle
              size={28}
              className="text-[#0061A1] hover:cursor-pointer"
              onClick={() => window.history.back()}
            />
            <div className="text-[17px]">
              <span>Dashboard / </span>
              <span className="font-semibold">My Project / </span>
              <span className="font-bold">My Stage</span>
            </div>
          </div>
          <div className="buttonContainer">
            <button
              className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
              onClick={() => navigate(`/myStage/gantt/${stage.stageId}`)}
            >
              <FaChartGantt size={20} />
              <span>Gantt Chart</span>
            </button>
          </div>
        </section>
        <div className="formDiv">
          {/* Stage Header with Progress */}
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0061A1' }}>
                {stageName}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6c757d' }}>
                Owner: {owner} • Machine: {machine} • Duration: {duration} Hrs
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#868e96' }}>
                <strong>Planned:</strong> {formatDate(startDate)} → {formatDate(endDate)} • Created by: {createdBy}
              </p>
              {(executedStartDate || executedEndDate) && (
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
                  <strong>Executed:</strong> {executedStartDate ? formatDate(executedStartDate) : '—'} → {executedEndDate ? formatDate(executedEndDate) : '—'}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: calculatedProgress === 100 ? '#16a34a' : '#0061A1',
                  lineHeight: 1,
                }}
              >
                {calculatedProgress}%
              </div>
              <LinearProgress
                determinate
                value={calculatedProgress}
                sx={{ width: '120px', height: '8px', borderRadius: '4px', marginTop: '6px' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6c757d' }}>
                {activeSubStages.filter((s) => s.isCompleted).length} / {activeSubStages.length} substages done
              </p>
            </div>
          </div>

          {/* Substage Tree Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#212529', margin: 0 }}>
              📋 Substages
              {activeSubStages.length > 0 && (
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
                  {activeSubStages.length} total
                </span>
              )}
            </h3>
          </div>

          {/* Substage Tree View */}
          {substageTree.length > 0 ? (
            <div>
              {substageTree.map((node) => (
                <SubstageTreeNode
                  key={node.substageId}
                  node={node}
                  depth={0}
                  onAddChild={null}
                  onDelete={null}
                  onToggleComplete={handleToggleComplete}
                  stageId={sNo}
                  projectNumber={pNo}
                  employeeAccess={false}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#adb5bd',
                fontSize: '14px',
                background: '#f8f9fa',
                borderRadius: '8px',
              }}
            >
              No substages found for this stage.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MyStage
