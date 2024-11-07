// api.ts
const BASE_URL = "https://aiteamtg.store/yougile/api";

// Определение типа для задач
interface Task {
  id: string;
  title: string;
  description?: string;
  // Добавьте другие свойства, если нужно
}

// Функция для получения задач по идентификатору колонки
export const fetchTasksByColumnId = async (
  columnId: string
): Promise<Task[]> => {
  const response = await fetch(`${BASE_URL}/tasks/${columnId}`);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
};

// Функция для перемещения задачи
interface MoveTaskData {
  id: string;
  newColumnId: string;
}

export const moveTask = async (taskData: MoveTaskData): Promise<void> => {
  const response = await fetch(`${BASE_URL}/change_task`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error("Failed to move task");
};
