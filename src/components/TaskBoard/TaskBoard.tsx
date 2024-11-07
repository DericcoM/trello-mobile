import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import TaskGroup from "../TaskGroup/TaskGroup";
import { useDispatch, useSelector } from "react-redux";
import { setColumns, moveTask } from "../../store/reducer"; // Импортируем действия
import styles from "./TaskBoard.module.scss";
import useIsMobile from "../../hooks/useIsMobile";
import VoiceRecorderButton from "../VoiceRecorderButton/VoiceRecorderButton";
import CreateTaskModal from "../CreateTaskModal/CreateTaskModal";
import { Task } from "../../types";
import { RootState } from "../../store/store";

const TaskBoard: React.FC = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const backend = isMobile ? TouchBackend : HTML5Backend;

  const taskGroups = useSelector((state: RootState) => state.tasks.taskGroups);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const scrollSpeed = 10; // Скорость прокрутки
  const scrollThreshold = 50; // Отступ от верхней и нижней границы

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get(
          "https://aiteamtg.store/yougile/api/columns"
        );
        const columns = response.data;

        const tasksPromises = columns.map(async (column: any) => {
          const tasksResponse = await axios.get(
            `https://aiteamtg.store/yougile/api/tasks/${column.column_id}`
          );
          return {
            id: column.column_id,
            title: column.title,
            tasks: tasksResponse.data,
            isOpen: false,
            color: column.color,
          };
        });

        const taskGroups = await Promise.all(tasksPromises);
        dispatch(setColumns(taskGroups));
      } catch (error) {
        console.error("Error fetching columns or tasks:", error);
      }
    };

    fetchColumns();
  }, [dispatch]);

  const handleMoveTask = async (
    sourceGroupId: string,
    destinationGroupId: string,
    taskId: string
  ) => {
    const task = taskGroups
      .find((group) => group.id === sourceGroupId)
      ?.tasks.find((t) => t.task_id === taskId);

    if (task) {
      const sourceGroup = taskGroups.find(
        (group) => group.id === sourceGroupId
      );
      const destinationGroup = taskGroups.find(
        (group) => group.id === destinationGroupId
      );

      if (sourceGroup && destinationGroup) {
        await axios.put("https://aiteamtg.store/yougile/api/change_task", {
          title: task.title,
          task_id: task.title,
          column_id: destinationGroup.title,
        });

        dispatch(moveTask({ sourceGroupId, destinationGroupId, taskId }));
      }
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleTaskCreated = async (newTask: Task) => {
    const firstGroup = taskGroups[0];

    if (firstGroup) {
      const updatedFirstGroup = {
        ...firstGroup,
        tasks: [newTask, ...firstGroup.tasks],
      };

      dispatch(setColumns([
        updatedFirstGroup,
        ...taskGroups.slice(1),
      ]));
    }

    setIsModalVisible(false);
  };

  const scrollContainer = (event: MouseEvent) => {
    const container = boardRef.current;
    if (!container) return;

    const mouseY = event.clientY;
    const containerRect = container.getBoundingClientRect();

    // Проверка верхней границы
    if (mouseY < containerRect.top + scrollThreshold) {
      container.scrollTop -= scrollSpeed; // Прокрутка вверх
    }

    // Проверка нижней границы
    if (mouseY > containerRect.bottom - scrollThreshold) {
      container.scrollTop += scrollSpeed; // Прокрутка вниз
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    const container = boardRef.current;
    if (!container) return;

    const touchY = event.touches[0].clientY; // Получаем Y координату касания
    const containerRect = container.getBoundingClientRect();

    // Проверка верхней границы
    if (touchY < containerRect.top + scrollThreshold) {
      container.scrollTop -= scrollSpeed; // Прокрутка вверх
    }

    // Проверка нижней границы
    if (touchY > containerRect.bottom - scrollThreshold) {
      container.scrollTop += scrollSpeed; // Прокрутка вниз
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      scrollContainer(event);
    };

    const handleTouchMoveEvent = (event: TouchEvent) => {
      handleTouchMove(event);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMoveEvent);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMoveEvent);
    };
  }, []);

  return (
    <>
      <DndProvider backend={backend}>
        <div ref={boardRef} className={styles.board}>
          <div className={styles.taskGroups}>
            {taskGroups.length === 0 ? (
              <p>Нет доступных групп задач.</p>
            ) : (
              taskGroups.map((group, index) => (
                <div key={group.id} className={styles.taskGroupContainer}>
                  {index === 0 && (
                    <button onClick={handleOpenModal} className={styles.createTaskButton}>
                      Создать задачу
                    </button>
                  )}
                  <TaskGroup
                    groupId={group.id}
                    title={group.title}
                    tasks={group.tasks}
                    onMoveTask={handleMoveTask}
                    isOpen={group.isOpen}
                    color={group.color}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </DndProvider>
      <VoiceRecorderButton
        handleSendRecord={(audio) => console.log("Received audio:", audio)}
      />
      <CreateTaskModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
};

export default TaskBoard;
