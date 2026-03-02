import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Fetch user data from localStorage
const userData = JSON.parse(localStorage.getItem('authData')) || null;

// Initial state
const initialState = {
    user: userData?.employee || null, // Update to use employee details
    jobProfiles: userData?.jobProfiles || [], // Add jobProfiles field to the state
    accessToken: userData?.accessToken || null,
    refreshToken: userData?.refreshToken || null,
    isAuthenticated: !!userData,
    loading: false,
    error: null,
};

// Login thunk
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/employee/loginEmployee`,
            {
                employeeEmail: email,
                employeePassword: password,
            },
            {
                withCredentials: true,
            }
        );
        console.log(response.data);
        return response.data.data; // API's data field contains user details and job profiles
    } catch (error) {
        console.log(error);
        return rejectWithValue(
            error.response?.data?.message || 'An error occurred during login.'
        );
    }
});

// Logout thunk (if backend logout logic is needed, otherwise this is local)
export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
    // Add API call for logout here if necessary
    dispatch(logout());
});

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.jobProfiles = [];
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;

            // Clear localStorage on logout
            localStorage.removeItem('authData');
        },
    },
    extraReducers: (builder) => {
        builder
            // Login logic
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.employee; // Store employee data
                state.jobProfiles = action.payload.jobProfiles; // Store job profiles
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;

                // Save user data to localStorage on successful login
                localStorage.setItem('authData', JSON.stringify(action.payload));
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
            })

            // Logout logic (if using logoutThunk)
            .addCase(logoutThunk.fulfilled, (state) => {
                state.user = null;
                state.jobProfiles = [];
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;

                // Clear localStorage
                localStorage.removeItem('authData');
            });
    },
});

// Export actions and reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;