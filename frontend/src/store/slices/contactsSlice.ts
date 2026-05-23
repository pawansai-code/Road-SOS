import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://192.168.43.149:8000/api';
const DUMMY_UID = 'dummy_user_123';

export interface EmergencyContact {
  id: string;
  contact_name: string;
  relationship: string;
  phone_number: string;
  created_at: string;
}

interface ContactsState {
  contacts: EmergencyContact[];
  loading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  contacts: [],
  loading: false,
  error: null,
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/`, {
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
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
  async (contactData: { contact_name: string; relationship: string; phone_number: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/`, {
        method: 'POST',
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
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
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/`, {
        method: 'DELETE',
        headers: {
          'X-Firebase-Uid': DUMMY_UID,
        },
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      return contactId;
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
      });
  },
});

export default contactsSlice.reducer;
