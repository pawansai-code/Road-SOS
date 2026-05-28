import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  firebaseUid: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  firebaseUid: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.firebaseUid = action.payload;
      state.loading = false;
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.firebaseUid = null;
      state.error = null;
    },
  },
});

export const { setAuthLoading, setAuthSuccess, setAuthError, logout } = authSlice.actions;

export default authSlice.reducer;
