// src/store/auth/authSelectors.ts
import { RootState } from '../store';

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUsername = (state: RootState) => state.auth.username;
