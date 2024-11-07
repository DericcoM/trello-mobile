//useLongPress
import { useCallback, useRef, useState, useEffect } from "react";
import RecordRTC from "recordrtc";
import axios from "axios";
import {
  setIsRecording,
  setRecordFaild,
  setRecordFade,
} from "../store/record/record-slice";
import { AppDispatch } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getIsRecording } from "../store/record/record-selectors";
import { refreshTaskBoard } from "../store/taskBoard/taskBoardSlice";
import { message } from "antd";

type LongPressOptions = {
  shouldPreventDefault?: boolean;
  delay?: number;
};

const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: () => void,
  { shouldPreventDefault = true, delay = 500 }: LongPressOptions = {},
  handleSendRecord: (text: string) => void
) => {
  const dispatch: AppDispatch = useDispatch();
  const [longPressTriggered, setLongPressTriggered] = useState<boolean>(false);
  const [recorder, setRecorder] = useState<RecordRTC | null>(null);
  const isRecording = useSelector(getIsRecording);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const [startX, setStartX] = useState<number | null>(null);
  const [buttonPosition, setButtonPosition] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const isDragging = useRef<boolean>(false);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const clickDuration = useRef<number | null>(null);
  const [isCanceled, setIsCanceled] = useState<boolean>(false);

  const handleRecord = useCallback(async () => {
    if (isRecording && recorder) {
      recorder.stopRecording(async () => {
        const audioBlob = recorder.getBlob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1];
          try {
            const audioResponse = await axios.post('https://avatarservice.ru/api/v1/service/recognize_audio', {
              audio: base64Audio
            });

            const text = audioResponse.data.text; // Получаем текст из ответа

            if (text && text.trim() !== "") {
              // Отправка текста на второй URL
              const textResponse = await axios.post('https://aiteamtg.store/yougile/api/voice', { text: text });
              
              // Если ответ успешен (200 OK), обновляем TaskBoard и показываем сообщение
              if (textResponse.status === 200) {
                dispatch(refreshTaskBoard());
                message.success("Задача отработана"); // Показать успешное сообщение
              }

              handleSendRecord(text);
              dispatch(setRecordFaild(false));
            } else {
              dispatch(setRecordFaild(true));
              dispatch(setRecordFade(false));
              setTimeout(() => {
                dispatch(setRecordFade(true));
                setTimeout(() => dispatch(setRecordFaild(false)), 500);
              }, 1000);
            }
          } catch (error) {
            console.error("Ошибка при обработке аудио:", error);
            dispatch(setRecordFaild(true));
            dispatch(setRecordFade(false));
            setTimeout(() => {
              dispatch(setRecordFade(true));
              setTimeout(() => dispatch(setRecordFaild(false)), 500);
            }, 1000);
          }

          setRecordingTime(0);
        };
        reader.readAsDataURL(audioBlob);
      });
      dispatch(setIsRecording(false));
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const newRecorder = new RecordRTC(stream, { type: "audio" });
        newRecorder.startRecording();
        setRecorder(newRecorder);
        dispatch(setIsRecording(true));

        recordingInterval.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1); // Increment by 1 ms
        }, 1);
      } catch (error) {
        dispatch(setIsRecording(false));
      }
    }
  }, [isRecording, recorder, dispatch, handleSendRecord]);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      clickDuration.current = Date.now();

      if (shouldPreventDefault && event.currentTarget) {
        (event.currentTarget as HTMLElement).addEventListener(
          "touchend",
          preventDefault,
          { passive: false }
        );
      }

      const startPosX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      setStartX(startPosX);
      isDragging.current = true;

      timeout.current = setTimeout(() => {
        onLongPress(event as any);
        setLongPressTriggered(true);
        handleRecord();
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault, handleRecord]
  );

  const move = useCallback(
    (event: MouseEvent) => {
      if (isDragging.current && startX !== null && isRecording) {
        const currentPosX = event.clientX;
        const distance = currentPosX - startX;

        const sensitivityMultiplier = 1.7; // Скорость движения кнопки
        const isMobile = window.innerWidth <= 1024;
        const limitDistance = isMobile ? 150 : 350; // Разный лимит для пк и телефона
        const limitedDistance = Math.max(
          Math.min(distance * sensitivityMultiplier, 0),
          -limitDistance
        );
        setButtonPosition(limitedDistance);

        // прозрачность текста по мере приближения к концу
        const textOpacity = Math.max(
          1 - Math.abs(limitedDistance) / (limitDistance / 2),
          0
        );
        setOpacity(textOpacity);

        const thresholdDistance = -limitDistance * 0.95; // Точка невозврата
        if (limitedDistance < thresholdDistance) {
          setIsCanceled(true);
          dispatch(setIsRecording(false));
        } else if (limitedDistance > -10 && isCanceled) {
          setIsCanceled(false);
          dispatch(setIsRecording(true));
        }

        const newOpacity = Math.max(
          1 - Math.abs(limitedDistance) / limitDistance,
          0
        );
        setOpacity(newOpacity);
      }
    },
    [startX, isRecording, dispatch, isCanceled]
  );

  const clear = useCallback(() => {
    setOpacity(1);

    if (isCanceled) {
      setIsCanceled(false);
      setButtonPosition(0);
      resetRecording();
    } else {
      const clickTime = clickDuration.current
        ? Date.now() - clickDuration.current
        : 0;

      if (longPressTriggered && clickTime >= delay) {
        dispatch(setIsRecording(false));
        handleRecord();
      } else if (!longPressTriggered) {
        onClick();
      }
    }

    setLongPressTriggered(false);
    setStartX(null);
    isDragging.current = false;
    resetRecording();
  }, [handleRecord, isCanceled, longPressTriggered, delay, dispatch, onClick]);

  const resetRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
      setRecordingTime(0);
    }
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      move(event);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        clear();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      const simulatedMouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true,
      });
      move(simulatedMouseEvent);
    };

    const handleTouchEnd = () => {
      if (isDragging.current) {
        clear();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [move, clear]);

  const buttonColor = isCanceled
    ? "#CC3939"
    : buttonPosition < 0
    ? "#CC3939"
    : "#0a80f0c5";
  const boxShadow = isRecording
    ? isCanceled
      ? "none"
      : buttonPosition < 0
      ? "none"
      : "0 0 0 4px rgba(10, 128, 240, 0.5)"
    : "none";

  const textStyle = {
    transform: `translateX(${buttonPosition}px)`,
    opacity: opacity, // Используйте opacity, чтобы контролировать прозрачность текста
    color: isCanceled || buttonPosition < 0 ? "#CC3939" : "inherit", // Изменение цвета текста на красный
    transition: "transform 0.2s ease, opacity 0.2s ease, color 0.2s ease",
  };

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    buttonStyle: {
      transform: `translateX(${buttonPosition}px)`,
      opacity: opacity,
      backgroundColor: buttonColor,
      boxShadow: boxShadow,
      animation:
        isRecording && !(buttonPosition < 0) ? "pulse 1s infinite" : "none",
      transition:
        "transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
    },
    textStyle, // Добавьте здесь textStyle
    recordingTime,
    formattedRecordingTime: formatTime(recordingTime),
  };
};

const formatTime = (milliseconds: number) => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  return `${String(seconds).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const isTouchEvent = (event: Event): event is TouchEvent => {
  return "touches" in event;
};

const preventDefault = (event: Event) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};

export default useLongPress;
