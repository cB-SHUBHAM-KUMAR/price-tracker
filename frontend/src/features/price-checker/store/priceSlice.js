/**
 * @fileoverview Redux slice for price analysis state.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import priceApi from '../api/price.api';

export const analyzePrice = createAsyncThunk(
  'price/analyze',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await priceApi.analyze(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Analysis failed');
    }
  }
);

const priceSlice = createSlice({
  name: 'price',
  initialState: {
    result: null,
    loading: false,
    error: null,
    history: [],
  },
  reducers: {
    clearResult: (state) => {
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePrice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.result = null;
      })
      .addCase(analyzePrice.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(analyzePrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResult } = priceSlice.actions;
export default priceSlice.reducer;
