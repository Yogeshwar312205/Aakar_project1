// src/features/activitiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/v1/activity'

export const fetchActivities = createAsyncThunk(
  'activities/fetchAll',
  async () => {
    const resp = await axios.get(`${API_BASE_URL}/getallactivities`)
    return resp.data
  }
)

export const fetchActivitiesBySubstageId = createAsyncThunk(
  'activities/fetchBySubstage',
  async (substageId) => {
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/activeActivities/${substageId}`,
        { withCredentials: true }
      )
      return { substageId, payload: resp.data }
    } catch (err) {
      // If backend returns 404 for no activities, treat as empty list instead of erroring
      if (err?.response?.status === 404) {
        return { substageId, payload: { data: [] } }
      }
      throw err
    }
  }
)

export const addActivity = createAsyncThunk(
  'activities/add',
  async ({ activity_name }) => {
    const resp = await axios.post(`${API_BASE_URL}/addactivity`, { activity_name })
    // API returns { activity_id, activity_name }
    return resp.data
  }
)

export const deleteActivity = createAsyncThunk(
  'activities/delete',
  async (activityId) => {
    await axios.delete(`${API_BASE_URL}/deleteactivity/${activityId}`)
    return activityId
  }
)

export const mapActivityToSubstage = createAsyncThunk(
  'activities/mapToSubstage',
  async ({ substageId, activityName }, thunkAPI) => {
    const resp = await axios.post(`${API_BASE_URL}/substage-activity`, { substageId, activityName }, { withCredentials: true })
    // Refresh activities for this substage so frontend gets canonical activityIds from backend
    try {
      thunkAPI.dispatch(fetchActivitiesBySubstageId(substageId))
    } catch (e) {
      // ignore
    }
    return { substageId, activityName, status: resp.status }
  }
)

export const unmapActivityFromSubstage = createAsyncThunk(
  'activities/unmapFromSubstage',
  async ({ substageId, activityId, activityName }, thunkAPI) => {
    // send either activityId or activityName as query params
    const params = { substageId }
    if (activityId) params.activityId = activityId
    else if (activityName) params.activityName = activityName
    const resp = await axios.delete(`${API_BASE_URL}/substage-activity`, { params, withCredentials: true })
    try {
      thunkAPI.dispatch(fetchActivitiesBySubstageId(substageId))
    } catch (e) {
      // ignore
    }
    return { substageId, activityId, activityName, status: resp.status }
  }
)

const initialState = {
  activities: [],
  activitiesBySubstage: {},
  loading: false,
  error: null,
}

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false
        state.activities = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchActivitiesBySubstageId.pending, (state) => {
        // we don't toggle global loading to avoid table blinking
        state.error = null
      })
      .addCase(fetchActivitiesBySubstageId.fulfilled, (state, action) => {
        const { substageId, payload } = action.payload
        // payload is ApiResponse-shaped: { message, data }
        state.activitiesBySubstage = {
          ...state.activitiesBySubstage,
          [substageId]: Array.isArray(payload.data) ? payload.data : [],
        }
      })
      .addCase(mapActivityToSubstage.fulfilled, (state, action) => {
        const { substageId, activityName } = action.payload
        const list = state.activitiesBySubstage[substageId] || []
        // Add a mapping entry by name (avoid touching activityId which is auto-increment on mapping table)
        const existsByName = list.find((a) => (a.activityName ?? a.activity_name ?? '').toString().trim().toLowerCase() === String(activityName).trim().toLowerCase())
        if (!existsByName) {
          list.push({ activityName })
          state.activitiesBySubstage = { ...state.activitiesBySubstage, [substageId]: list }
        }
      })
      .addCase(unmapActivityFromSubstage.fulfilled, (state, action) => {
        const { substageId, activityId, activityName } = action.payload
        const list = state.activitiesBySubstage[substageId] || []
        if (activityId) {
          state.activitiesBySubstage = { ...state.activitiesBySubstage, [substageId]: list.filter((a) => (a.activityId || a.activityid || a.activityid) != activityId) }
        } else if (activityName) {
          // remove by matching normalized display name
          const nameNormalized = String(activityName).trim().toLowerCase()
          state.activitiesBySubstage = { ...state.activitiesBySubstage, [substageId]: list.filter((a) => {
            const rawId = a.activityId ?? a.activityid ?? a.activity_name ?? a.activityName
            const display = (a.activityName ?? a.activity_name ?? (rawId === undefined || rawId === null ? '' : String(rawId))).toString()
            return display.trim().toLowerCase() !== nameNormalized
          }) }
        }
      })
      .addCase(fetchActivitiesBySubstageId.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to load activities for substage'
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false
        state.error = action.error?.message || 'Failed to load activities'
      })

      .addCase(addActivity.pending, (state) => {
        // Do not toggle global loading to avoid table blinking
        state.error = null
      })
      .addCase(addActivity.fulfilled, (state, action) => {
        const created = action.payload
        // Normalize to match list shape fields used by UI
        state.activities.push({
          activityid: created.activity_id,
          activity_name: created.activity_name,
        })
      })
      .addCase(addActivity.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to add activity'
      })

      .addCase(deleteActivity.pending, (state) => {
        state.error = null
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        const id = action.payload
        state.activities = state.activities.filter(
          (a) => (a.activityid || a.id) !== id
        )
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to delete activity'
      })
  },
})

export default activitiesSlice.reducer


