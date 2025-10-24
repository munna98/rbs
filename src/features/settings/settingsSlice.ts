import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../types';

export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  gstNumber?: string;
}

export interface WorkflowSettings {
  orderWorkflowMode: 'FULL_SERVICE' | 'QUICK_SERVICE' | 'CUSTOM';
  requirePaymentAtOrder: boolean;
  autoMarkServedWhenPaid: boolean;
  autoPrintKOT: boolean;
  requireKOTPrintConfirmation: boolean;
  kotPrintDelay: number;
  autoStartPreparing: boolean;
  enableItemWisePreparing: boolean;
  allowPartialPayment: boolean;
  allowSplitPayment: boolean;
  requirePaymentForServed: boolean;
  autoOccupyTableOnOrder: boolean;
  autoFreeTableOnPayment: boolean;
  allowMultipleOrdersPerTable: boolean;
  orderStatusFlow:
    | 'PENDING_PREPARING_SERVED_COMPLETED'
    | 'PENDING_READY_SERVED_COMPLETED'
    | 'PENDING_COMPLETED'
    | 'CUSTOM';
  notifyKitchenOnNewOrder: boolean;
  notifyWaiterOnReady: boolean;
  playOrderSound: boolean;
}


export interface SettingsState {
  users: User[];
  restaurantSettings: RestaurantSettings;
  workflowSettings: WorkflowSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  users: [],
  restaurantSettings: {
    name: 'My Restaurant',
    address: '',
    phone: '',
    email: '',
    taxRate: 5,
    currency: 'INR',
    gstNumber: '',
  },
  workflowSettings: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk(
  'settings/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getAllUsers();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'settings/createUser',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.createUser(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'settings/updateUser',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateUser(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'settings/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.deleteUser(id);
      if (result.success) return id;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRestaurantSettings = createAsyncThunk(
  'settings/fetchRestaurantSettings',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getRestaurantSettings();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRestaurantSettings = createAsyncThunk(
  'settings/updateRestaurantSettings',
  async (data: RestaurantSettings, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateRestaurantSettings(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkflowSettings = createAsyncThunk(
  'settings/fetchWorkflowSettings',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getOrderWorkflowSettings();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWorkflowSettings = createAsyncThunk(
  'settings/updateWorkflowSettings',
  async (data: WorkflowSettings, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateOrderWorkflowSettings(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index > -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      // Fetch Restaurant Settings
      .addCase(fetchRestaurantSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRestaurantSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantSettings = action.payload;
      })
      .addCase(fetchRestaurantSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Restaurant Settings
      .addCase(updateRestaurantSettings.fulfilled, (state, action) => {
        state.restaurantSettings = action.payload;
      })
       // Fetch Workflow Settings
      .addCase(fetchWorkflowSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkflowSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.workflowSettings = action.payload;
      })
      .addCase(fetchWorkflowSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Workflow Settings
      .addCase(updateWorkflowSettings.fulfilled, (state, action) => {
        state.workflowSettings = action.payload;
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;