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
    label: 'Start Date*',
    id: 'startDate',
  },
  {
    label: 'End Date*',
    id: 'endDate',
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
          <div onClick={() => handleTabClick('pending')}>
            <Infocard
              icon={'<FiAlertCircle />'}
              number={counts.pending}
              text={'Pending'}
              className={`infoCard ${
                selectedTab === 'pending' ? 'selected' : ''
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
      {selectedTab == 'activities' && (
        <div>
          <FormControl sx={{ m: 1, width: 300, marginTop: '15px' }}>
            <InputLabel
              id="demo-multiple-checkbox-label"
              sx={{ fontSize: '14px' }} // Smaller font size for the label
            >
              {name}
            </InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={includedSubparts}
              onChange={handleChange}
              input={
                <OutlinedInput
                  label="Tag"
                  sx={{
                    height: '40px', // Reduced height for the input field
                    fontSize: '14px', // Smaller font size for the input field
                  }}
                />
              }
              renderValue={(selected) =>
                selected.map((item) => item.name).join(', ')
              }
              MenuProps={MenuProps}
              sx={{ fontSize: '14px' }} // Smaller font size for the select component
            >
              {subpartsList.map((subpart) => (
                <MenuItem
                  key={subpart.id}
                  value={subpart}
                  sx={{ height: ITEM_HEIGHT, fontSize: '14px' }} // Smaller height and font size for menu items
                >
                  <Checkbox
                    checked={includedSubparts.some(
                      (item) => item.id === subpart.id
                    )}
                    sx={{ padding: '6px' }} // Smaller padding for checkboxes
                  />
                  <ListItemText
                    primary={subpart.name}
                    sx={{ fontSize: '14px' }}
                  />{' '}
                  {/* Smaller font size for list items */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}
      {/* Only render TableComponent if not loading and no error */}
      {status !== 'loading' && !error && (
        <TableComponent
          whose={'project'}
          rows={projectsList}
          columns={selectedTab == 'activities' ? activityColumns : columns}
          linkBasePath={'/myProject'}
          optionLinkBasePath={'/updateProject'}
        />
      )}
    </div>
  )
}

export default AllProjects
