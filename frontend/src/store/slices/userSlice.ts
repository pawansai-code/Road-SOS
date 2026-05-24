import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// NOTE: This IP must match the computer running your PostgreSQL backend.
// If using Android Emulator, change this to: 'http://10.0.2.2:8000/api'
// If using Physical Device, ensure 192.168.43.71 is your exact Wi-Fi IPv4 address.
const API_BASE_URL = 'http://192.168.43.71:8000/api';
const DUMMY_UID = 'dummy_user_123';


export interface UserProfile {
  full_name: string;
  phone_number: string;
  blood_group: string;
  medical_notes: string;
  profile_image: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Fetch profile from backend (PostgreSQL)
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: 'GET',
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null; // Profile not created yet
        throw new Error(`Server returned ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.message.includes('Network request failed')) {
        return rejectWithValue(`Cannot connect to backend at ${API_BASE_URL}. Check your IP address and ensure the server is running.`);
      }
      return rejectWithValue(error.message || 'Failed to fetch profile from database');
    }
  }
);

// Update profile on backend (PostgreSQL)
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: UserProfile, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: 'PUT',
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Failed to update profile (Status ${response.status})`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.message.includes('Network request failed')) {
        return rejectWithValue(`Cannot connect to backend at ${API_BASE_URL}. Is your Django/Node server running?`);
      }
      return rejectWithValue(error.message || 'Failed to save profile to PostgreSQL database');
    }
  }
);

// Simulated async thunk to clear profile data
export const clearProfile = createAsyncThunk(
  'user/clearProfile',
  async (_, { rejectWithValue }) => {
    try {
      // If you have a delete endpoint, you can add it here.
      // e.g. await fetch(`${API_BASE_URL}/users/profile/`, { method: 'DELETE' })
      await new Promise(resolve => setTimeout(resolve, 600));
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear profile');
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfileField: (state, action: PayloadAction<{ field: keyof UserProfile; value: string }>) => {
      if (state.profile) {
        state.profile[action.payload.field] = action.payload.value;
      } else {
        state.profile = {
          full_name: '',
          phone_number: '',
          blood_group: '',
          medical_notes: '',
          profile_image: '',
          [action.payload.field]: action.payload.value
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
    state.isLoading = true;
    state.error = null;
  })
    .addCase(fetchProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.profile = action.payload;
      }
    })
    .addCase(fetchProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })
    // Update Profile
    .addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
    })
    .addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })
    // Clear Profile
    .addCase(clearProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(clearProfile.fulfilled, (state) => {
      state.isLoading = false;
      state.profile = null;
    })
    .addCase(clearProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
},
});

export const { setProfileField } = userSlice.actions;

export default userSlice.reducer;
