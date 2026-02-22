import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import alertsApi from '../api/alerts.api';

export const fetchAlerts = createAsyncThunk('alerts/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await alertsApi.getAll(params);
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch alerts'); }
});

export const createAlert = createAsyncThunk('alerts/create', async (data, { rejectWithValue }) => {
  try {
    return await alertsApi.create(data);
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create alert'); }
});

export const removeAlert = createAsyncThunk('alerts/remove', async (id, { rejectWithValue }) => {
  try {
    await alertsApi.remove(id);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete'); }
});

export const toggleAlert = createAsyncThunk('alerts/toggle', async (id, { rejectWithValue }) => {
  try {
    return await alertsApi.togglePause(id);
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to toggle'); }
});

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearAlertError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAlerts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data || []; })
      .addCase(fetchAlerts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAlert.fulfilled, (state, action) => { state.items.unshift(action.payload.data); })
      .addCase(removeAlert.fulfilled, (state, action) => { state.items = state.items.filter((a) => a._id !== action.payload); })
      .addCase(toggleAlert.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a._id === action.payload.data._id);
        if (idx !== -1) state.items[idx] = action.payload.data;
      });
  },
});

export const { clearAlertError } = alertsSlice.actions;
export default alertsSlice.reducer;

