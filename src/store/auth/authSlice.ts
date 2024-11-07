// src/store/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "./authTypes";

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.username = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
