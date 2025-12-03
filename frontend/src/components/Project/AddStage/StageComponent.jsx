import React, { useRef, useCallback, useEffect, useState } from 'react'
import { RiDeleteBinLine } from 'react-icons/ri'
import { TextField, Autocomplete } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch, useSelector } from 'react-redux'
import { getAllEmployees } from '../../../features/employeeSlice'

const StageComponent = ({
  stage,
  stages,
  setStages,
  index,
  action,
  isChanged,
  setIsChanged,
  name,
}) => {
  const dispatch = useDispatch()
  const { stages: stagesList } = useSelector((state) => state.stages)
  const { employees } = useSelector((state) => state.employee)
  const [employeeList, setEmployeeList] = useState(
    employees.map(
      (employee) =>
        `${employee.employee.employeeName}(${employee.employee.customEmployeeId})`
    )
  )
  useEffect(() => {
    dispatch(getAllEmployees())
  }, [dispatch])
  useEffect(() => {
    setEmployeeList(
      employees.map(
        (employee) =>
          `${employee.employee.employeeName}(${employee.employee.customEmployeeId})`
      )
    )
  }, [employees])
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  const handleChange = useCallback(
    (e, field) => {
      const updatedStages = [...stages]

      if (field === 'startDate' || field === 'endDate') {
        updatedStages[index][field] = e ? dayjs(e).format('YYYY-MM-DD') : ''
      } else {
        const { name, value } = e.target

        if (name === 'progress') {
          // Ensure progress stays within bounds (0–100)
          const numericValue = Math.min(100, Math.max(0, Number(value)))
          updatedStages[index][name] = isNaN(numericValue) ? 0 : numericValue
        } else {
          updatedStages[index][name] = value
        }
      }

      if (updatedStages[index].endDate < updatedStages[index].startDate) {
        updatedStages[index].endDate = ''
        updatedStages[index].duration = 0
      }

      setStages(updatedStages)

      setIsChanged((prev) => {
        const updated = [...prev]
        updated[index] = true
        return updated
      })
    },
    [index, stages, setStages, setIsChanged]
  )

  const handleDeleteStage = useCallback(() => {
    setStages((prevStages) => prevStages.filter((_, i) => i !== index))
    setIsChanged((prev) => prev.filter((_, i) => i !== index))
  }, [index, setStages, setIsChanged])

  return (
    <div
      className="stageDetails"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <p className="serialNo">{index + 1}.</p>
      <div className="stageFields" style={{ margin: '0' }}>
        <Autocomplete
          disablePortal
          freeSolo
          value={stage.stageName || ''}
          onInputChange={(event, newInputValue) => {
            // Only update if the new value is different from the current value
            if (newInputValue !== stage.stageName) {
              handleChange({
                target: { name: 'stageName', value: newInputValue },
              })
            }
          }}
          options={stagesList}
          sx={{
            width: '200px',
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={name == 'substage' ? 'Substage Name' : 'Stage Name'}
              name="stageName"
              sx={{
                width: '180px',
                borderRadius: '1px solid #7D7D7D',
                '& .MuiOutlinedInput-root': {
                  height: '50px',
                },
                '& .MuiFormLabel-root': {
                  height: '50px',
                  lineHeight: '50px',
                  top: '-15px',
                },
              }}
              required
            />
          )}
        />
        <Autocomplete
          disablePortal
          freeSolo
          value={stage.owner || ''}
          onInputChange={(event, newInputValue) => {
            if (newInputValue !== stage.owner) {
              handleChange({
                target: { name: 'owner', value: newInputValue },
              })
            }
          }}
          options={employeeList}
          sx={{
            width: '200px',
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Owner"
              name="owner"
              sx={{
                width: '150px',
                borderRadius: '1px solid #7D7D7D',
                '& .MuiOutlinedInput-root': {
                  height: '50px',
                },
                '& .MuiFormLabel-root': {
                  height: '50px',
                  lineHeight: '50px',
                  top: '-15px',
                },
              }}
              required
            />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start date"
            value={dayjs(stage.startDate)}
            onChange={(date) => handleChange(date, 'startDate')}
            sx={{
              width: '200px',
              borderRadius: '1px solid #7D7D7D',
              '& .MuiOutlinedInput-root': {
                height: '50px',
              },
              '& .MuiFormLabel-root': {
                height: '50px',
                lineHeight: '50px',
                top: '-15px',
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  width: '200px',
                  borderRadius: '1px solid #7D7D7D',
                  '& .MuiOutlinedInput-root': {
                    height: '50px',
                  },
                  '& .MuiFormLabel-root': {
                    height: '50px',
                    lineHeight: '50px',
                    top: '-15px',
                  },
                }}
              />
            )}
            required
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="End date"
            value={dayjs(stage.endDate)}
            onChange={(date) => handleChange(date, 'endDate')}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  width: '200px',
                  borderRadius: '1px solid #7D7D7D',
                  '& .MuiOutlinedInput-root': {
                    height: '50px',
                  },
                  '& .MuiFormLabel-root': {
                    height: '50px',
                    lineHeight: '50px',
                    top: '-15px',
                  },
                }}
              />
            )}
            required
            sx={{
              width: '200px',
              borderRadius: '1px solid #7D7D7D',
              '& .MuiOutlinedInput-root': {
                height: '50px',
              },
              '& .MuiFormLabel-root': {
                height: '50px',
                lineHeight: '50px',
                top: '-15px',
              },
            }}
          />
        </LocalizationProvider>
        <TextField
          label="Machine"
          variant="outlined"
          name="machine"
          value={stage.machine}
          onChange={handleChange}
          sx={{
            width: '150px',
            borderRadius: '1px solid #7D7D7D',
            '& .MuiOutlinedInput-root': {
              height: '50px',
            },
            '& .MuiFormLabel-root': {
              height: '50px',
              lineHeight: '50px',
              top: '-15px',
            },
          }}
        />
        <TextField
          type="number"
          label="Duration(Hrs)"
          variant="outlined"
          name="duration"
          value={stage.duration}
          onChange={(e) => handleChange(e)}
          required
          sx={{
            width: '200px',
            borderRadius: '1px solid #7D7D7D',
            '& .MuiOutlinedInput-root': {
              height: '50px',
            },
            '& .MuiFormLabel-root': {
              height: '50px',
              lineHeight: '50px',
              top: '-15px',
            },
          }}
        />

        <TextField
          label="Progress(%)"
          variant="outlined"
          type="number"
          sx={{
            width: '130px',
            borderRadius: '1px solid #7D7D7D',
            '& .MuiOutlinedInput-root': {
              height: '50px',
            },
            '& .MuiFormLabel-root': {
              height: '50px',
              lineHeight: '50px',
              top: '-15px',
            },
          }}
          name="progress"
          value={
            stage.progress < 0 ? 0 : stage.progress > 100 ? 100 : stage.progress
          }
          onChange={(e) => handleChange(e, 'progress')}
          required
        />
        {action === 'update' && isChanged[index] && (
          <TextField
            label="Reason"
            variant="outlined"
            name="updateReason"
            value={stage.updateReason}
            onChange={(e) => handleChange(e)}
            required
            sx={{
              width: '200px',
              borderRadius: '1px solid #7D7D7D',
              '& .MuiOutlinedInput-root': {
                height: '50px',
              },
              '& .MuiFormLabel-root': {
                height: '50px',
                lineHeight: '50px',
                top: '-15px',
              },
            }}
          />
        )}
      </div>
      <div className="option-icons">
        <button className="option" onClick={handleDeleteStage}>
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  )
}

export default StageComponent
