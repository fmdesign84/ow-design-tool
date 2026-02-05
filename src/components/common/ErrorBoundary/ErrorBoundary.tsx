/**
 * ErrorBoundary - React 에러 경계 컴포넌트
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.icon}>⚠️</div>
            <h2 className={styles.title}>문제가 발생했습니다</h2>
            <p className={styles.message}>
              페이지를 불러오는 중 오류가 발생했습니다.
            </p>
            {this.state.error && (
              <details className={styles.details}>
                <summary>상세 정보</summary>
                <pre className={styles.errorText}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button className={styles.retryButton} onClick={this.handleRetry}>
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
