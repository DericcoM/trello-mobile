import React, { useState, useEffect, useRef } from "react";
import { Card, Tabs, Spin, message } from "antd";
import styles from './TaskDetail.module.scss';
import { Task } from '../../types'; // Импорт интерфейса Task

const { TabPane } = Tabs;

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const priorityColors: { [key in Task["priority"]]: string } = {
  low: "#d9f7be", // Светло-зеленый
  medium: "#ffe58f", // Светло-желтый
  high: "#ffccc7", // Светло-красный
};

const typeColors: { [key: string]: string } = {
  feature: "#e6f7ff", // Светло-голубой
  bug: "#fffbe6", // Светло-желтый
  task: "#fff0f6", // Светло-розовый
};

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState("chat"); // Set active tab to 'chat'
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchChatMessages = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(`https://aiteamtg.store/yougile/api/get_chat/${task.task_id}`);
        const data = await response.json();
        setChatMessages(data);
      } catch (error) {
        message.error("Ошибка при загрузке чата");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchChatMessages(); // Fetch messages on mount
  }, [task.task_id]); // Only depend on task_id

  return (
    <div className={styles.fullScreenContainer}>
      <div ref={modalRef} className={styles.taskDetailCard}>
        <Card title={task.content}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Чат" key="chat">
              {loading ? (
                <div className={styles.loadingContainer}>
                  <Spin />
                </div>
              ) : (
                <div className={styles.chatContainer}>
                  {chatMessages.length === 0 ? (
                    <p className={styles.noMessages}>Нет сообщений в чате.</p>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className={`${styles.chatMessage} ${msg.sender === 'You' ? styles.sent : styles.received}`}>
                        <span className={styles.chatText}>{msg.text}</span>
                        <div className={styles.chatSender}>{msg.sender}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </TabPane>
            <TabPane tab="Описание" key="description">
              <div className={styles.infoContainer}>
                {task.priority && (
                  <div
                    className={styles.infoBlock}
                    style={{ backgroundColor: priorityColors[task.priority] }}
                  >
                    <strong>Приоритет:</strong> {task.priority}
                  </div>
                )}
                {task.type && (
                  <div
                    className={styles.infoBlock}
                    style={{ backgroundColor: typeColors[task.type] }}
                  >
                    <strong>Тип:</strong> {task.type}
                  </div>
                )}
                {task.deadline && (
                  <div className={styles.infoBlock}>
                    <strong>Дедлайн:</strong> {task.deadline}
                  </div>
                )}
                {task.estimation !== undefined && (
                  <div className={styles.infoBlock}>
                    <strong>Оценка:</strong> {task.estimation} дней
                  </div>
                )}
                {task.sprint && (
                  <div className={styles.infoBlock}>
                    <strong>Спринт:</strong> {task.sprint}
                  </div>
                )}
                {task.description && (
                  <div className={styles.infoBlock}>
                    <strong>Описание:</strong> {task.description}
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;
