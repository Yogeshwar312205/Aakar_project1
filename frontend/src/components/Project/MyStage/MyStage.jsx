import React, { useEffect, useState } from 'react'
import '../AddProject/AddProject.css'
import { FaRegArrowAltCircleLeft } from 'react-icons/fa'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { FiEdit2 } from 'react-icons/fi'
import { FaChartGantt } from 'react-icons/fa6'

import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProjectById,
  fetchProjects,
} from '../../../features/projectSlice.js'
import { useNavigate, useParams } from 'react-router-dom'

import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import TableComponent from '../../common/Table/TableComponent.jsx'
import {
  fetchActiveStagesByProjectNumber,
  fetchSingleStageById,
  fetchStagesByPno,
} from '../../../features/stageSlice.js'
import {
  getActiveSubStagesByStageId,
  getSubStagesByStageId,
  resetSubstageState,
} from '../../../features/subStageSlice.js'
import LinearProgress from '@mui/joy/LinearProgress'
import { formatDate } from '../../common/functions/formatDate.js'
import { Link } from 'react-router-dom'
const columns = [
  {
    label: 'Substage Name',
    id: 'stageName',
  },
  {
    label: 'Owner',
    id: 'owner',
  },
  {
    label: 'Machine',
    id: 'machine',
  },
  {
    label: 'Start Date',
    id: 'startDate',
  },
  {
    label: 'End Date',
    id: 'endDate',
  },
  {
    label: 'Duration(Hrs)',
    id: 'duration',
  },
  {
    label: 'Progress(%)',
    id: 'progress',
  },
  {
    label: 'Created By',
    id: 'createdBy',
  },
]

const MyStage = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
  console.log({ employeeAccess: employeeAccess })
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
    owner = '',
    machine = '',
    duration = '',
    createdBy = '',
    progress = 0,
  } = stage

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
              type="submit"
              onClick={() => navigate(`/myStage/gantt/${stage.stageId}`)}
            >
              <FaChartGantt size={20} className="edit-icon" />
              <span>View Gantt Chart</span>
            </button>
            {(employeeAccess[7] == '1' ||
              employeeAccess[9] == '1' ||
              employeeAccess[11] == '1') && (
              <button
                className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                type="submit"
                onClick={() =>
                  navigate(`/myProject/${pNo}/updateStage/${sNo}`, {
                    replace: true,
                  })
                }
              >
                <FiEdit size={20} className="edit-icon" />
                <span>Edit Stage</span>
              </button>
            )}
          </div>
        </section>
        <div className="formDiv">
          <h2>Stage details</h2>
          <div className="infoDiv">
            <div className="infoContainer stage ">
              <div className="noDiv">
                <p className="data">
                  {activeStages.findIndex((stage) => stage.stageId == sNo) + 1}
                </p>
              </div>
              <div className="progressBar">
                <LinearProgress determinate value={progress} />
              </div>
              <p className="data progress">• {progress}% progress</p>
            </div>
            <div className="infoContainer infoContainer2">
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Stage name
                </label>
                <p className="data">{stageName}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Owner
                </label>
                <p className="data">{owner}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Machine
                </label>
                <p className="data">{machine}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Start Date
                </label>
                <p className="data">{formatDate(startDate)}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  End Date
                </label>
                <p className="data">{formatDate(endDate)}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Duration
                </label>
                <p className="data">{duration} Hrs</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Created By
                </label>
                <p className="data">{createdBy}</p>
              </div>
            </div>
          </div>
        </div>
        {activeSubStages.length > 0 && (
          <TableComponent
            whose={'substage'}
            columns={columns}
            rows={activeSubStages}
            optionLinkBasePath={'updateStage'}
          />
        )}
      </div>
    </section>
  )
}

export default MyStage
