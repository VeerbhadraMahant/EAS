import { Component, type ReactNode } from 'react'
import { AlertIcon } from './icons'

interface Props {
  children: ReactNode
  resetKey: string
}

interface State {
  error: Error | null
}

// Wraps the player. On a crash, remounts from local (Dexie) state rather
// than white-screening — CLAUDE.md rule 7.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="state-screen">
          <AlertIcon style={{ width: 40, height: 40, color: 'var(--color-destructive)' }} />
          <h2>Something went wrong</h2>
          <p style={{ color: 'var(--color-muted-foreground)', maxWidth: 420 }}>
            Your answers are saved on this device. Reloading will restore your test exactly where you left off.
          </p>
          <pre>{this.state.error.message}</pre>
          <button className="btn btn-primary" onClick={() => location.reload()}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
