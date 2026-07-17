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
import { updateSubStage, getActiveSubStagesByStageId } from '../../../features/subStageSlice'
import { fetchSingleStageById } from '../../../features/stageSlice'
import { fetchProjectById } from '../../../features/projectSlice'

const EditSubstageModal = ({ open, onClose, substage, stageId, projectNumber }) => {
  const dispatch = useDispatch()
  const { employees } = useSelector((state) => state.employee)
  
  const [formData, setFormData] = useState({
    substageName: '',
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
    if (substage) {
      setFormData({
        substageName: substage.substageName || substage.stageName || '',
        startDate: substage.startDate ? dayjs(substage.startDate) : null,
        endDate: substage.endDate ? dayjs(substage.endDate) : null,
        owner: substage.owner && substage.ownerId ? `${substage.owner}(${substage.ownerId})` : '',
        machine: substage.machine || '',
        duration: substage.duration || '',
        updateReason: '',
      })
    }
  }, [substage])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.substageName || !formData.owner || !formData.updateReason) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const updateData = {
        substageId: substage.substageId,
        stageId: stageId,
        projectNumber: projectNumber,
        parentSubstageId: substage.parentSubstageId || null,
        substageName: formData.substageName,  // Fixed: changed from substagename to substageName
        startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : null,
        owner: formData.owner,
        machine: formData.machine,
        duration: formData.duration,
        seqPrevStage: substage.seqPrevStage,
        progress: substage.progress || 0,
        updateReason: formData.updateReason,
        timestamp: new Date().toISOString(),
      }

      await dispatch(updateSubStage(updateData)).unwrap()
      toast.success('Substage updated successfully!')
      
      // Refresh data
      dispatch(getActiveSubStagesByStageId(stageId))
      dispatch(fetchSingleStageById(stageId))
      dispatch(fetchProjectById(projectNumber))
      
      onClose()
    } catch (error) {
      toast.error(error?.message || 'Failed to update substage')
      console.error('Error updating substage:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#0061A1', borderBottom: '2px solid #e5e7eb' }}>
        Edit Substage: {substage?.substageName || substage?.stageName}
      </DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Substage Name */}
          <TextField
            label="Substage Name*"
            value={formData.substageName}
            onChange={(e) => handleChange('substageName', e.target.value)}
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

export default EditSubstageModal
