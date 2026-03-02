import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialStageState = {
  stage: {},
  stages: [],
  historyStages: [],
  activeStages: [],
  loading: false,
  error: null,
}

export const addStage = createAsyncThunk('stages/addStage', async (stage) => {
  const response = await axios.post('http://localhost:3000/api/stages', stage, {
    withCredentials: true,
  })
  return response.data.data
})

export const deleteStage = createAsyncThunk(
  'projects/deleteStage',
  async (id = '') => {
    console.log(id)
    const response = await axios.delete(
      `http://localhost:3000/api/stages/${id}`,
      {
        withCredentials: true,
      }
    )
    console.log(response)
    return response.data.data
  }
)

export const fetchSingleStageById = createAsyncThunk(
  'stage/fetchStageById',
  async (id = '') => {
    const response = await axios.get(`http://localhost:3000/api/stage/${id}`, {
      withCredentials: true,
    })
    return response.data
  }
)

export const fetchHistoryStagesByStageId = createAsyncThunk(
  'stages/fetchHistoryStagesByStageId',
  async (id = '') => {
    const response = await axios.get(
      `http://localhost:3000/api/historyStages/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data.data
  }
)

export const fetchActiveStagesByProjectNumber = createAsyncThunk(
  'stages/fetchActiveStagesByProjectNumber',
  async (id = '') => {
    const response = await axios.get(
      `http://localhost:3000/api/activeStages/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data.data
  }
)

export const fetchStagesByPno = createAsyncThunk(
  'stages/fetchStagesByPno',
  async (id = '') => {
    const response = await axios.get(`http://localhost:3000/api/stages/${id}`, {
      withCredentials: true,
    })
    return response.data.data
  }
)

export const stageList = createAsyncThunk('stages/stageList', async () => {
  const response = await axios.get('http://localhost:3000/api/stages/list', {
    withCredentials: true,
  })
  return response.data.data
})

export const updateStage = createAsyncThunk('stages/updateStage', async (s) => {
  console.log(s)
  const response = await axios.put(
    `http://localhost:3000/api/stages/${s.stageId}`,
    s,
    {
      withCredentials: true,
    }
  )
  return response.data.data
})

const stageSlice = createSlice({
  name: 'Stages',
  initialState: initialStageState,
  reducers: {
    clearErrors: (state) => {
      state.error = null
    },
    resetStageState: (state) => {
      return initialStageState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addStage.pending, (state) => {
        state.loading = true
      })
      .addCase(addStage.fulfilled, (state, action) => {
        console.log(action)
        state.loading = false
        state.stages.push(action.payload)
        state.status = 'succeeded'
      })
      .addCase(addStage.rejected, (state, action) => {
        console.log(action)
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(deleteStage.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteStage.fulfilled, (state, action) => {
        state.loading = false
        console.log({ action: action })
        state.activeStages = state.activeStages.filter(
          (stage) => stage.stageId != action.payload
        )
        state.status = 'succeeded'
      })
      .addCase(deleteStage.rejected, (state, action) => {
        state.loading = false
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(fetchSingleStageById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSingleStageById.fulfilled, (state, action) => {
        state.loading = false
        state.stage = action.payload.data
        state.status = action.payload.message
      })
      .addCase(fetchSingleStageById.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(fetchStagesByPno.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(fetchStagesByPno.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
        state.stages = action.payload
      })
      .addCase(fetchStagesByPno.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(fetchHistoryStagesByStageId.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchHistoryStagesByStageId.fulfilled, (state, action) => {
        state.loading = false
        state.historyStages = action.payload
      })
      .addCase(fetchHistoryStagesByStageId.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(fetchActiveStagesByProjectNumber.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(fetchActiveStagesByProjectNumber.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
        state.activeStages = action.payload
      })
      .addCase(fetchActiveStagesByProjectNumber.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(updateStage.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(updateStage.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
        const index = state.stages.findIndex(
          (stage) => stage.stageId == action.payload.stageId
        )
        state.stages[index] = action.payload
      })
      .addCase(updateStage.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(stageList.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(stageList.fulfilled, (state, action) => {
        state.loading = false
        state.stages = action.payload
      })
      .addCase(stageList.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
  },
})

export const stageReducer = stageSlice.reducer
export const { clearErrors, resetStageState } = stageSlice.actions
