import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import {IP} from '../constants'

export const addProject = createAsyncThunk(
  'projects/addProject',
  async (project, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://${IP}:3000/api/projects`,

        project,

        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      )
      return response.data.data
    } catch (error) {
      console.log(error)

      return rejectWithValue(error)
    }
  }
)

export const fetchHistoryProjects = createAsyncThunk(
  'projects/fetchHistoryProjects',
  async (pNo = '') => {
    const response = await axios.get(
      `http://${IP}:3000/api/historyProjects/${pNo}`,
      { withCredentials: true }
    )
    console.log(response)
    return response.data
  }
)

export const fetchActiveProjects = createAsyncThunk(
  'projects/fetchActiveProjects',
  async () => {
    const response = await axios.get(
      `http://${IP}:3000/api/activeProjects`,
      {
        withCredentials:true
      }
    )
    console.log(response)
    return response.data
  }
)

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await axios.get(`http://${IP}:3000/api/projects`, {
      withCredentials: true,
    })
    console.log(response)
    return response.data
  }
)

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id = '') => {
    const response = await axios.get(
      `http://${IP}:3000/api/projects/${id}`,
      {
        withCredentials: true,
      }
    )
    console.log(response)
    return response.data
  }
)
export const updateProject = createAsyncThunk(
  'stages/updateProject',
  async ({ id = '', data = {} }) => {
    console.log(id)
    console.log(data)
    const response = await axios.put(
      `http://${IP}:3000/api/projects/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    )
    return response.data.data
  }
)

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id = '') => {
    const response = await axios.delete(
      `http://${IP}:3000/api/projects/${id}`,
      {
        withCredentials: true,
      }
    )
    return response.data.data
  }
)

const initialState = {
  projects: [],
  historyProjects: [],
  activeProjects: [],
  project: {},
  status: 'idle',
  error: null,
  loading: false,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState: initialState,
  reducers: {
    clearProjectsStatus: (state) => {
      state.status = null
    },
    clearProjectsError: (state) => {
      state.error = null
    },
    resetProjectState: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProject.pending, (state) => {
        state.loading = true
      })
      .addCase(addProject.fulfilled, (state, action) => {
        console.log(action)
        state.loading = false
        state.projects.push(action.payload)
        state.status = 'succeeded'
      })
      .addCase(addProject.rejected, (state, action) => {
        console.log(action)
        state.loading = false
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(fetchHistoryProjects.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchHistoryProjects.fulfilled, (state, action) => {
        state.loading = false
        console.log(action)
        state.historyProjects = action.payload.data
        state.status = action.payload.message
      })
      .addCase(fetchHistoryProjects.rejected, (state, action) => {
        state.loading = false
        console.log(action)
        state.status = 'failed'
        state.error = action.error.message
      })

    builder
      .addCase(fetchActiveProjects.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchActiveProjects.fulfilled, (state, action) => {
        state.loading = false
        console.log(action)
        state.activeProjects = action.payload.data
        state.status = action.payload.message
      })
      .addCase(fetchActiveProjects.rejected, (state, action) => {
        state.loading = false
        console.log(action)
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        console.log(action)
        state.projects = action.payload.data
        state.status = action.payload.message
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        console.log(action)
        state.status = 'failed'
        state.error = action.error.message
      })
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false
        state.project = action.payload.data
        state.status = action.payload.message
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded'
        console.log('state')
        console.log(...state.projects)
        const index = state.projects.findIndex(
          (project) => project.projectNumber === action.payload.projectNumber
        )
        state.projects[index] = action.payload
        state.project = action.payload
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.activeProjects = state.activeProjects.filter(
          (project) => project.projectNumber != action.payload
        )
        state.status = 'succeeded'
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed'
        console.log(action)
        state.error = action.error.message
      })
  },
})

export const projectsReducer = projectsSlice.reducer
export const { clearProjectsStatus, clearProjectsError, resetProjectState } =
  projectsSlice.actions
