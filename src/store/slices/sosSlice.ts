import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SOSState {
  isEmergencyActive: boolean;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  lastUpdated: string | null;
}

const initialState: SOSState = {
  isEmergencyActive: false,
  location: {
    latitude: null,
    longitude: null,
  },
  lastUpdated: null,
};

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    triggerSOS: (state) => {
      state.isEmergencyActive = true;
      state.lastUpdated = new Date().toISOString();
    },
    cancelSOS: (state) => {
      state.isEmergencyActive = false;
      state.lastUpdated = new Date().toISOString();
    },
    updateLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>
    ) => {
      state.location = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { triggerSOS, cancelSOS, updateLocation } = sosSlice.actions;

export default sosSlice.reducer;
