// src/index.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd"; // Импорт DndProvider
import { HTML5Backend } from "react-dnd-html5-backend"; // Импорт backend для DnD
import store from "./store/store";
import App from "./App";
import "./index.scss";
import ErrorBoundary from "./Error/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
);
