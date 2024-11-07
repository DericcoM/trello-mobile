import React, { useState } from 'react';
import { Collapse } from 'antd';
import TaskDetail from '../TaskDetail/TaskDetail';
import TaskItem from '../TaskItem/TaskItem';
import EmptyGroupMessage from '../EmptyGroupMessage/EmptyGroupMessage';
import styles from './TaskGroup.module.scss';
import { useDispatch } from 'react-redux';
import { toggleGroup } from '../../store/reducer';
import { useDrop } from 'react-dnd';
import { Task } from '../../types';

const { Panel } = Collapse;

interface TaskGroupProps {
  groupId: string;
  title: string;
  tasks: Task[];
  isOpen: boolean; 
  onMoveTask: (sourceGroupId: string, destinationGroupId: string, taskId: string) => Promise<void>;
  color: string; // Добавляем цвет как пропс
}

const TaskGroup: React.FC<TaskGroupProps> = ({
  groupId,
  title,
  tasks,
  isOpen,
  onMoveTask,
  color
}) => {
  const dispatch = useDispatch();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggingTaskPosition, setDraggingTaskPosition] = useState<{ x: number; y: number } | null>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string; sourceGroupId: string }) => {
      onMoveTask(item.sourceGroupId, groupId, item.id);
      setDraggingTaskPosition(null); // Сбрасываем позицию после завершения перетаскивания
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  return (
    <Collapse
      activeKey={isOpen ? [groupId] : []}
      onChange={() => dispatch(toggleGroup(groupId))}
      className={styles.panel}
    >
      <Panel header={title} key={groupId} style={{ backgroundColor: color }}>
        <div ref={drop} className={`${styles.dropArea} ${isOver ? styles.over : ''}`}>
          {tasks.length === 0 ? (
            <EmptyGroupMessage />
          ) : (
            tasks.map((task) => (
              <div key={task.task_id} onClick={() => handleTaskClick(task)}>
                <TaskItem
                  task={task}
                  groupId={groupId}
                  setDraggingTaskPosition={setDraggingTaskPosition} // Передаем функцию для установки позиции
                  draggingTaskPosition={draggingTaskPosition} // Передаем текущее положение перетаскиваемой карточки
                />
              </div>
            ))
          )}
        </div>
      </Panel>
      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={handleCloseDetail} />
      )}
    </Collapse>
  );
};

export default TaskGroup;
