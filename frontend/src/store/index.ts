import { configureStore } from '@reduxjs/toolkit';
import sosReducer from './slices/sosSlice';
import userReducer from './slices/userSlice';
import contactsReducer from './slices/contactsSlice';

export const store = configureStore({
  reducer: {
    sos: sosReducer,
    user: userReducer,
    contacts: contactsReducer,
  },
  // Adding middleware to ensure non-serializable checks don't slow down dev
  // if you plan to store complex objects (though it's best practice to keep state serializable)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {sos: SOSState}
export type AppDispatch = typeof store.dispatch;