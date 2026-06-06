import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, color: '#f87171', background: '#0d0d0f',
          fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 13,
          minHeight: '100vh'
        }}>
          <strong>Error:</strong>{'\n'}{this.state.error.message}{'\n\n'}
          {this.state.error.stack}
        </div>
      )
    }
    return this.props.children
  }
}
