// src/App.tsx

import React from "react";
import { useSelector } from "react-redux";
import TaskBoard from "./components/TaskBoard/TaskBoard";
import LoginForm from "./components/LoginForm/LoginForm";
import styles from "./App.module.scss";
import { selectIsAuthenticated } from "./store/auth/authSelectors";
import { RootState } from "./store/store";
import ErrorBoundary from "./Error/ErrorBoundary";

const App: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const refreshCount = useSelector(
    (state: RootState) => state.taskBoard.refreshCount
  );

  return (
    <ErrorBoundary>
      <div
        className={`${styles.app} ${
          isAuthenticated ? styles.taskboard : styles.login
        }`}
      >
        {isAuthenticated ? <TaskBoard key={refreshCount} /> : <LoginForm />}
      </div>
    </ErrorBoundary>
  );
};

export default App;
