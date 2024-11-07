// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './reducer';
import recordReducer from './record/record-slice';
import authReducer from './auth/authSlice';
import taskBoardReducer from './taskBoard/taskBoardSlice'

const store = configureStore({
  reducer: {
    tasks: taskReducer,
    record: recordReducer,
    auth: authReducer,  // Include the auth reducer here
    taskBoard: taskBoardReducer,
  },
});

// Type definitions for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
