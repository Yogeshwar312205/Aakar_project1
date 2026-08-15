import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = "http://localhost:3000/api/v1/designation";

// Thunks (async actions)
export const fetchDesignations = createAsyncThunk(
    'designation/fetchDesignations',
    async () => {
        const response = await axios.get(`${BASE_URL}/getAllDesignations`);
        return response.data.data;
    }
);

export const addDesignation = createAsyncThunk(
    'designation/addDesignation',
    async (designationName, { rejectWithValue }) => {
        try {
            console.log('Redux: Adding designation:', designationName);
            const response = await axios.post(
                `${BASE_URL}/addDesignation`, 
                { designationName },
                { withCredentials: true } // Add credentials for cookie-based auth
            );
            console.log('Redux: Designation added:', response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Redux: Error adding designation:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add designation';
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteDesignation = createAsyncThunk(
    'designation/deleteDesignation',
    async (designationId) => {
        const response = await axios.delete(`${BASE_URL}/deleteDesignation/${designationId}`);
        return designationId;  // Return the ID of the deleted designation
    }
);

export const updateDesignation = createAsyncThunk(
    'designation/updateDesignation',
    async ({ designationId, designationName }) => {
        const response = await axios.put(`${BASE_URL}/${designationId}/edit`, { designationName });

        console.log(response.data);

        return response.data.data; // Assuming the response has the updated designation data
    }
);

// Initial State
const initialState = {
    designations: [],
    loading: false,
    error: null,
};

// Redux Slice
const designationSlice = createSlice({
    name: 'designation',
    initialState,
    reducers: {
        // You can add other reducers if needed
    },
    extraReducers: (builder) => {
        // Handle fetch designations
        builder.addCase(fetchDesignations.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchDesignations.fulfilled, (state, action) => {
            state.loading = false;
            state.designations = action.payload;
        });
        builder.addCase(fetchDesignations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        // Handle add designation
        builder.addCase(addDesignation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addDesignation.fulfilled, (state, action) => {
            state.loading = false;
            console.log('✅ Designation added to Redux state:', action.payload);
            state.designations.push(action.payload);
            console.log('📊 Total designations in state:', state.designations.length);
        });
        builder.addCase(addDesignation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
            console.error('❌ Failed to add designation:', state.error);
        });

        // Handle update designation
        builder.addCase(updateDesignation.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateDesignation.fulfilled, (state, action) => {
            state.loading = false;
            const updatedDesignation = action.payload;
            console.log("updatedDesignation: ", updatedDesignation);
            const index = state.designations.findIndex(designation => designation.designationId === updatedDesignation.designationId);
            if (index !== -1) {
                state.designations[index] = updatedDesignation; // Update the designation in the array
            }
        });
        builder.addCase(updateDesignation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        // Handle delete designation
        builder.addCase(deleteDesignation.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteDesignation.fulfilled, (state, action) => {
            state.loading = false;
            // Remove the deleted designation from the list
            state.designations = state.designations.filter(designation => designation.designationId !== action.payload);
        });
        builder.addCase(deleteDesignation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});

// Export actions and reducer
export default designationSlice.reducer;
