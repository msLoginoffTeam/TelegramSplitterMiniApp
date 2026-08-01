import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error reporting will be added together with the observability decision.
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main>
          <h1>Не удалось открыть приложение</h1>
          <p>Попробуйте открыть его ещё раз.</p>
        </main>
      );
    }

    return this.props.children;
  }
}
