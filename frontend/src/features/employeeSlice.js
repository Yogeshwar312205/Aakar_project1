// src/features/employeeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async Thunks for API calls
export const getAllEmployees = createAsyncThunk(
  'employees/getAllEmployees',
  async () => {
    const response = await axios.get(
      'http://localhost:3000/api/v1/employee/getAllEmployees',
      {
        withCredentials: true,
      }
    )
    console.log(response.data)
    return response.data
  }
)

export const addEmployee = createAsyncThunk(
  'employees/addEmployee',
  async (employeeData) => {
    console.log(employeeData)
    const response = await axios.post(
      'http://localhost:3000/api/v1/employee/addEmployee',
      employeeData
    )
    console.log(response.data)
    return response.data.data // Extracting the `data` object from the response
  }
)

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ employeeId, payload }) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/v1/employee/${employeeId}/with-relations`,
        payload // Pass the entire payload object as required by the API
      )
      return response.data
    } catch (error) {
      console.error('Error updating employee:', error)
      throw new Error(
        error.response?.data?.message ||
          'An error occurred while updating the employee.'
      )
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (employeeId) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/employee/deleteEmployee',
        { employeeId }
      )
      return employeeId // Return employeeId for removing it from the state
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw new Error(
        error.response?.data?.message ||
          'An error occurred while deleting the employee.'
      )
    }
  }
)

export const moveEmployee = createAsyncThunk(
  'employee/moveEmployee',
  async ({ employeeIds, toDepartmentId }, { dispatch, rejectWithValue }) => {
    try {
      console.log(
        'Moving employees',
        employeeIds,
        'to department',
        toDepartmentId
      )

      // Call the moveEmployee API
      const response = await axios.post(
        'http://localhost:3000/api/v1/employee/moveEmployee',
        {
          employeeIds,
          toDepartmentId,
        }
      )

      // After successful operation, trigger a re-fetch of all employees
      await dispatch(getAllEmployees())

      // Return the move success response for optional UI reporting
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'An error occurred while moving employees'
      )
    }
  }
)

export const deleteMultipleEmployees = createAsyncThunk(
  'employees/deleteMultipleEmployees',
  async (employeeIds, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/employee/deleteMultipleEmployees',
        employeeIds
      )

      await dispatch(getAllEmployees())
    } catch (error) {
      console.error('Error deleting employees:', error)
      return rejectWithValue(
        error.response?.data?.message ||
          'An error occurred while deleting employees.'
      )
    }
  }
)

// Initial State
const initialState = {
  employees: [],
  loading: false,
  error: null,
}

// Employee Slice
const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get All Employees
      .addCase(getAllEmployees.pending, (state) => {
        state.loading = true
      })
      .addCase(getAllEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload // Set the fetched employees
      })
      .addCase(getAllEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      // Add Employee
      .addCase(addEmployee.pending, (state) => {
        state.loading = true
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.loading = false

        const { employee, jobProfiles } = action.payload // Extract employee and job profile details
        console.log(employee, jobProfiles)
        // Add the new employee along with its job profiles to the state
        state.employees.push({
          ...employee,
          jobProfiles,
        })
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.employeeDetails = action.payload
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

      // Delete Employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false

        // Remove the deleted employee by filtering the state
        state.employees = state.employees.filter(
          (employee) => employee.employeeId !== action.payload
        )
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export default employeeSlice.reducer
