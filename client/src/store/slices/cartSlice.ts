import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { CartItem } from "@/types";
import apiClient from "@/api/apiClient";

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const CART_STORAGE_KEY = "shop-co-redux-cart";

const getInitialState = (): CartState => {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  return {
    items: stored ? JSON.parse(stored) : [],
    loading: false,
    error: null,
  };
};

export const fetchCartFromServer = createAsyncThunk(
  "cart/fetchFromServer",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("cart/");
      return res.data.map((item: any) => ({
        backendId: item.id,          
        product:   item.product,
        size:      item.size,
        color:     item.color,
        quantity:  item.quantity,
      }));
    } catch {
      return rejectWithValue("Failed to fetch cart.");
    }
  }
);

export const addItemToServer = createAsyncThunk(
  "cart/addToServer",
  async (payload: { product_id: number; quantity: number; size: string; color: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("cart/", payload);
      return res.data;
    } catch {
      return rejectWithValue("Failed to add item.");
    }
  }
);

export const removeItemFromServer = createAsyncThunk(
  "cart/removeFromServer",
  async (backendId: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`cart/${backendId}/`);
      return backendId;
    } catch {
      return rejectWithValue("Failed to remove item.");
    }
  }
);

export const updateQuantityOnServer = createAsyncThunk(
  "cart/updateOnServer",
  async (payload: { backendId: number; quantity: number }, { rejectWithValue }) => {
    try {
      if (payload.quantity <= 0) {
        await apiClient.delete(`cart/${payload.backendId}/`);
        return { backendId: payload.backendId, quantity: 0 };
      }
      const res = await apiClient.patch(`cart/${payload.backendId}/`, { quantity: payload.quantity });
      return { backendId: payload.backendId, quantity: res.data.quantity };
    } catch {
      return rejectWithValue("Failed to update quantity.");
    }
  }
);

export const clearCartOnServer = createAsyncThunk(
  "cart/clearOnServer",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete("cart/clear/");
    } catch {
      return rejectWithValue("Failed to clear cart.");
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState: getInitialState(),
  reducers: {
    // Local-only (not logged in)
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) =>
          item.product.id === action.payload.product.id &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    },
    removeItem: (state, action: PayloadAction<{ productId: string; size: string; color: string }>) => {
      state.items = state.items.filter(
        (item) =>
          !(item.product.id === action.payload.productId &&
            item.size === action.payload.size &&
            item.color === action.payload.color)
      );
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; size: string; color: string; quantity: number }>) => {
      const item = state.items.find(
        (i) =>
          i.product.id === action.payload.productId &&
          i.size === action.payload.size &&
          i.color === action.payload.color
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(i.product.id === action.payload.productId &&
                i.size === action.payload.size &&
                i.color === action.payload.color)
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem(CART_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart from backend
      .addCase(fetchCartFromServer.pending, (state) => { state.loading = true; })
      .addCase(fetchCartFromServer.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      })
      .addCase(fetchCartFromServer.rejected, (state) => { state.loading = false; })

      // Add item to backend
      .addCase(addItemToServer.fulfilled, (state, action) => {
        const existing = state.items.find(
          (i) =>
            i.product.id === String(action.payload.product.id) &&
            i.size === action.payload.size &&
            i.color === action.payload.color
        );
        if (existing) {
          existing.quantity  = action.payload.quantity;
          existing.backendId = action.payload.id;
        } else {
          state.items.push({
            backendId: action.payload.id,
            product:   action.payload.product,
            size:      action.payload.size,
            color:     action.payload.color,
            quantity:  action.payload.quantity,
          });
        }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      })

      // Remove item from backend
      .addCase(removeItemFromServer.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.backendId !== action.payload);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      })

      // Update quantity on backend
      .addCase(updateQuantityOnServer.fulfilled, (state, action) => {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.backendId !== action.payload.backendId);
        } else {
          const item = state.items.find((i) => i.backendId === action.payload.backendId);
          if (item) item.quantity = action.payload.quantity;
        }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      })

      // Clear cart
      .addCase(clearCartOnServer.fulfilled, (state) => {
        state.items = [];
        localStorage.removeItem(CART_STORAGE_KEY);
      });
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
