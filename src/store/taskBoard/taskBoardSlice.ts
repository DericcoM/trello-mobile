// store/taskBoard/taskBoardSlice.ts

import { createSlice } from '@reduxjs/toolkit';

interface TaskBoardState {
  refreshCount: number;
}

const initialState: TaskBoardState = {
  refreshCount: 0,
};

const taskBoardSlice = createSlice({
  name: 'taskBoard',
  initialState,
  reducers: {
    refreshTaskBoard: (state) => {
      state.refreshCount += 1; // Изменение состояния для перерисовки
    },
  },
});

export const { refreshTaskBoard } = taskBoardSlice.actions;
export default taskBoardSlice.reducer;
