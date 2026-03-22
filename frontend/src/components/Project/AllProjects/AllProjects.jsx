import React, { useEffect, useMemo, useState } from 'react'
import Infocard from '../../Infocard/Infocard.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlusCircle } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchActiveProjects,
  resetProjectState,
} from '../../../features/projectSlice.js'
import TableComponent from '../../common/Table/TableComponent.jsx'
import './AllProjects.css'

const columns = [
  {
    label: 'Project Number',
    id: 'projectNumber',
  },
  {
    label: 'Company Name',
    id: 'companyName',
  },
  {
    label: 'Die Name',
    id: 'dieName',
  },
  {
    label: 'Status',
    id: 'projectStatus',
  },
  {
    label: 'Planned Start Date',
    id: 'startDate',
  },
  {
    label: 'Planned End Date',
    id: 'endDate',
  },
  {
    label: 'Executed Start Date',
    id: 'executedStartDate',
  },
  {
    label: 'Executed End Date',
    id: 'executedEndDate',
  },
  {
    label: 'Progress(%)',
    id: 'progress',
  },
]

const activityColumns = [
  {
    label: 'Activity Name',
    id: 'activityName',
  },
  {
    label: 'Department',
    id: 'department',
  },
  {
    label: 'Duration',
    id: 'duration',
  },
  {
    label: 'Machine',
    id: 'machine',
  },
  {
    label: 'Preferred Person',
    id: 'preferredPerson',
  },
]

const AllProjects = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
  console.log({ employeeAccess: employeeAccess })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { activeProjects, status, error } = useSelector(
    (state) => state.projects
  )

  const [selectedTab, setSelectedTab] = useState('all')

  const projectsList = useMemo(() => {
    switch (selectedTab) {
      case 'overdue':
        return activeProjects.filter((op) => op.projectStatus === 'Overdue')
      case 'ongoing':
        return activeProjects.filter((op) => op.projectStatus === 'Ongoing')
      case 'pending':
        return activeProjects.filter((op) => op.projectStatus === 'Pending')
      case 'completed':
        return activeProjects.filter((op) => op.projectStatus === 'Completed')
      case 'activities':
        return activeProjects.filter((op) => op.projectStatus === 'Activities')
      case 'all':
      default:
        return activeProjects
    }
  }, [selectedTab, activeProjects])

  useEffect(() => {
    dispatch(fetchActiveProjects())
    return () => {
      dispatch(resetProjectState())
    }
  }, [dispatch])

  const counts = useMemo(() => {
    return {
      all: activeProjects.length,
      overdue: activeProjects.filter((op) => op.projectStatus === 'Overdue')
        .length,
      ongoing: activeProjects.filter((op) => op.projectStatus === 'Ongoing')
        .length,
      pending: activeProjects.filter((op) => op.projectStatus === 'Pending')
        .length,
      completed: activeProjects.filter((op) => op.projectStatus === 'Completed')
        .length,
      activities: activeProjects.filter(
        (op) => op.projectStatus === 'Activities'
      ).length,
    }
  }, [activeProjects])

  const handleTabClick = (tab) => {
    setSelectedTab(tab)
  }

  return (
    <div className="allProject">
      <section className="info-section">
        <div className="info-tab">
          <div onClick={() => handleTabClick('all')}>
            <Infocard
              icon={'<TbSubtask />'}
              number={counts.all}
              text={'All Projects'}
              className={`infoCard ${selectedTab === 'all' ? 'selected' : ''}`}
            />
          </div>
          <div onClick={() => handleTabClick('overdue')}>
            <Infocard
              icon={'<FiBell />'}
              number={counts.overdue}
              text={'Overdue'}
              className={`infoCard ${
                selectedTab === 'overdue' ? 'selected' : ''
              }`}
            />
          </div>
          <div onClick={() => handleTabClick('ongoing')}>
            <Infocard
              icon={'<FiAlertCircle />'}
              number={counts.ongoing}
              text={'Ongoing'}
              className={`infoCard ${
                selectedTab === 'ongoing' ? 'selected' : ''
              }`}
            />
          </div>
          <div onClick={() => handleTabClick('completed')}>
            <Infocard
              icon={'<FiCheckCircle />'}
              number={counts.completed}
              text={'Completed'}
              className={`infoCard ${
                selectedTab === 'completed' ? 'selected' : ''
              }`}
            />
          </div>
          <div onClick={() => handleTabClick('activities')}>
            <Infocard
              icon={'<FiBriefcase />'}
              number={counts.activities}
              text={'Activities'}
              className={`infoCard ${
                selectedTab === 'activities' ? 'activities' : ''
              }`}
            />
          </div>
        </div>

        {employeeAccess[1] ? (
          <button
            className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
            onClick={() => navigate('/addProject')}
          >
            <FiPlusCircle
              style={{ marginRight: '10px', width: '25px', height: '25px' }}
            />
            Add Project
          </button>
        ) : (
          ''
        )}
      </section>

      {/* Handle loading and error states */}
      {status === 'loading' && <p>Loading projects...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Only render TableComponent if not loading and no error */}
      {status !== 'loading' && !error && (
        <TableComponent
          whose={'project'}
          rows={projectsList}
          columns={selectedTab == 'activities' ? activityColumns : columns}
          linkBasePath={'/myProject'}
          optionLinkBasePath={'/updateProject'}
          activeFilter={selectedTab}
        />
      )}
    </div>
  )
}

export default AllProjects
