import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'
import { getAllEmployees } from '../../../features/employeeSlice'
import { toast } from 'react-toastify'
import { updateStage, fetchActiveStagesByProjectNumber, fetchSingleStageById } from '../../../features/stageSlice'
import { fetchProjectById } from '../../../features/projectSlice'

const EditStageModal = ({ open, onClose, stage, projectNumber }) => {
  const dispatch = useDispatch()
  const { employees } = useSelector((state) => state.employee)
  
  const [formData, setFormData] = useState({
    stageName: '',
    startDate: null,
    endDate: null,
    owner: '',
    machine: '',
    duration: '',
    updateReason: '',
  })

  const [employeeList, setEmployeeList] = useState([])

  useEffect(() => {
    dispatch(getAllEmployees())
  }, [dispatch])

  useEffect(() => {
    if (employees && employees.length > 0) {
      setEmployeeList(
        employees.map(
          (employee) =>
            `${employee.employee.employeeName}(${employee.employee.customEmployeeId})`
        )
      )
    }
  }, [employees])

  useEffect(() => {
    if (stage) {
      setFormData({
        stageName: stage.stageName || '',
        startDate: stage.startDate ? dayjs(stage.startDate) : null,
        endDate: stage.endDate ? dayjs(stage.endDate) : null,
        owner: stage.owner && stage.ownerId ? `${stage.owner}(${stage.ownerId})` : '',
        machine: stage.machine || '',
        duration: stage.duration || '',
        updateReason: '',
      })
    }
  }, [stage])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.stageName || !formData.owner || !formData.updateReason) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const updateData = {
        stageId: stage.stageId,
        projectNumber: projectNumber,
        stageName: formData.stageName,
        startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : null,
        owner: formData.owner,
        machine: formData.machine,
        duration: formData.duration,
        seqPrevStage: stage.seqPrevStage,
        progress: stage.progress || 0,
        updateReason: formData.updateReason,
        timestamp: new Date().toISOString(),
      }

      await dispatch(updateStage(updateData)).unwrap()
      toast.success('Stage updated successfully!')
      
      // Refresh data
      dispatch(fetchActiveStagesByProjectNumber(projectNumber))
      dispatch(fetchSingleStageById(stage.stageId))
      dispatch(fetchProjectById(projectNumber))
      
      onClose()
    } catch (error) {
      toast.error(error?.message || 'Failed to update stage')
      console.error('Error updating stage:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#0061A1', borderBottom: '2px solid #e5e7eb' }}>
        Edit Stage: {stage?.stageName}
      </DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stage Name */}
          <TextField
            label="Stage Name*"
            value={formData.stageName}
            onChange={(e) => handleChange('stageName', e.target.value)}
            fullWidth
            required
          />

          {/* Owner */}
          <Autocomplete
            options={employeeList}
            value={formData.owner}
            onChange={(e, newValue) => handleChange('owner', newValue)}
            renderInput={(params) => <TextField {...params} label="Owner*" required />}
            fullWidth
          />

          {/* Dates */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(val) => handleChange('startDate', val)}
                format="DD-MM-YYYY"
                sx={{ flex: 1 }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(val) => handleChange('endDate', val)}
                format="DD-MM-YYYY"
                sx={{ flex: 1 }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </div>
          </LocalizationProvider>

          {/* Machine and Duration */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
              label="Machine"
              value={formData.machine}
              onChange={(e) => handleChange('machine', e.target.value)}
              fullWidth
            />
            <TextField
              label="Duration (days)"
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              fullWidth
            />
          </div>

          {/* Update Reason */}
          <TextField
            label="Update Reason*"
            value={formData.updateReason}
            onChange={(e) => handleChange('updateReason', e.target.value)}
            multiline
            rows={3}
            fullWidth
            required
            placeholder="Please provide a reason for this update..."
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Button onClick={onClose} sx={{ color: '#6c757d' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ backgroundColor: '#0061A1', '&:hover': { backgroundColor: '#004d80' } }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditStageModal
