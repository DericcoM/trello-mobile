import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import RecordRTC from "recordrtc";
import axios from "axios";
import styles from "./VoiceRecorderButton.module.scss";
import { setIsRecording, setRecordFaild } from "../../store/record/record-slice";
import { getIsRecording } from "../../store/record/record-selectors";
import { refreshTaskBoard } from "../../store/taskBoard/taskBoardSlice";
import { message } from "antd";

interface VoiceRecorderButtonProps {
  handleSendRecord: (audio: string) => void;
}

const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({
  handleSendRecord,
}) => {
  const dispatch = useDispatch();
  const isRecording = useSelector(getIsRecording);
  const [recorder, setRecorder] = useState<RecordRTC | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const recordingInterval = React.useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      message.info("Запрашиваем доступ к микрофону...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      message.success("Доступ к микрофону получен.");
      setStream(mediaStream);
      
      const newRecorder = new RecordRTC(mediaStream, { type: "audio" });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      dispatch(setIsRecording(true));

      // Старт таймера записи
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 100);
      }, 100);
    } catch (error) {
      message.error("Ошибка при доступе к микрофону. Проверьте разрешения.");
      dispatch(setIsRecording(false));
    }
  };

  const stopRecording = () => {
    if (recorder) {
      message.info("Останавливаем запись...");
      recorder.stopRecording(async () => {
        const audioBlob = recorder.getBlob();
        const reader = new FileReader();
  
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1];
          
          try {
            message.info("Отправляем аудио на сервер для распознавания...");
            const audioResponse = await axios.post('https://aiteamtg.store/llm/api/recognize_audio', {
              audio: base64Audio
            });
  
            const recognizedText = audioResponse.data.text;
            alert(`Распознанный текст: ${recognizedText}`);
            message.success("Аудио успешно распознано!");

            if (recognizedText && recognizedText.trim() !== "") {
              
              // Второй запрос с распознанным текстом
              message.info("Отправляем распознанный текст на второй сервер...");
              const textResponse = await axios.post('https://aiteamtg.store/yougile/api/voice', { text: recognizedText });
  
              if (textResponse.status === 200) {
                dispatch(refreshTaskBoard());
                message.success("Задача успешно отработана.");
              }

              handleSendRecord(recognizedText);
              dispatch(setRecordFaild(false));
            } else {
              message.warning("Распознанный текст пустой.");
              dispatch(setRecordFaild(true));
            }
          } catch (error) {
            
            message.error("Ошибка при отправке данных на сервер.");
            dispatch(setRecordFaild(true));
          }
  
          // Сброс записи и времени
          setRecordingTime(0);
        };
  
        reader.readAsDataURL(audioBlob);
  
        // Остановка потоков и освобождение ресурсов
        stream?.getTracks().forEach((track) => track.stop());
        setStream(null);
        setRecorder(null);
        dispatch(setIsRecording(false));
      });
    }
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };
  
  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (totalMilliseconds: number) => {
    const seconds = Math.floor(totalMilliseconds / 1000);
    const millis = Math.floor((totalMilliseconds % 1000) / 10);
    return `${String(seconds).padStart(2, "0")}:${String(millis).padStart(2, "0")}`;
  };

  return (
    <div className={styles.recorderContainer}>
      <div className={styles.recordStatus}>
        <button className={styles.flashingButton} style={!isRecording ? { display: "none" } : {}}></button>
        <div className={styles.timerRecord} style={!isRecording ? { display: "none" } : {}}>
          {formatTime(recordingTime)}
        </div>
      </div>
  
      <button
        className={`${styles.recognizeButton} ${isRecording ? styles.active : ""}`}
        aria-label="Start or Stop Recording"
        type="button"
        onClick={handleButtonClick}
      >
        <div className={styles.submitContainer}>
          <div className={styles.circleMicrophone}></div>
        </div>
      </button>
    </div>
  );
};

export default VoiceRecorderButton;
