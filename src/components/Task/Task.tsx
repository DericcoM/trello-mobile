import React from 'react';
import { Card } from 'antd';
import styles from './Task.module.scss';

interface TaskProps {
  task: {
    content: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    type: string;
    estimation: number;
    sprint: string;
  };
}

const Task: React.FC<TaskProps> = ({ task }) => {
  return (
    <Card className={styles.task} hoverable>
      <h4>{task.content}</h4>
      <p><strong>Дедлайн:</strong> {task.deadline}</p>
      <p><strong>Приоритет:</strong> {task.priority}</p>
      <p><strong>Тип:</strong> {task.type}</p>
      <p><strong>Оценка:</strong> {task.estimation} дней</p>
      <p><strong>Спринт:</strong> {task.sprint}</p>
    </Card>
  );
};

export default Task;
