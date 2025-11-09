import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-80 bg-background text-foreground">
          <div className="p-4">
            <Card className="border-0">
              <CardContent className="p-4 text-center space-y-3">
                <h2 className="text-lg font-semibold text-destructive">
                  Something went wrong
                </h2>
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    window.location.reload()
                  }}
                  className="w-full h-8 text-xs"
                >
                  Reload App
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
