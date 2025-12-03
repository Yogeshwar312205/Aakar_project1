import React, { useCallback, useEffect, useState } from 'react'
import { LuUpload } from 'react-icons/lu'
import { TextField } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

import '../AddProject/AddProject.css'
import { useDispatch, useSelector } from 'react-redux'

const ProjectForm = ({ inputValues, setInputValues, action }) => {
  const [isChanged, setIsChanged] = useState(false)
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target

      setInputValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))

      setIsChanged(true)
    },
    [setInputValues]
  )

  const handleProgressChange = useCallback(
    (e) => {
      const { name, value } = e.target

      // Prevent non-numeric and out-of-range values
      const numericValue = Math.min(100, Math.max(0, Number(value)))

      setInputValues((prevValues) => ({
        ...prevValues,
        [name]: isNaN(numericValue) ? 0 : numericValue, // Default to 0 if input is invalid
      }))
      setIsChanged(true)
    },
    [setInputValues]
  )

  const handleFileChange = useCallback(
    (e, fieldName) => {
      const file = e.target.files[0]
      setInputValues((prevValues) => ({
        ...prevValues,
        [fieldName]: file,
      }))
      setIsChanged(true)
    },
    [setInputValues]
  )

  useEffect(() => {
    if (action !== 'update') {
      setIsChanged(false)
    }
  }, [action])

  const inputs = [
    {
      label: 'Company name',
      width: '150px',
      name: 'companyName',
      value: inputValues.companyName,
      onChange: handleChange,
    },
    {
      label: 'Project number',
      width: '150px',
      name: 'projectNumber',
      value: inputValues.projectNumber,
      onChange: handleChange,
      type: 'number',
    },
    {
      label: 'Die name',
      width: '200px',
      type: 'text',
      name: 'dieName',
      value: inputValues.dieName,
      onChange: handleChange,
    },
    {
      label: 'Die number',
      width: '150px',
      name: 'dieNumber',
      value: inputValues.dieNumber,
      onChange: handleChange,
      type: 'text',
    },
    {
      label: 'Project type',
      width: '150px',
      type: 'text',
      name: 'projectType',
      value: inputValues.projectType,
      onChange: handleChange,
    },
  ]

  return (
    <>
      <h2>Project details</h2>
      <div className="container">
        {inputs.map((input) => (
          <TextField
            key={input.name}
            label={input.label}
            variant="outlined"
            type={input.type}
            sx={{
              width: input.width,
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
            name={input.name}
            value={input.value}
            onChange={input.onChange}
            required
          />
        ))}

        <div className="projectDetails">
          <TextField
            label="Select PO document"
            variant="outlined"
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
            InputProps={{
              sx: { borderRadius: 2 },
              readOnly: true,
            }}
            value={inputValues.projectPOLink?.name}
          />

          <div className="uploadContainer">
            <input
              type="file"
              name="projectPOLink"
              style={{ border: 'none', padding: '0' }}
              className="file-ip"
              onChange={(e) => handleFileChange(e, 'projectPOLink')}
            />
            <LuUpload style={{ fontSize: '1rem' }} className="uploadbtn" />
          </div>
        </div>
        <div className="projectDetails">
          <TextField
            label="Select design document"
            variant="outlined"
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
            InputProps={{
              sx: { borderRadius: 2 },
              readOnly: true,
            }}
            value={inputValues.projectDesignDocLink?.name}
          />
          <div className="uploadContainer">
            <input
              type="file"
              name="projectDesignDocLink"
              style={{ border: 'none' }}
              className="file-ip"
              onChange={(e) => handleFileChange(e, 'projectDesignDocLink')}
            />
            <LuUpload className="uploadbtn" />
          </div>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start date"
            value={inputValues.startDate ? dayjs(inputValues.startDate) : null}
            onChange={(newValue) => {
              const formattedDate = newValue
                ? dayjs(newValue).format('YYYY-MM-DD')
                : null
              setInputValues((prevValues) => ({
                ...prevValues,
                startDate: formattedDate,
              }))
            }}
            sx={{ width: '180px' }}
            renderInput={(params) => <TextField {...params} required />}
          />
          <DatePicker
            label="End date"
            value={inputValues.endDate ? dayjs(inputValues.endDate) : null}
            onChange={(newValue) => {
              const formattedDate = newValue
                ? dayjs(newValue).format('YYYY-MM-DD')
                : null
              setInputValues((prevValues) => ({
                ...prevValues,
                endDate: formattedDate,
              }))
            }}
            sx={{ width: '180px' }}
            renderInput={(params) => <TextField {...params} required />}
          />
        </LocalizationProvider>

        <FormControl>
          <InputLabel id="status-label">Project status</InputLabel>
          <Select
            required
            labelId="status-label"
            id="status"
            name="projectStatus"
            value={inputValues.projectStatus}
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
            label="Project Status"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </Select>
        </FormControl>

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
          value={inputValues.progress}
          onChange={handleProgressChange}
          required
        />

        {action == 'update' && isChanged && (
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

export default ProjectForm
