import { RootState } from "../store";
import { RecordState } from "./RecordTypes";

export const getIsRecording = (state: RootState): RecordState['isRecording'] => state.record.isRecording;
export const getRecordFaild = (state: RootState):RecordState['recordFailed'] => state.record.recordFailed;
export const getRecordFade = (state: RootState):RecordState['recordFade'] => state.record.recordFade;
