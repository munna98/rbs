import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Order } from '../../types';

export interface KitchenState {
  orders: Order[];
  activeOrders: Order[];
  completedOrders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
  filterStatus: 'ALL' | 'PENDING' | 'PREPARING' | 'SERVED';
}

const initialState: KitchenState = {
  orders: [],
  activeOrders: [],
  completedOrders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  filterStatus: 'ALL',
};

// Async Thunks
export const fetchKitchenOrders = createAsyncThunk(
  'kitchen/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getKitchenOrders();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'kitchen/updateOrderStatus',
  async (data: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateOrderStatus(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markItemPrepared = createAsyncThunk(
  'kitchen/markItemPrepared',
  async (data: { orderItemId: string; prepared: boolean }, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.markItemPrepared(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  reducers: {
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Kitchen Orders
      .addCase(fetchKitchenOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.activeOrders = action.payload.filter(
          (o: Order) => ['PENDING', 'PREPARING'].includes(o.status)
        );
        state.completedOrders = action.payload.filter(
          (o: Order) => o.status === 'SERVED'
        );
      })
      .addCase(fetchKitchenOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
        // Update active/completed lists
        state.activeOrders = state.orders.filter(
          (o) => ['PENDING', 'PREPARING'].includes(o.status)
        );
        state.completedOrders = state.orders.filter((o) => o.status === 'SERVED');
      })
      // Mark Item Prepared
      .addCase(markItemPrepared.fulfilled, (state, action) => {
        // Update order in list
        const order = state.orders.find((o) =>
          o.orderItems?.some((item) => item.id === action.payload.id)
        );
        if (order && order.orderItems) {
          const itemIndex = order.orderItems.findIndex(
            (item) => item.id === action.payload.id
          );
          if (itemIndex > -1) {
            order.orderItems[itemIndex] = action.payload;
          }
        }
      });
  },
});

export const { selectOrder, clearSelectedOrder, setFilterStatus, clearError } =
  kitchenSlice.actions;
export default kitchenSlice.reducer;