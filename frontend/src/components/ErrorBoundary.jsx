import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center py-16 px-5 text-muted-foreground">
                    <div className="text-5xl mb-4 opacity-40">⚠️</div>
                    <h3 className="text-base font-semibold mb-1 text-foreground">Something went wrong</h3>
                    <p className="text-sm mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
