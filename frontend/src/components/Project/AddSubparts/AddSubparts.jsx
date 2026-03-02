import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SubstageForm from '../AddSubstages/SubstageForm'
import { useSelector } from 'react-redux'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  LinearProgress,
} from '@mui/material'
import MultipleSelectCheckmarks from '../AddStage/MultipleSelectCheckmarks'
import ActivityTable from '../ActivityTable/ActivityTable'

const AddSubparts = () => {
  const location = useLocation()
  const { state } = location // Destructure the state from location
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]

  const { employees } = useSelector((state) => state.employee)
  const [employeeList, setEmployeeList] = useState(
    employees.map(
      (employee) =>
        `${employee.employee.employeeName}(${employee.employee.customEmployeeId})`
    )
  )

  const { stage = {}, activeStages = [] } = useSelector((state) => state.stages)
  const [inputValues, setInputValues] = useState(stage)

  const handleSave = (e) => {
    e.preventDefault()
    // Add your save logic here
  }

  const [includedSubparts, setIncludedSubparts] = useState([])
  const subpartsList = [
    {
      name: 'subpart1',
      id: 1,
      activities: [],
    },
    {
      name: 'subpart2',
      id: 2,
      activities: [],
    },
    {
      name: 'subpart3',
      id: 3,
      activities: [],
    },
    {
      name: 'subpart4',
      id: 4,
      activities: [],
    },
    {
      name: 'subpart5',
      id: 5,
      activities: [],
    },
  ]

  const [includedActivities, setIncludedActivities] = useState([])
  const activitiesList = [
    {
      name: 'activity1',
      id: 1,
      duration: 4,
      startDate: '2025-02-24',
      endDate: '2025-02-28',
      machine: 'VMC2',
      preferredPerson: 'Krishna',
      status: 'In Progress',
    },
    {
      name: 'activity2',
      id: 2,
      duration: 4,
      startDate: '2025-02-24',
      endDate: '2025-02-28',
      machine: 'VMC2',
      preferredPerson: 'Krishna',
      status: 'In Progress',
    },
    {
      name: 'activity3',
      id: 3,
      duration: 4,
      startDate: '2025-02-24',
      endDate: '2025-02-28',
      machine: 'VMC2',
      preferredPerson: 'Krishna',
      status: 'In Progress',
    },
    {
      name: 'activity4',
      id: 4,
      duration: 4,
      startDate: '2025-02-24',
      endDate: '2025-02-28',
      machine: 'VMC2',
      preferredPerson: 'Krishna',
      status: 'In Progress',
    },
    {
      name: 'activity5',
      id: 5,
      duration: 4,
      startDate: '2025-02-24',
      endDate: '2025-02-28',
      machine: 'VMC2',
      preferredPerson: 'Krishna',
      status: 'In Progress',
    },
  ]

  const [rows, setRows] = useState(
    includedSubparts.map((subpart) => ({
      id: subpart.id, // Ensure each row has a unique ID
      name: subpart.name,
      activities: subpart.activities || [], // Fallback to an empty array
    }))
  )

  const [selectedActivity, setSelectedActivity] = useState(null)

  useEffect(() => {
    setRows(
      includedSubparts.map((subpart) => ({
        id: subpart.id, // Ensure each row has a unique ID
        name: subpart.name,
        activities: subpart.activities || [], // Fallback to an empty array
      }))
    )
  }, [includedSubparts, includedActivities])

  const columns = [
    {
      label: 'Names',
      id: 'subpartNames',
    },
    ...includedActivities.map((activity) => ({
      label: activity.name,
      ...activity, // Include all activity details
    })),
  ]

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity)
  }

  const handleActivityUpdate = (field, value) => {
    setSelectedActivity((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveUpdatedActivity = () => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        activities: row.activities.map((activity) =>
          activity.id === selectedActivity.id ? selectedActivity : activity
        ),
      }))
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString() // Format the date as needed
  }

  const progress = 50 // Example progress value
  const sNo = stage.stageId // Example stage ID
  const stageName = stage.name || 'Stage Name' // Example stage name
  const owner = stage.owner || 'Owner Name' // Example owner
  const machine = stage.machine || 'Machine Name' // Example machine
  const startDate = stage.startDate || '2025-02-24' // Example start date
  const endDate = stage.endDate || '2025-02-28' // Example end date
  const duration = stage.duration || '24' // Example duration
  const createdBy = stage.createdBy || 'Admin' // Example created by

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
              <span className="font-semibold">Update stage</span>
            </div>
          </div>
          <button
            className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
            type="submit"
          >
            <FiEdit size={20} className="edit-icon" />
            <span>Save details</span>
          </button>
        </section>
        <div className="formDiv">
          <>
            <h2>Stage details</h2>
            <div className="infoDiv">
              <div className="infoContainer stage">
                <div className="noDiv">
                  <p className="data">
                    {activeStages.findIndex((stage) => stage.stageId === sNo) +
                      1}
                  </p>
                </div>
                <div className="progressBar">
                  <LinearProgress variant="determinate" value={progress} />
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
          </>
          <div className="flex">
            <MultipleSelectCheckmarks
              subpartsList={subpartsList}
              includedSubparts={includedSubparts}
              setIncludedSubparts={setIncludedSubparts}
              name={'Subparts'}
            />
            <MultipleSelectCheckmarks
              subpartsList={activitiesList}
              includedSubparts={includedActivities}
              setIncludedSubparts={setIncludedActivities}
              name={'Activities'}
            />
          </div>
          <Table
            sx={{ minWidth: 650 }}
            aria-label="simple table"
            size="small" // Use a smaller table size
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  Activity
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  Duration
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  Start Date
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  End Date
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  Machine
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  Preferred Person
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ height: '40px' }}>
                {' '}
                {/* Reduced row height */}
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={selectedActivity?.name || ''}
                    disabled
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={selectedActivity?.duration || ''}
                    onChange={(e) =>
                      handleActivityUpdate('duration', e.target.value)
                    }
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    type="date"
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    value={selectedActivity?.startDate || ''}
                    onChange={(e) =>
                      handleActivityUpdate('startDate', e.target.value)
                    }
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    type="date"
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    value={selectedActivity?.endDate || ''}
                    onChange={(e) =>
                      handleActivityUpdate('endDate', e.target.value)
                    }
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={selectedActivity?.machine || ''}
                    onChange={(e) =>
                      handleActivityUpdate('machine', e.target.value)
                    }
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={selectedActivity?.preferredPerson || ''}
                    onChange={(e) =>
                      handleActivityUpdate('preferredPerson', e.target.value)
                    }
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={selectedActivity?.status || ''}
                    onChange={(e) =>
                      handleActivityUpdate('status', e.target.value)
                    }
                    sx={{ fontSize: '12px' }} // Smaller font size
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <ActivityTable
            rows={rows}
            columns={columns}
            setRows={setRows}
            onActivitySelect={handleActivitySelect}
          />
        </div>
      </form>
    </section>
  )
}

export default AddSubparts
