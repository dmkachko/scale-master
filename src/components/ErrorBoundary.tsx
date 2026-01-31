/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

import { Component, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p className="error-message">
              The application encountered an unexpected error.
            </p>

            {this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <div className="error-stack">
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="button-reset">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="button-reload"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
