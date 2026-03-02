import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../api/api.js';
import axios from 'axios';
//create action 

export const fetchBom = createAsyncThunk(
    "bom/fetchBomDesign",
    async (projectId) => {
        try {
            console.log("started fetching item details");
            const response = await axios.get(`http://localhost:3000/api/v1/bom/fetchBomDetails/${projectId}`);
            
            // Log the full response to inspect the structure
            console.log("Full API Response:", response.data.data);

            // Log the specific data you are interested in (payload)
            // This logs the raw data
            // This logs the payload (the actual data you want)
           
            return response.data.data; // Return only the relevant item details
        } catch (error) {
            console.error("API Error:", error.message);
            throw error;
        }
    }
);
export const addBomDesign = createAsyncThunk(
    "bom/addBomDesign",
    async (bomDesign) => {
        try {
            console.log("started")
            const response = await axios.post(`http://localhost:3000/api/v1/bom/addBomDesign`, bomDesign); // Sending new item to API
            console.log("API Response Data:", response); // Debug log
            return response.data; // Assuming the response contains the new item data
            console.log("ended");
        } catch (error) {
            console.error("API Error:", error.message);
            throw error;
        }
    }
);

export const updateBomDesign = createAsyncThunk(
    "bom/updateBomDesign",
    async ([bomId,updatedBOM]) => {
        try {
           15
            console.log("started")
            const response = await axios.put(`http://localhost:3000/api/v1/bom/updateBomDesign/${bomId}`, updatedBOM); // Sending new item to API
            console.log("API Response Data:", response); // Debug log
            return response.data; // Assuming the response contains the new item data
            console.log("ended");
        } catch (error) {
            console.error("API Error:", error.message);
            throw error;
        }
    }
);



export const deleteBomDesign= createAsyncThunk(
    "bom/deleteeBomDesign",
    async(itemId)=>{
        try {
            const response = await axios.delete(`http://localhost:3000/api/v1/bom/deleteBomDesign/${itemId}`)
            console.log("API Response Data:", response); // Debug log

            return response.data;
        } catch (error) {
            throw error;
            
        }
    }
)




const BOMSlice= createSlice({
    name:"BOMDesign",
    initialState:{
          BOMDesign:[],
        status:"idle",
        error:null
    },
    reducers:{},
    extraReducers:(builder) => {
        builder
            .addCase(fetchBom.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBom.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.BOMDesign= action.payload;
            })
            .addCase(fetchBom.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                
            })
           
           
           
          
    },

});

export const BOMReducer = BOMSlice.reducer;

