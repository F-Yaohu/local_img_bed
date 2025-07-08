import React from 'react';
import { Alert, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="container mt-5">
                    <Alert variant="danger">
                        <Alert.Heading>Oops! Something went wrong.</Alert.Heading>
                        <p>
                            An unexpected error occurred, and the application has stopped.
                            Please try refreshing the page.
                        </p>
                        <hr />
                        <div className="d-flex justify-content-end">
                            <Button onClick={() => window.location.reload()} variant="outline-danger">
                                Refresh Page
                            </Button>
                        </div>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
