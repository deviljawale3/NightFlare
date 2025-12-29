import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Log to error reporting service if available
        if (typeof window !== 'undefined' && (window as any).errorReporter) {
            (window as any).errorReporter.log(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 z-[9999]">
                    <div className="max-w-2xl w-full bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="text-5xl">⚠️</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-black text-center mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                            Oops! Something went wrong
                        </h1>

                        {/* Message */}
                        <p className="text-gray-300 text-center mb-6">
                            The game encountered an unexpected error. Don't worry, your progress is saved!
                        </p>

                        {/* Error Details (Development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-black/40 rounded-lg p-4 mb-6 max-h-48 overflow-auto">
                                <p className="text-red-400 font-mono text-sm mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                Reload Game
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-gray-400 text-sm text-center mt-6">
                            If this problem persists, please contact support or try clearing your browser cache.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
