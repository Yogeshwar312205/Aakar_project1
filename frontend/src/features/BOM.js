import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBom = createAsyncThunk(
    "bom/fetchBomDesign",
    async (projectId) => {
        const response = await axios.get(`http://localhost:3000/api/v1/bom/fetchBomDetails/${projectId}`);
        return response.data.data;
    }
);

export const addBomDesign = createAsyncThunk(
    "bom/addBomDesign",
    async (bomDesign) => {
        const response = await axios.post(`http://localhost:3000/api/v1/bom/addBomDesign`, bomDesign);
        return response.data;
    }
);

export const updateBomDesign = createAsyncThunk(
    "bom/updateBomDesign",
    async ([bomId, updatedBOM]) => {
        const response = await axios.put(`http://localhost:3000/api/v1/bom/updateBomDesign/${bomId}`, updatedBOM);
        return response.data;
    }
);

export const deleteBomDesign = createAsyncThunk(
    "bom/deleteBomDesign",
    async (itemId) => {
        const response = await axios.delete(`http://localhost:3000/api/v1/bom/deleteBomDesign/${itemId}`);
        return response.data;
    }
);

export const importBomItems = createAsyncThunk(
    "bom/importBomItems",
    async ({ sourceProjectNumber, targetProjectNumber, targetStageId, bomIds }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`http://localhost:3000/api/v1/bom/importBom`, {
                sourceProjectNumber, targetProjectNumber, targetStageId, bomIds
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const importBomFromExcel = createAsyncThunk(
    "bom/importBomFromExcel",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `http://localhost:3000/api/v1/bom/importBomExcel`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

const BOMSlice = createSlice({
    name: "BOMDesign",
    initialState: {
        BOMDesign: [],
        status: "idle",
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBom.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBom.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.BOMDesign = action.payload || [];
            })
            .addCase(fetchBom.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(importBomFromExcel.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(importBomFromExcel.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(importBomFromExcel.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to import';
            })
    },
});

export const BOMReducer = BOMSlice.reducer;
