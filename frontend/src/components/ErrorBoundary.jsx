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
                <div className="empty-state" style={{ padding: 60 }}>
                    <div className="empty-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p style={{ marginBottom: 16 }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => this.setState({ hasError: false, error: null })}>
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
