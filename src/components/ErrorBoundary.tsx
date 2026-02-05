import * as Sentry from '@sentry/react'
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({ componentStack: errorInfo.componentStack })
      Sentry.captureException(error)
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-6">:(</div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Coś poszło nie tak
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Przepraszamy za niedogodności.<br />Błąd został automatycznie zgłoszony.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
