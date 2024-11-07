import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Task {
  id: string; // Unique identifier for the task
  content: string; // Content of the task
  task_id: string; // Existing property for tracking
  title: string; // Title of the task
  description?: string; // Optional description
  deadline?: string; // Optional deadline
  priority: 'low' | 'medium' | 'high'; // Priority levels
  type: 'feature' | 'bug' | 'task'; // Task type
  estimation?: number; // Optional estimation
  sprint?: string; // Optional sprint
  column_id: string; // Add column_id to track where the task is
}

interface TaskGroup {
  id: string; // Unique identifier for the task group
  title: string; // Title of the task group
  tasks: Task[]; // Array of tasks in the group
  isOpen: boolean; // Flag to track if the group is open
  color: string;
}

interface TaskState {
  taskGroups: TaskGroup[]; // Array of task groups
}

const initialState: TaskState = {
  taskGroups: [],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setColumns(state, action: PayloadAction<TaskGroup[]>) {
      state.taskGroups = action.payload;
    },
    moveTask(state, action: PayloadAction<{ sourceGroupId: string; destinationGroupId: string; taskId: string }>) {
      const { sourceGroupId, destinationGroupId, taskId } = action.payload;
      const sourceGroup = state.taskGroups.find((group) => group.id === sourceGroupId);
      const destinationGroup = state.taskGroups.find((group) => group.id === destinationGroupId);

      if (!sourceGroup || !destinationGroup) return;

      const taskToMove = sourceGroup.tasks.find((task) => task.task_id === taskId);
      if (!taskToMove) return;

      // Remove the task from the source group
      sourceGroup.tasks = sourceGroup.tasks.filter((task) => task.task_id !== taskId);

      // Add the task to the destination group
      destinationGroup.tasks.push(taskToMove);
    },
    toggleGroup(state, action: PayloadAction<string>) {
      const groupId = action.payload;
      const group = state.taskGroups.find((g) => g.id === groupId);
      if (group) {
        group.isOpen = !group.isOpen;
      }
    },
    // Новое действие для добавления задачи
    addTask(state, action: PayloadAction<Task>) {
      const newTask = action.payload;
      const firstGroup = state.taskGroups[0]; // Получаем первую группу

      if (firstGroup) {
        // Добавляем новую задачу в первую группу
        firstGroup.tasks.push(newTask);
      }
    }
  },
});

// Экспортируем действия
export const { setColumns, moveTask, toggleGroup, addTask } = taskSlice.actions;

// Экспортируем редюсер
export default taskSlice.reducer;