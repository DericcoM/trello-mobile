import React, { useEffect } from "react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import styles from "./TaskItem.module.scss";
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  groupId: string;
  setDraggingTaskPosition: (position: { x: number; y: number } | null) => void;
  draggingTaskPosition: { x: number; y: number } | null;
}

const priorityColors: { [key in Task["priority"]]: string } = {
  low: "#d9f7be",
  medium: "#ffe58f",
  high: "#ffccc7",
};

const typeColors: { [key: string]: string } = {
  feature: "#e6f7ff",
  bug: "#fffbe6",
  task: "#fff0f6",
};

const TaskItem: React.FC<TaskItemProps> = ({ task, groupId, setDraggingTaskPosition, draggingTaskPosition }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.task_id, sourceGroupId: groupId },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setDraggingTaskPosition({
        x: event.clientX - 50, // Смещение для центрирования
        y: event.clientY - 20, // Смещение для центрирования
      });
    };

    const handleMouseUp = () => {
      setDraggingTaskPosition(null); // Убираем позицию, когда отпускаем мышь
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, setDraggingTaskPosition]);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1, // Полупрозрачная карточка при перетаскивании
        position: draggingTaskPosition ? "absolute" : "static", // Позиция изменяется только во время перетаскивания
        left: draggingTaskPosition ? draggingTaskPosition.x : undefined,
        top: draggingTaskPosition ? draggingTaskPosition.y : undefined,
        transition: "left 0.1s ease, top 0.1s ease", // Плавный переход
      }}
      className={`${styles.taskItem} ${isDragging ? styles.taskItemDragging : ''}`}
    >
      <h4 className={styles.taskTitle}>{task.title}</h4>
      <div className={styles.infoContainer}>
        {task.deadline && (
          <div className={styles.infoBlock} style={{ backgroundColor: priorityColors[task.priority] }}>
            <svg
              width="16"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.667 2v2.667M5.333 2v2.667M2.667 7.333h10.666M4 3.333h8c.736 0 1.333.597 1.333 1.334v8c0 .736-.597 1.333-1.333 1.333H4a1.333 1.333 0 01-1.333-1.333v-8c0-.737.597-1.334 1.333-1.334zM5.333 10h1.334v1.333H5.333V10z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>{" "}
            <span className={styles.infoText}>{task.deadline}</span>
          </div>
        )}
        {task.priority && (
          <div className={styles.infoBlock} style={{ backgroundColor: priorityColors[task.priority] }}>
            <svg
              width="16"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.7 2.85v10.297M8 5.856v7.3M3.3 8.845v4.3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              ></path>
            </svg>{" "}
            <span className={styles.infoText}>{task.priority}</span>
          </div>
        )}
        {task.type && (
          <div className={styles.infoBlock} style={{ backgroundColor: typeColors[task.type] }}>
            <svg
              width="16"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.667 5.333L2 8l2.667 2.667m6.666-5.334L14 8l-2.667 2.667m-2-8L6.667 13.333"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>{" "}
            <span className={styles.infoText}>{task.type}</span>
          </div>
        )}
        {task.estimation !== undefined && (
          <div className={styles.infoBlock}>
            <svg
              width="16"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5.333V8l1.333 1.333m-7.3-2A6 6 0 112.367 10m-.334 3.333V10h3.334"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>{" "}
            <span className={styles.infoText}>{task.estimation} дней</span>
          </div>
        )}
        {task.sprint && (
          <div className={styles.infoBlock}>
            <svg
              width="16"
              height="16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14A6 6 0 108 2a6 6 0 000 12z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="3 3"
              ></path>
            </svg>{" "}
            <span className={styles.infoText}>{task.sprint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
