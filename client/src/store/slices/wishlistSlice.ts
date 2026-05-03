import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Product } from "@/types";
import apiClient from "@/api/apiClient";

interface WishlistState {
  items: Product[];
  loading: boolean;
}

const WISHLIST_STORAGE_KEY = "shop-co-wishlist";

const getInitialState = (): WishlistState => {
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return { items: stored ? JSON.parse(stored) : [], loading: false };
};

export const fetchWishlistFromServer = createAsyncThunk(
  "wishlist/fetchFromServer",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("wishlist/");
      return res.data.map((item: any) => item.product);
    } catch { return rejectWithValue("Failed to fetch wishlist."); }
  }
);

export const toggleWishlistOnServer = createAsyncThunk(
  "wishlist/toggleOnServer",
  async (product: Product, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("wishlist/toggle/", {
        product_id: Number(String(product.id).replace("p", "")),
      });
      return { product, action: res.data.action };
    } catch { return rejectWithValue("Failed to update wishlist."); }
  }
);

export const clearWishlistOnServer = createAsyncThunk(
  "wishlist/clearOnServer",
  async (_, { rejectWithValue }) => {
    try { await apiClient.delete("wishlist/clear/"); }
    catch { return rejectWithValue("Failed to clear wishlist."); }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: getInitialState(),
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) { state.items.splice(index, 1); }
      else { state.items.push(action.payload); }
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistFromServer.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlistFromServer.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
      })
      .addCase(fetchWishlistFromServer.rejected, (state) => { state.loading = false; })
      .addCase(toggleWishlistOnServer.fulfilled, (state, action) => {
        const { product, action: act } = action.payload;
        if (act === "added") {
          if (!state.items.find(i => i.id === product.id)) state.items.push(product);
        } else {
          state.items = state.items.filter(i => i.id !== product.id);
        }
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
      })
      .addCase(clearWishlistOnServer.fulfilled, (state) => {
        state.items = [];
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      });
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;