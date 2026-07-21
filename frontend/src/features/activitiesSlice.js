// src/features/activitiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { activityCache } from '../utils/activityCache'

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
    // Check cache first
    const cacheKey = `substage_${substageId}`;
    const cached = activityCache.get(cacheKey);
    if (cached) {
      console.log('✅ Using cached activities for substage:', substageId);
      return { substageId, payload: { data: cached } };
    }

    try {
      const resp = await axios.get(
        `${API_BASE_URL}/activeActivities/${substageId}`,
        { withCredentials: true }
      )
      
      const activities = resp.data?.data || [];
      
      // Cache the result
      activityCache.set(cacheKey, activities);
      console.log('📦 Cached activities for substage:', substageId);
      
      return { substageId, payload: resp.data }
    } catch (err) {
      // If backend returns 404 for no activities, treat as empty list instead of erroring
      if (err?.response?.status === 404) {
        activityCache.set(cacheKey, []);
        return { substageId, payload: { data: [] } }
      }
      throw err
    }
  }
)

// NEW: Batch fetch activities for multiple substages
export const fetchActivitiesBatch = createAsyncThunk(
  'activities/fetchBatch',
  async (substageIds) => {
    if (!substageIds || substageIds.length === 0) {
      return {};
    }

    console.log('🚀 Batch fetching activities for', substageIds.length, 'substages');

    try {
      const resp = await axios.post(
        `${API_BASE_URL}/batch-substage-activities`,
        { substageIds },
        { withCredentials: true }
      );

      const grouped = resp.data?.data || {};
      
      // Cache each substage's activities
      Object.entries(grouped).forEach(([subId, activities]) => {
        const cacheKey = `substage_${subId}`;
        activityCache.set(cacheKey, activities);
        console.log('📦 Cached', activities.length, 'activities for substage:', subId);
      });

      console.log('✅ Batch fetch completed:', Object.keys(grouped).length, 'substages');

      return grouped;
    } catch (err) {
      console.error('❌ Batch fetch failed:', err);
      throw err;
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
    
    // Invalidate cache for this substage
    activityCache.invalidate(`substage_${substageId}`);
    console.log('🗑️ Cache invalidated for substage:', substageId);
    
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
    
    // Invalidate cache for this substage
    activityCache.invalidate(`substage_${substageId}`);
    console.log('🗑️ Cache invalidated for substage:', substageId);
    
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
  reducers: {
    setBatchActivities: (state, action) => {
      // action.payload is { [substageId]: [activities] }
      state.activitiesBySubstage = {
        ...state.activitiesBySubstage,
        ...action.payload
      };
    },
  },
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

      // Batch fetch cases
      .addCase(fetchActivitiesBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesBatch.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is { [substageId]: [activities] }
        state.activitiesBySubstage = {
          ...state.activitiesBySubstage,
          ...action.payload
        };
      })
      .addCase(fetchActivitiesBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to batch fetch activities';
      })
  },
})

export const { setBatchActivities } = activitiesSlice.actions;
export default activitiesSlice.reducer


