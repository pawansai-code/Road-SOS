import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// Hardcoding for MVP. Ideally imported from a shared config.
const API_BASE_URL = 'http://192.168.43.71:8000/api';
const DUMMY_UID = 'dummy_user_123';

export const logSOSEventToBackend = createAsyncThunk(
  'sos/logSOSEventToBackend',
  async (eventType: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/sos-event/`, {
        method: 'POST',
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ event_type: eventType }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Failed to log SOS event (Status ${response.status})`);
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save SOS event to backend database');
    }
  }
);

export const fetchSOSHistory = createAsyncThunk(
  'sos/fetchSOSHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/sos-event/`, {
        method: 'GET',
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SOS history (Status ${response.status})`);
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch history');
    }
  }
);

export interface SOSHistoryEvent {
  id: string;
  eventType: string;
  timestamp: string;
}

interface SOSState {
  isEmergencyActive: boolean;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  lastUpdated: string | null;
  history: SOSHistoryEvent[];
}

const initialState: SOSState = {
  isEmergencyActive: false,
  location: {
    latitude: null,
    longitude: null,
  },
  lastUpdated: null,
  history: [], // Pre-populate with some mock data or leave empty. Let's start with a few mock items so the UI looks good immediately.
};

const mockHistory: SOSHistoryEvent[] = [];

initialState.history = mockHistory;

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    triggerSOS: (state, action: PayloadAction<string | undefined>) => {
      state.isEmergencyActive = true;
      const now = new Date().toISOString();
      state.lastUpdated = now;
      state.history.unshift({
        id: Date.now().toString(),
        eventType: action.payload || 'General Emergency',
        timestamp: now,
      });
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
    clearHistory: (state) => {
      state.history = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSOSHistory.fulfilled, (state, action) => {
      // Map backend format to frontend SOSHistoryEvent
      state.history = action.payload.map((item: any) => ({
        id: item.id.toString(),
        eventType: item.event_type,
        timestamp: item.created_at,
      }));
    });
  }
});

export const { triggerSOS, cancelSOS, updateLocation, clearHistory } = sosSlice.actions;

export default sosSlice.reducer;
