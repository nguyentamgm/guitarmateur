import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] caught:', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: '#0c0e0d',
            color: '#e8ece9',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: '#e8ece9' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#7e857f', fontSize: 15, maxWidth: 480, lineHeight: 1.6, margin: '0 0 24px' }}>
            The app encountered an error. Your practice state is saved in localStorage and will
            persist.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#c3f04b',
              color: '#0c0e0d',
              border: 'none',
              borderRadius: 20,
              padding: '8px 22px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '.04em',
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
