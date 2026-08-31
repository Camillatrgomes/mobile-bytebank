import { createSlice } from '@reduxjs/toolkit';

interface TransactionFormState {
  isModalOpen: boolean;
  isSubmitting: boolean;
}

const initialState: TransactionFormState = {
  isModalOpen: false,
  isSubmitting: false,
};

const transactionFormSlice = createSlice({
  name: 'transactionForm',
  initialState,
  reducers: {
    openModal(state) {
      state.isModalOpen = true;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.isSubmitting = false;
    },
    setSubmitting(state, action) {
      state.isSubmitting = action.payload;
    },
  },
});

export const { openModal, closeModal, setSubmitting } = transactionFormSlice.actions;
export default transactionFormSlice.reducer;
