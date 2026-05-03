import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/api/apiClient";

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AUTH_STORAGE_KEY = "shop-co-auth-token";

const getInitialState = (): AuthState => {
  const storedUserStr = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
  let storedUser = null;
  try {
    storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return { user: storedUser, isAuthenticated: !!storedUser, loading: false, error: null };
};

export const loginWithJWT = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string; name?: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      if (credentials.name) {
        await apiClient.post("auth/register/", {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        });
      }

      const loginRes = await apiClient.post("auth/login/", {
        email: credentials.email,
        password: credentials.password,
      });

      const { access, refresh } = loginRes.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const userRes = await apiClient.get("auth/me/");
      const userData: User = {
        id: userRes.data.id,
        name: userRes.data.name || userRes.data.email,
        email: userRes.data.email,
        token: access,
      };

      return { user: userData, rememberMe: credentials.rememberMe };
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.response?.data?.error || "Connection refused.";
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithJWT.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithJWT.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        const storage = action.payload.rememberMe ? localStorage : sessionStorage;
        storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload.user));
        if (action.payload.rememberMe) sessionStorage.removeItem(AUTH_STORAGE_KEY);
        else localStorage.removeItem(AUTH_STORAGE_KEY);
      })
      .addCase(loginWithJWT.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login attempt failed.";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;