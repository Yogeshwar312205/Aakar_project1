// departmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1/department';

// Thunks
export const fetchAllDepartments = createAsyncThunk(
    'department/fetchAllDepartments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getAllDepartments`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch departments');
        }
    }
);

export const fetchAllWorkingDepartments = createAsyncThunk(
    'department/fetchAllWorkingDepartments',
    async (_, { rejectWithValue }) => {
        try {
            // console.log("Redux getAllWorkingDepartments")
            const response = await axios.get(`${BASE_URL}/getAllWorkingDepartments`);
            // console.log(response.data);
            return response.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch working departments');
        }
    }
);

export const fetchAllClosedDepartments = createAsyncThunk(
    'department/fetchAllClosedDepartments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getClosedDepartments`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch closed departments');
        }
    }
);

export const addDepartment = createAsyncThunk(
    'department/addDepartment',
    async (departmentData, { rejectWithValue }) => {
        try {
            // console.log(departmentData);
            const response = await axios.post(`${BASE_URL}/addDepartment`, departmentData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add department');
        }
    }
);

export const deleteDepartment = createAsyncThunk(
    'department/deleteDepartment',
    async (departmentId, { rejectWithValue }) => {
        // console.log("Redux deleteDepartment", departmentId);
        try {
            const response = await axios.post(`${BASE_URL}/deleteDepartment/`, {deptId: departmentId});
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete department');
        }
    }
);

export const updateDepartment = createAsyncThunk(
    'department/updateDepartment',
    async ({ departmentId, departmentName }, { rejectWithValue }) => {
        try {
            console.log({deptId: departmentId, departmentName})
            const response = await axios.put(`${BASE_URL}/updateDepartment/`, {deptId: departmentId, departmentName});
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update department');
        }
    }
);

// Slice
const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        departments: {
            all: [],
            working: [],
            closed: [],
        },
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDepartments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments.all = action.payload;
            })
            .addCase(fetchAllDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllWorkingDepartments.fulfilled, (state, action) => {
                state.departments.working = action.payload;
            })
            .addCase(fetchAllClosedDepartments.fulfilled, (state, action) => {
                state.departments.closed = action.payload;
            })
            .addCase(addDepartment.fulfilled, (state, action) => {
                state.departments.all.push(action.payload);
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.departments.all = state.departments.all.filter(
                    (department) => department.departmentId !== action.meta.arg
                );
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const index = state.departments.all.findIndex(
                    (department) => department.departmentId === action.payload.departmentId
                );
                if (index !== -1) state.departments.all[index] = action.payload;
            });
    },
});

export default departmentSlice.reducer;