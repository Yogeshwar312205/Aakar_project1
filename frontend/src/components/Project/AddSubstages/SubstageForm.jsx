import React, { useState } from 'react'
import '../AddProject/AddProject.css'
import { TextField, Autocomplete } from '@mui/material'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { differenceInDays } from 'date-fns'

const SubstageForm = ({
  inputValues,
  setInputValues,
  stagesList,
  employeeList,
}) => {
  const [isChanged, setIsChanged] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedValues = { ...inputValues, [name]: value }

    if (name === 'progress') {
      // Constrain progress to be between 0 and 100
      const numericValue = Math.min(100, Math.max(0, Number(value)))
      updatedValues[name] = isNaN(numericValue) ? 0 : numericValue
    } else if (name === 'startDate' || name === 'endDate') {
      const startDate = new Date(updatedValues.startDate)
      const endDate = new Date(updatedValues.endDate)

      // Calculate duration if both dates are available
      updatedValues.duration =
        updatedValues.startDate && updatedValues.endDate
          ? differenceInDays(endDate, startDate)
          : 0

      if (
        name === 'endDate' &&
        updatedValues.endDate < updatedValues.startDate
      ) {
        updatedValues.endDate = ''
        updatedValues.duration = 0
      }
    }

    setInputValues(updatedValues)
    setIsChanged(true)
  }
  const handleDurationChange = (e) => {
    const { value } = e.target
    const durationInDays = parseInt(value, 10)
    const updatedValues = { ...inputValues }

    if (!isNaN(durationInDays) && durationInDays >= 0) {
      const startDate = new Date(updatedValues.startDate)

      if (!isNaN(startDate.getTime())) {
        const newEndDate = new Date(startDate)
        newEndDate.setDate(startDate.getDate() + durationInDays)
        updatedValues.endDate = newEndDate.toISOString().split('T')[0]
      }
    } else {
      updatedValues.endDate = ''
    }

    updatedValues.duration = durationInDays
    setInputValues(updatedValues)
    setIsChanged(true)
  }

  const handleDateChange = (date, fieldName) => {
    const formattedDate = date
      ? dayjs(date).utcOffset('+05:30').format('YYYY-MM-DD')
      : null

    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: formattedDate,
    }))
  }

  return (
    <>
      <h2>Stage details</h2>
      <div className="container">
        <Autocomplete
          disablePortal
          options={stagesList}
          freeSolo
          value={inputValues.stageName || ''}
          onChange={(event, newValue) => {
            handleChange({ target: { name: 'stageName', value: newValue } })
          }}
          onInputChange={(event, newInputValue) => {
            if (newInputValue !== inputValues.stageName) {
              handleChange({
                target: { name: 'stageName', value: newInputValue },
              })
            }
          }}
          sx={{
            width: '200px',
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Stage Name"
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
          value={inputValues.owner || ''}
          onInputChange={(event, newInputValue) => {
            console.log({ newInputValue: newInputValue })
            if (newInputValue !== inputValues.owner) {
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
              label="Stage owner"
              name="owner"
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
              required
            />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={inputValues.startDate ? dayjs(inputValues.startDate) : null}
            onChange={(date) => handleDateChange(date, 'startDate')}
            sx={{ width: '200px' }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  width: '200px',
                  '& .MuiInputBase-input': { height: '50px', fontSize: '1rem' },
                }}
              />
            )}
            required
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="End Date"
            value={inputValues.endDate ? dayjs(inputValues.endDate) : null}
            onChange={(date) => handleDateChange(date, 'endDate')}
            sx={{ width: '200px' }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  width: '200px',
                  '& .MuiInputBase-input': { height: '50px', fontSize: '1rem' },
                }}
              />
            )}
            required
          />
        </LocalizationProvider>
        <TextField
          label="Machine"
          variant="outlined"
          sx={{
            width: '200px',
            '& .MuiOutlinedInput-root': {
              height: '50px',
            },
            '& .MuiFormLabel-root': {
              height: '50px',
              lineHeight: '50px',
              top: '-15px',
            },
          }}
          name="machine"
          value={inputValues.machine}
          onChange={handleChange}
        />
        <TextField
          label="Duration(Hrs)"
          variant="outlined"
          sx={{
            width: '150px',
            '& .MuiOutlinedInput-root': {
              height: '50px',
            },
            '& .MuiFormLabel-root': {
              height: '50px',
              lineHeight: '50px',
              top: '-15px',
            },
          }}
          name="duration"
          value={inputValues.duration}
          onChange={handleDurationChange}
          required
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
            inputValues.progress < 0
              ? 0
              : inputValues.progress > 100
              ? 100
              : inputValues.progress
          }
          onChange={handleChange}
          required
        />
        {isChanged && (
          <TextField
            label="Reason"
            variant="outlined"
            name="updateReason"
            value={inputValues.updateReason}
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
    </>
  )
}

export default SubstageForm
