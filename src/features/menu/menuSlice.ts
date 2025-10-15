import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { MenuItem, Category } from '../../types';

export interface MenuState {
  items: MenuItem[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
}

const initialState: MenuState = {
  items: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',
  viewMode: 'grid', 
};

// Async Thunks
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getMenuItems();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getCategories();
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.createMenuItem(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateMenuItem(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.deleteMenuItem(id);
      if (result.success) return id;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'menu/createCategory',
  async (data: any, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.createCategory(data);
      if (result.success) return result.data;
      return rejectWithValue(result.error);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menu Items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Menu Item
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update Menu Item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Menu Item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      // Create Category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      });
  },
});

export const { setSelectedCategory, setSearchQuery, setViewMode, clearError } =
  menuSlice.actions;
export default menuSlice.reducer;