import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groups: [],
  loading: false,
  error: null,
};

const groupStore = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setGroups, setLoading, setError } = groupStore.actions;
export default groupStore.reducer;