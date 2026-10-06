import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #E6ECF1", margin: "16px 0" }}>
          <h3 style={{ color: "#C94C4C", marginBottom: "8px" }}>Something went wrong displaying this view</h3>
          <p style={{ color: "#627D98", fontSize: "14px", marginBottom: "16px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "8px 18px",
              background: "#2F6690",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
