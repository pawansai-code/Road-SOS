import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

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
  profile: {
    full_name: 'Allen Jinto',
    phone_number: '+91 9445401181',
    blood_group: 'O+',
    medical_notes: 'No known allergies. Asthma, carries inhaler.',
    profile_image: '',
  },
  isLoading: false,
  error: null,
};

// Simulated async thunk to update profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: UserProfile, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return profileData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Simulated async thunk to clear profile data
export const clearProfile = createAsyncThunk(
  'user/clearProfile',
  async (_, { rejectWithValue }) => {
    try {
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
