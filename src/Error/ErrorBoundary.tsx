import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode; // Добавляем children в Props
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Обновите состояние, чтобы следующий рендер показал запасной интерфейс
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Вы можете отправить информацию об ошибке на сервер
    console.error('Error caught in ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Можете показать запасной интерфейс
      return <h1>Что-то пошло не так.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
