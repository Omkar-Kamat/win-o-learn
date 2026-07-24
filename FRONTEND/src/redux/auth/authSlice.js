import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  logout,
  getCurrentUser,
  refreshSession,
} from "./authThunk";

const initialState = {
  user: null,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET CURRENT USER

      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
      })

      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
      })

      // LOGOUT

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })

      // REFRESH SESSION

      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;