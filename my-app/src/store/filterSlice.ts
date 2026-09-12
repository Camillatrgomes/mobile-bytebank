import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  month: string;
  type: 'all' | 'Credit' | 'Debit';
  category: string;
  search: string;
  startDate: string | null;
  endDate: string | null;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const initialState: FilterState = {
  month: getCurrentMonth(),
  type: 'all',
  category: '',
  search: '',
  startDate: null,
  endDate: null,
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setMonth(state, action: PayloadAction<string>) {
      state.month = action.payload;
      state.startDate = null;
      state.endDate = null;
    },
    setType(state, action: PayloadAction<'all' | 'Credit' | 'Debit'>) {
      state.type = action.payload;
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    // Mês e período são exclusivos: com período o mês sai, sem período volta o mês atual.
    setDateRange(state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.month = state.startDate || state.endDate ? '' : getCurrentMonth();
    },
    resetFilters(state) {
      state.month = getCurrentMonth();
      state.type = 'all';
      state.category = '';
      state.search = '';
      state.startDate = null;
      state.endDate = null;
    },
  },
});

export const { setMonth, setType, setCategory, setSearch, setDateRange, resetFilters } =
  filterSlice.actions;
export default filterSlice.reducer;
