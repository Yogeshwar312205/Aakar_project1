import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  templates: [],
  template: {},
  loading: false,
  error: null,
  status: 'idle',
}

export const fetchAllTemplates = createAsyncThunk(
  'stageTemplates/fetchAll',
  async () => {
    const response = await axios.get('http://localhost:3000/api/templates', {
      withCredentials: true,
    })
    return response.data
  }
)

export const fetchTemplateById = createAsyncThunk(
  'stageTemplates/fetchById',
  async (id) => {
    const response = await axios.get(
      `http://localhost:3000/api/templates/${id}`,
      { withCredentials: true }
    )
    return response.data
  }
)

export const createTemplate = createAsyncThunk(
  'stageTemplates/create',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/templates',
        templateData,
        { withCredentials: true }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTemplate = createAsyncThunk(
  'stageTemplates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/templates/${id}`,
        data,
        { withCredentials: true }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteTemplate = createAsyncThunk(
  'stageTemplates/delete',
  async (id) => {
    const response = await axios.delete(
      `http://localhost:3000/api/templates/${id}`,
      { withCredentials: true }
    )
    return response.data.data
  }
)

export const applyTemplate = createAsyncThunk(
  'stageTemplates/apply',
  async ({ templateId, projectNumber }) => {
    const response = await axios.post(
      `http://localhost:3000/api/templates/${templateId}/apply`,
      { projectNumber },
      { withCredentials: true }
    )
    return response.data
  }
)

const stageTemplateSlice = createSlice({
  name: 'stageTemplates',
  initialState,
  reducers: {
    clearTemplateStatus: (state) => {
      state.status = 'idle'
    },
    clearTemplateError: (state) => {
      state.error = null
    },
    resetTemplateState: () => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTemplates.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload.data
        state.status = 'succeeded'
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(fetchTemplateById.pending, (state) => {
        state.loading = true
        state.status = 'loading'
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.loading = false
        state.template = action.payload.data
        state.status = 'succeeded'
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(createTemplate.pending, (state) => {
        state.loading = true
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false
        state.templates = state.templates.filter(
          (t) => t.templateId != action.payload
        )
        state.status = 'succeeded'
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(applyTemplate.pending, (state) => {
        state.loading = true
      })
      .addCase(applyTemplate.fulfilled, (state) => {
        state.loading = false
        state.status = 'succeeded'
      })
      .addCase(applyTemplate.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const stageTemplateReducer = stageTemplateSlice.reducer
export const { clearTemplateStatus, clearTemplateError, resetTemplateState } =
  stageTemplateSlice.actions
