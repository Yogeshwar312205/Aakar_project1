import React, { useEffect, useState } from 'react'
import { FaRegArrowAltCircleLeft } from 'react-icons/fa'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { FaChartGantt } from 'react-icons/fa6'
import { formatDate } from '../../common/functions/formatDate.js'
import { useDispatch, useSelector } from 'react-redux'
import LinearProgress from '@mui/joy/LinearProgress'
import {
  fetchProjectById,
  resetProjectState,
} from '../../../features/projectSlice.js'
import { useNavigate, useParams } from 'react-router-dom'
import { FiEdit2 } from 'react-icons/fi'

import TableComponent from '../../common/Table/TableComponent.jsx'
import '../AddProject/AddProject.css'
import {
  fetchActiveStagesByProjectNumber,
  resetStageState,
} from '../../../features/stageSlice.js'
import './MyProject.css'
import { BASE_URL } from '../../../constants.js'

const columns = [
  {
    label: 'Stage Name',
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

const MyProject = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
  console.log({ employeeAccess: employeeAccess })

  const access = [
    1 /*add project*/, 1 /*edit project*/, 1 /*add project*/, 1 /*add project*/,
    1 /*add project*/, 1 /*add project*/, 1 /*add project*/, 1 /*add project*/,
    1 /*add project*/, 1 /*add project*/, 1 /*add project*/, 1 /*add project*/,
  ]
  const params = useParams()
  const pNo = params.id
  const dispatch = useDispatch()

  const { project = {} } = useSelector((state) => state.projects)
  const { activeStages = [] } = useSelector((state) => state.stages)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchProjectById(pNo))
    dispatch(fetchActiveStagesByProjectNumber(pNo))
    return () => {
      dispatch(resetProjectState())
      dispatch(resetStageState())
    }
  }, [dispatch, pNo])

  const {
    projectNumber,
    companyName,
    dieName,
    dieNumber,
    projectStatus,
    startDate,
    endDate,
    projectType,
    projectPOLink,
    projectDesignDocLink,
    progress,
    projectCreatedBy,
  } = project

  console.log({ project: project })

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
              <FiEdit size={20} className="edit-icon" />
              <span>View Gantt Chart</span>
            </button>

            {(employeeAccess[3] == '1' || employeeAccess[5] == '1') && (
              <button
                className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                onClick={() => navigate(`/updateProject/${projectNumber}`)}
              >
                <FiEdit size={20} className="edit-icon" />
                <span>Edit Project</span>
              </button>
            )}
          </div>
        </section>

        <div className="formDiv">
          <h2>Project details</h2>
          <div className="infoDiv">
            <div className="infoContainer ">
              <div className="noDiv">
                <p className="data">{projectNumber}</p>
              </div>
              <div className="headData">
                <p
                  className={`data ${
                    projectStatus === 'Completed'
                      ? 'completed'
                      : projectStatus === 'Overdue'
                      ? 'overdue'
                      : projectStatus === 'Pending'
                      ? 'pending'
                      : ''
                  }`}
                >
                  {projectStatus}
                </p>
                <div className="progressBar">
                  <LinearProgress determinate value={progress} />
                </div>
                <p className="data progress">• {progress}% progress</p>
              </div>
            </div>
            <div className="infoContainer infoContainer2">
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Company name
                </label>
                <p className="data">{companyName}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Die name
                </label>
                <p className="data">{dieName}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Die number
                </label>
                <p className="data">{dieNumber}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Project type
                </label>
                <p className="data">{projectType}</p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  PO document
                </label>
                <p className="data">
                  <a
                    href={`${BASE_URL}/${projectPOLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view
                  </a>
                </p>
              </div>
              <div className="infoField">
                <label htmlFor="" className="subHead">
                  Design document
                </label>
                <p className="data">
                  <a
                    href={`${BASE_URL}/${projectDesignDocLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view
                  </a>
                </p>
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
            </div>
          </div>
        </div>
        {activeStages.length > 0 && (
          <TableComponent
            whose={'stage'}
            columns={columns}
            rows={activeStages}
            linkBasePath={'myStage'}
            optionLinkBasePath={'updateStage'}
          />
        )}
      </div>
    </section>
  )
}

export default MyProject
