import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects } from '../../../features/projectSlice.js'

import { Gantt, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { formatDate } from '../../common/functions/formatDate.js'
import { FaRegArrowAltCircleLeft } from 'react-icons/fa'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { useParams, useNavigate } from 'react-router-dom'
import { FiEdit2 } from 'react-icons/fi'
import './GanttChart.css'
import { getActiveSubStagesByStageId } from '../../../features/subStageSlice.js'
import { fetchSingleStageById } from '../../../features/stageSlice.js'

const parseDate = (dateString) => {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? new Date() : date
}

const CustomTooltip = ({ task }) => {
  return (
    <div
      className="customTooltip"
      style={{ fontSize: '14px', fontFamily: 'Inter' }}
    >
      <b>
        {task.name} : {formatDate(task.start.toLocaleDateString())} -{' '}
        {formatDate(task.end.toLocaleDateString())}
      </b>
      {task.machine && <p>Machine: {task.machine}</p>}
      {task.durationHrs && <p>Duration: {task.durationHrs} hrs</p>}
      {task.progress && <p>Progress: {task.progress}%</p>}
      {task.owner && <p>Owner: {task.owner}</p>}
      {task.createdBy && <p>Created By: {task.createdBy}</p>}
    </div>
  )
}

const SubstagesGanttChart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const sNo = params.sNo

  const { stage = {} } = useSelector((state) => state.stages)
  const { activeSubStages = [] } = useSelector((state) => state.substages)

  useEffect(() => {
    dispatch(fetchSingleStageById(sNo))
    dispatch(getActiveSubStagesByStageId(sNo))
  }, [dispatch, sNo])

  const formattedSubStages = useMemo(() => {
    return activeSubStages.map((substage) => ({
      ...substage,
      startDate: parseDate(substage.startDate),
      endDate: parseDate(substage.endDate),
    }))
  }, [activeSubStages])
  const stageSubstages = useMemo(() => {
    return {
      ...stage,
      startDate: parseDate(stage.startDate),
      endDate: parseDate(stage.endDate),
      substages: formattedSubStages,
    }
  }, [stage, formattedSubStages])

  const tasks = useMemo(() => {
    if (!stageSubstages) return []

    const stageTask = {
      id: `stage-${stageSubstages.stageId}`,
      start: stageSubstages.startDate,
      end: stageSubstages.endDate,
      name: stageSubstages.stageName,
      machine: stageSubstages.machine,
      owner: stageSubstages.owner,
      createdBy: stageSubstages.createdBy,
      durationHrs: stageSubstages.duration,

      progress: `${stageSubstages.progress}`,
      type: 'project',
      hideChildren: false,
      styles: {
        progressColor: '#007cce',
        progressSelectedColor: '#0061a1',
      },
      linkProps: {
        className: 'stage-line',
      },
    }

    const substageTasks = stageSubstages?.substages?.map((substage) => ({
      id: `substage-${substage.substageId}`,
      start: substage.startDate,
      end: substage.endDate,
      name: substage.stageName,
      progress: substage.progress,
      machine: substage.machine,
      owner: substage.owner,
      createdBy: substage.createdBy,
      durationHrs: substage.duration,
      type: 'substage',
      parent: `stage-${stageSubstages.stageId}`,
      dependencies: [`stage-${stageSubstages.stageId}`],
      styles: {
        progressColor: '#34a853',
        progressSelectedColor: '#2c7a7b',
      },
      linkProps: {
        className: 'substage-line',
      },
    }))

    return [stageTask, ...substageTasks]
  }, [stageSubstages])

  console.log({ stageSubstages: stageSubstages })
  return (
    <div className="gantt">
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
        <button
          className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
          type="submit"
          onClick={() =>
            navigate(
              `/myProject/${stageSubstages.projectNumber}/updateStage/${stageSubstages.stageId}`
            )
          }
        >
          <FiEdit size={20} className="edit-icon" />
          <span>Edit Stage</span>
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

export default SubstagesGanttChart
