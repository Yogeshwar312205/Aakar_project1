import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { FiTrash2, FiPlus, FiArrowLeftCircle } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addActivity, deleteActivity, fetchActivities } from '../../features/activitiesSlice'
import './Activities.css'

const initialFormState = {
  activity_name: '',
}

const Activities = () => {
  const dispatch = useDispatch()
  const { activities: activitiesState, loading } = useSelector((state) => state.activities)
  const [error, setError] = useState('')
  const [formValues, setFormValues] = useState(initialFormState)
  const [saving, setSaving] = useState(false)

  const canSave = useMemo(() => {
    if (!formValues.activity_name) return false
    return true
  }, [formValues.activity_name])

  const load = useCallback(() => {
    setError('')
    dispatch(fetchActivities())
  }, [dispatch])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleAdd = useCallback(async () => {
    if (!canSave) return
    try {
      setSaving(true)
      setError('')
      await dispatch(addActivity({ activity_name: formValues.activity_name }))
      setFormValues(initialFormState)
      // No refetch; rely on optimistic slice update
    } catch (err) {
      setError('Failed to add activity')
    } finally {
      setSaving(false)
    }
  }, [canSave, dispatch, formValues.activity_name])

  const handleDelete = useCallback(async (activityId) => {
    try {
      setError('')
      await dispatch(deleteActivity(activityId))
      // No refetch; rely on optimistic slice update
    } catch (err) {
      setError('Failed to delete activity')
    }
  }, [dispatch])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use activities directly from Redux to avoid duplicate state

  return (
    <section className="activities-page">
      <div className="activities-head">
        <div className="left">
          <FiArrowLeftCircle
            size={28}
            className="text-[#0061A1] hover:cursor-pointer"
            onClick={() => window.history.back()}
          />
          <div className="title">
            <span>Dashboard / </span>
            <span className="font-semibold">Substage Activities</span>
          </div>
        </div>
        <div />
      </div>

      <Paper className="activities-form">
        <Toolbar disableGutters>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Add activity
          </Typography>
        </Toolbar>
        <Box className="form-grid">
          <TextField
            label="Activity name"
            name="activity_name"
            value={formValues.activity_name}
            onChange={handleInputChange}
            required
            sx={{ width: '260px' }}
          />
          <Box className="actions">
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={handleAdd}
              disabled={!canSave || saving}
            >
              Add
            </Button>
          </Box>
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Paper>

      <Paper 
        className="activities-table"
        sx={{
          marginTop: '10px',
          padding: '10px 20px',
          borderRadius: '10px !important',
          boxShadow: '3px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TableContainer className="TableComponent-custom-scrollbar">
          <Table aria-label="activities table" size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#FFFFFF',
                    color: '#002773',
                    fontSize: '16px',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    padding: '16px 8px'
                  }}
                >
                  Sr. No.
                </TableCell>
                <TableCell 
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#FFFFFF',
                    color: '#002773',
                    fontSize: '16px',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    padding: '16px 8px'
                  }}
                >
                  Activity name
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#FFFFFF',
                    color: '#002773',
                    fontSize: '16px',
                    textAlign: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    padding: '16px 8px'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : activitiesState.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No activities found.
                  </TableCell>
                </TableRow>
              ) : (
                activitiesState.map((activity, index) => (
                  <ActivityRow
                    key={activity.activityid || activity.id || index}
                    index={index}
                    activity={activity}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </section>
  )
}

const ActivityRow = memo(function ActivityRow({ index, activity, onDelete }) {
  const activityId = activity.activityid || activity.id
  const handleClick = useCallback(() => {
    onDelete(activityId)
  }, [onDelete, activityId])

  return (
    <TableRow
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(45, 84, 161, 0.1)',
        },
      }}
    >
      <TableCell 
        align="left"
        sx={{
          textAlign: 'left',
          fontSize: '14px',
          padding: '14px 8px'
        }}
      >
        {index + 1}
      </TableCell>
      <TableCell 
        align="left"
        sx={{
          textAlign: 'left',
          fontSize: '14px',
          padding: '14px 8px'
        }}
      >
        {activity.activity_name}
      </TableCell>
      <TableCell 
        align="center"
        sx={{
          textAlign: 'center',
          fontSize: '14px',
          padding: '14px 8px'
        }}
      >
        <IconButton 
          aria-label="delete" 
          onClick={handleClick}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 97, 161, 0.1)',
            }
          }}
        >
          <FiTrash2 className="option-icon" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
})

export default Activities


