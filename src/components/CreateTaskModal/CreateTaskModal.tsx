import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import axios from "axios";
import { Task } from "../../types"; // Импортируйте ваш тип Task

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void; // Изменено на ваш тип Task
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateTask = async () => {
    try {
      // Создание нового задания на основе введенных данных
      const newTask: Omit<Task, "id" | "task_id"> = {
        title,
        description,
        content: description || "", // Поле content, если оно требуется
        priority: "low", // Установите значение по умолчанию
        type: "task", // Или любое другое значение по умолчанию
        column_id: "", // Это будет установлено в первую колонку в TaskBoard
      };

      // Выполните POST запрос для создания задачи
      const response = await axios.post("https://aiteamtg.store/yougile/api/tasks", newTask);

      // Извлеките ID задачи из ответа
      const { id } = JSON.parse(response.data.detail);

      // Установите ID задачи в объект задачи
      const createdTask: Task = {
        ...newTask,
        id, // Установите ID задачи
        task_id: id, // Установите task_id как id
      };

      // Вызовите коллбек с новой задачей
      onTaskCreated(createdTask);
      onClose(); // Закройте модальное окно после создания задачи
    } catch (error) {
      console.error("Ошибка создания задачи:", error);
    }
  };

  return (
    <Modal
      title="Создать новую задачу"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleCreateTask}>
          Создать
        </Button>,
      ]}
    >
      <Input
        placeholder="Название задачи"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input.TextArea
        placeholder="Описание задачи"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </Modal>
  );
};

export default CreateTaskModal;
