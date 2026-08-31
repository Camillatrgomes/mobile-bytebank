import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import transactionFormReducer from './transactionFormSlice';
import filterReducer from './filterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactionForm: transactionFormReducer,
    filter: filterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
