// src/types/index.ts или ваш файл типов
export interface Task {
  title: string;
  description?: string; // Описание задачи (необязательно)
  id: string; // Уникальный идентификатор задачи
  task_id: string; // Существующее свойство для отслеживания
  content: string; // Содержимое задачи
  deadline?: string; // Опциональный дедлайн
  priority: 'low' | 'medium' | 'high'; // Уровни приоритета
  type: 'feature' | 'bug' | 'task'; // Тип задачи
  estimation?: number; // Опциональная оценка
  sprint?: string; // Опциональный спринт
  column_id: string; // Свойство для отслеживания, где находится задача
}

// Также убедитесь, что интерфейс TaskGroup остается согласованным
export interface TaskGroup {
  id: string;                // Уникальный идентификатор для группы задач
  title: string;             // Заголовок группы задач
  tasks: Task[];             // Массив задач в группе
  isOpen: boolean;           // Флаг для отслеживания, открыта ли группа
  color: string;
}
