import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  loginService,
  logoutService,
  getCurrentUserService,
  refreshTokenService,
} from "../../services/auth.service";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginService(credentials);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutService();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getCurrentUserService();
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await refreshTokenService();
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);