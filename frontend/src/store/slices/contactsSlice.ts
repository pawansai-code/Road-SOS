import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { API_BASE_URL } from '../../config';
import type { RootState } from '../index';

export interface EmergencyContact {
  id: string;
  contact_name: string;
  relationship: string;
  phone_number: string;
  created_at: string;
}

interface ContactsState {
  contacts: EmergencyContact[];
  smsTemplate: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  contacts: [],
  smsTemplate: null,
  loading: false,
  error: null,
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const uid = state.auth.firebaseUid || 'dummy_user_123';
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/`, {
        headers: {
          'X-Firebase-Uid': uid,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addContact = createAsyncThunk(
  'contacts/addContact',
  async (contactData: { contact_name: string; relationship: string; phone_number: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const uid = state.auth.firebaseUid || 'dummy_user_123';
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/`, {
        method: 'POST',
        headers: {
          'X-Firebase-Uid': uid,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'Failed to add contact');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (contactId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const uid = state.auth.firebaseUid || 'dummy_user_123';
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/`, {
        method: 'DELETE',
        headers: {
          'X-Firebase-Uid': uid,
        },
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      return contactId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSmsTemplate = createAsyncThunk(
  'contacts/fetchSmsTemplate',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const uid = state.auth.firebaseUid || 'dummy_user_123';
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/sms-template/`, {
        headers: {
          'X-Firebase-Uid': uid,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch SMS template');
      const data = await response.json();
      return data.template as string;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<EmergencyContact[]>) => {
        state.loading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addContact.fulfilled, (state, action: PayloadAction<EmergencyContact>) => {
        state.contacts.push(action.payload);
      })
      .addCase(deleteContact.fulfilled, (state, action: PayloadAction<string>) => {
        state.contacts = state.contacts.filter(c => c.id !== action.payload);
      })
      .addCase(fetchSmsTemplate.fulfilled, (state, action: PayloadAction<string>) => {
        state.smsTemplate = action.payload;
      });
  },
});

export default contactsSlice.reducer;
