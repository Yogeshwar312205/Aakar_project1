import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { Gantt, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { formatDate } from '../../common/functions/formatDate.js'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { fetchProjectById } from '../../../features/projectSlice.js'

import './GanttChart.css'
import { fetchActiveStagesByProjectNumber } from '../../../features/stageSlice.js'
import { getSubStagesByProjectNumber } from '../../../features/subStageSlice.js'

// Utility function to parse dates safely
const parseDate = (dateString) => {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? new Date() : date
}

// Custom tooltip for the Gantt chart
const CustomTooltip = ({ task }) => {
  return (
    <div
      className="customTooltip"
      style={{ fontSize: '14px', fontFamily: 'Inter' }}
    >
      <b>
        {task.name}: {formatDate(task.start)} - {formatDate(task.end)}
      </b>
      {task.machine && <p>Machine: {task.machine}</p>}
      {task.duration && <p>Duration: {task.duration} hrs</p>}
      {task.progress && <p>Progress: {task.progress}%</p>}
      {task.owner && <p>Owner: {task.owner}</p>}
      {task.createdBy && <p>Created By: {task.createdBy}</p>}
    </div>
  )
}

const ProjectGanttChart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pNo } = useParams()

  const { project = {} } = useSelector((state) => state.projects)
  const { activeStages = [] } = useSelector((state) => state.stages)
  const { substages = [] } = useSelector((state) => state.substages)

  useEffect(() => {
    dispatch(fetchProjectById(pNo))
    dispatch(fetchActiveStagesByProjectNumber(pNo))
    dispatch(getSubStagesByProjectNumber(pNo))
  }, [dispatch, pNo])

  // Combine stages and substages
  const tasks = useMemo(() => {
    if (!project) return []

    const projectTask = {
      id: `project-${project.projectNumber}`,
      start: parseDate(project.startDate),
      end: parseDate(project.endDate),
      name: `${project.dieName} (Project)`,
      progress: project.progress || 0,
      type: 'project',
      hideChildren: false,
      styles: {
        progressColor: '#bf0053',
        backgroundColor: '#4f4e4f',
        progressSelectedColor: '#8f013f',
        backgroundSelectedColor: '#3a3b3a',
      },
    }

    const stageTasks = activeStages?.map((stage) => {
      const stageTask = {
        id: `stage-${stage.stageId}`,
        start: parseDate(stage.startDate),
        end: parseDate(stage.endDate),
        name: stage.stageName,
        progress: stage.progress || 0,
        machine: stage.machine,
        owner: stage.owner,
        duration: stage.duration,
        createdBy: stage.createdBy,
        type: 'stage',
        parent: projectTask.id,
        styles: {
          progressColor: '#007cce',
          progressSelectedColor: '#0061a1',
        },
      }
      if (!substages) return []
      const substageTasks = substages
        ?.filter(
          (substage) =>
            substage.stageId === stage.stageId && !substage.historyOf
        )
        ?.map((substage) => ({
          id: `substage-${substage.substageId}`,
          start: parseDate(substage.startDate),
          end: parseDate(substage.endDate),
          name: substage.stageName,
          progress: substage.progress || 0,
          machine: substage.machine,
          owner: substage.owner,
          duration: substage.duration,
          createdBy: substage.createdBy,
          type: 'substage',
          parent: stageTask.id,
          styles: {
            progressColor: '#34a853',
            progressSelectedColor: '#2c7a7b',
          },
        }))

      return [stageTask, ...substageTasks]
    })

    return [projectTask, ...stageTasks.flat()]
  }, [project, activeStages, substages])

  return (
    <div className="gantt">
      <section className="add-employee-head flex justify-between mb-3 w-[100%]">
        <div className="flex items-center gap-3">
          <FiArrowLeftCircle
            size={28}
            className="text-[#0061A1] hover:cursor-pointer"
            onClick={() => window.history.back()}
          />
          <div className="text-[17px]">
            <span>Dashboard / </span>
            <span className="font-semibold">Gantt Chart</span>
          </div>
        </div>
        <button
          className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
          type="submit"
          onClick={() => navigate(`/updateProject/${project.projectNumber}`)}
        >
          <FiEdit size={20} className="edit-icon" />
          <span>Edit Project</span>
        </button>
      </section>

      <div style={{ overflowX: 'auto' }}>
        <Gantt
          tasks={tasks}
          viewMode={ViewMode.Day}
          preStepsCount={2}
          fontFamily="Inter"
          fontSize="14px"
          todayColor="rgba(158, 217, 255,0.2)"
          TooltipContent={CustomTooltip}
          ganttHeight={620}
        />
      </div>
    </div>
  )
}

export default ProjectGanttChart
