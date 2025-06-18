import React from 'react';

class SlateErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Slate.js error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="slate-error-fallback">
                    <p>⚠️ Editor error occurred. Please refresh the page.</p>
                    <button onClick={() => this.setState({ hasError: false })}>
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default SlateErrorBoundary;