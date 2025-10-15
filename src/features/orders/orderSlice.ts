import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import type { CartItem, Order, Payment, Table } from '../../types';
import type { CartItem, Order, Table } from '../../types';

export interface OrderState {
  cart: CartItem[];
  selectedTable: Table | null;
  currentOrder: Order | null;
  orders: Order[];
  tables: Table[];
  loading: boolean;
  error: string | null;
  tax: number;
  taxRate: number; // e.g., 5 for 5%
}

const initialState: OrderState = {
  cart: [],
  selectedTable: null,
  currentOrder: null,
  orders: [],
  tables: [],
  loading: false,
  error: null,
  tax: 0,
  taxRate: 5,
};

// Async Thunks
export const fetchTables = createAsyncThunk(
  'order/fetchTables',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getTables();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getOrders();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.createOrder(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  } 
);

export const updateOrder = createAsyncThunk(
  'order/updateOrder',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateOrder(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordPayment = createAsyncThunk(
  'order/recordPayment',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.recordPayment(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTableStatus = createAsyncThunk(
  'order/updateTableStatus',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateTableStatus(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { menuItemId, name, price } = action.payload;
      const existingItem = state.cart.find((item) => item.menuItemId === menuItemId);

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.price * existingItem.quantity;
      } else {
        state.cart.push({
          menuItemId,
          name,
          price,
          quantity: 1,
          subtotal: price,
        });
      }

      state.tax = (state.cart.reduce((sum, item) => sum + item.subtotal, 0) * state.taxRate) / 100;
    },

    updateCartItem: (state, action) => {
      const { menuItemId, quantity } = action.payload;
      const item = state.cart.find((item) => item.menuItemId === menuItemId);

      if (item) {
        if (quantity <= 0) {
          state.cart = state.cart.filter((item) => item.menuItemId !== menuItemId);
        } else {
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
        }
      }

      state.tax = (state.cart.reduce((sum, item) => sum + item.subtotal, 0) * state.taxRate) / 100;
    },

    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.menuItemId !== action.payload);
      state.tax = (state.cart.reduce((sum, item) => sum + item.subtotal, 0) * state.taxRate) / 100;
    },

    clearCart: (state) => {
      state.cart = [];
      state.tax = 0;
      state.selectedTable = null;
      state.currentOrder = null;
    },

    selectTable: (state, action) => {
      state.selectedTable = action.payload;
    },

    setTaxRate: (state, action) => {
      state.taxRate = action.payload;
      state.tax = (state.cart.reduce((sum, item) => sum + item.subtotal, 0) * state.taxRate) / 100;
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
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.orders.push(action.payload);
      })
      // Update Order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
        state.currentOrder = action.payload;
      })
      // Update Table Status
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        const tableIndex = state.tables.findIndex((t) => t.id === action.payload.id);
        if (tableIndex > -1) {
          state.tables[tableIndex] = action.payload;
        }
      });
  },
});

export const {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  selectTable,
  setTaxRate,
  clearError,
} = orderSlice.actions;

export default orderSlice.reducer;