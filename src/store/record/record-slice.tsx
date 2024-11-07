import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecordState } from "./RecordTypes";

const initialState: RecordState = {
  isRecording: false,
  recordFailed: false,
  recordFade: false,
};

const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    setIsRecording(state, action: PayloadAction<boolean>) {
      state.isRecording = action.payload;
    },
    setRecordFaild(state, action: PayloadAction<boolean>) {
      state.recordFailed = action.payload;
    },
    setRecordFade(state, action: PayloadAction<boolean>) {
      state.recordFade = action.payload;
    },
  },
});

export const { setIsRecording, setRecordFaild, setRecordFade } =
  recordSlice.actions;

export default recordSlice.reducer;
