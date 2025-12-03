import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { IP } from '../constants'

const initialSubStageState = {
  substage: {},
  substages: [],
  historySubStages: [],
  activeSubStages: [],
  loading: false,
  error: null,
}

export const addSubStage = createAsyncThunk(
  'subStages/addStage',
  async (stage) => {
    const response = await axios.post(
      `http://${IP}:3000/api/subStages`,
      stage,
      {
        withCredentials: true,
      }
    )
    return response.data.data
  }
)

export const updateSubStage = createAsyncThunk(
  'stages/updateSubStage',
  async (s) => {
    console.log(s)
    const response = await axios.put(
      `http://${IP}:3000/api/subStages/${s.substageId}`,
      s,
      {
        withCredentials: true,
      }
    )
    return response.data.data
  }
)

export const getActiveSubStagesByStageId = createAsyncThunk(
  'stage/getActiveSubStagesByStageId',
  async (id = '') => {
    const response = await axios.get(
      `http://${IP}:3000/api/activeSubStages/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data
  }
)

export const getHistorySubStagesBySubStageId = createAsyncThunk(
  'stage/getHistorySubStagesBySubStageId',
  async (id = '') => {
    const response = await axios.get(
      `http://${IP}:3000/api/historySubStages/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data
  }
)

export const getSubStagesByStageId = createAsyncThunk(
  'stage/getSubStagesByStageId',
  async (id = '') => {
    const response = await axios.get(
      `http://${IP}:3000/api/subStages/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data
  }
)

export const getSubStagesByProjectNumber = createAsyncThunk(
  'stage/getSubStagesByProjectNumber',
  async (id = '') => {
    const response = await axios.get(
      `http://${IP}:3000/api/project/subStages/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data
  }
)

export const deleteSubStage = createAsyncThunk(
  'projects/deleteSubStage',
  async (id = '') => {
    console.log(id)
    const response = await axios.delete(
      `http://${IP}:3000/api/subStages/${id}`,
      {
        withCredentials: true,
      }
    )
    console.log(response)
    return response.data.data
  }
)

const substageSlice = createSlice({
  name: 'substages',
  initialState: initialSubStageState,
  reducers: {
    clearErrors: (state) => {
      state.error = null
    },
    resetSubstageState: (state) => {
      return initialSubStageState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSubStage.pending, (state) => {
        state.loading = true
      })
      .addCase(addSubStage.fulfilled, (state, action) => {
        console.log(action)
        state.loading = false
        state.substages.push(action.payload)
        state.status = 'succeeded'
      })
      .addCase(addSubStage.rejected, (state, action) => {
        console.log(action)
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(updateSubStage.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(updateSubStage.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
        const index = state.substages.findIndex(
          (stage) => stage.stageId == action.payload.stageId
        )
        state.substages[index] = action.payload
      })
      .addCase(updateSubStage.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(getActiveSubStagesByStageId.pending, (state) => {
        state.loading = true
      })
      .addCase(getActiveSubStagesByStageId.fulfilled, (state, action) => {
        state.loading = false
        state.activeSubStages = action.payload.data
        state.status = action.payload.message
      })
      .addCase(getActiveSubStagesByStageId.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(getHistorySubStagesBySubStageId.pending, (state) => {
        state.loading = true
      })
      .addCase(getHistorySubStagesBySubStageId.fulfilled, (state, action) => {
        state.loading = false
        state.historySubStages = action.payload.data
        state.status = action.payload.message
      })
      .addCase(getHistorySubStagesBySubStageId.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(getSubStagesByStageId.pending, (state) => {
        state.loading = true
      })
      .addCase(getSubStagesByStageId.fulfilled, (state, action) => {
        state.loading = false
        state.substages = action.payload.data
        state.status = action.payload.message
      })
      .addCase(getSubStagesByStageId.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(getSubStagesByProjectNumber.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(getSubStagesByProjectNumber.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
        console.log({ action: action.payload })
        state.substages = action.payload.data
      })
      .addCase(getSubStagesByProjectNumber.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(deleteSubStage.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteSubStage.fulfilled, (state, action) => {
        state.loading = false
        console.log({ action: action })
        state.activeSubStages = state.activeSubStages.filter(
          (stage) => stage.substageId != action.payload
        )
        state.status = 'succeeded'
      })
      .addCase(deleteSubStage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const substageReducer = substageSlice.reducer
export const { clearErrors, resetSubstageState } = substageSlice.actions
