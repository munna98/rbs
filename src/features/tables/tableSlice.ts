import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Table, Order } from '../../types';

export interface TableState {
  tables: Table[];
  selectedTable: Table | null;
  tableOrders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: TableState = {
  tables: [],
  selectedTable: null,
  tableOrders: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchTables = createAsyncThunk(
  'table/fetchTables',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getAllTables();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTableOrders = createAsyncThunk(
  'table/getTableOrders',
  async (tableId: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getOrdersByTable(tableId);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTableStatus = createAsyncThunk(
  'table/updateTableStatus',
  async (data: { tableId: string; status: string }, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateTableStatus(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearTable = createAsyncThunk(
  'table/clearTable',
  async (tableId: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateTableStatus({
        tableId,
        status: 'AVAILABLE',
      });
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    selectTable: (state, action) => {
      state.selectedTable = action.payload;
    },
    clearSelectedTable: (state) => {
      state.selectedTable = null;
      state.tableOrders = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Table Orders
      .addCase(getTableOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.tableOrders = action.payload;
      })
      .addCase(getTableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Table Status
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        const index = state.tables.findIndex((t) => t.id === action.payload.id);
        if (index > -1) {
          state.tables[index] = action.payload;
        }
        if (state.selectedTable?.id === action.payload.id) {
          state.selectedTable = action.payload;
        }
      })
      // Clear Table
      .addCase(clearTable.fulfilled, (state, action) => {
        const index = state.tables.findIndex((t) => t.id === action.payload.id);
        if (index > -1) {
          state.tables[index] = action.payload;
        }
        state.selectedTable = null;
        state.tableOrders = [];
      });
  },
});

export const { selectTable, clearSelectedTable, clearError } = tableSlice.actions;
export default tableSlice.reducer;