import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    const label = this.props.label ? `[${this.props.label}]` : "";
    // Log detaliat în consolă pentru debugging
    // info.componentStack conține exact componenta care a produs eroarea
    console.error("ErrorBoundary caught", label, error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const showDebug =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.search.includes("debug=1"));

      return (
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <h2 className="text-red-700 font-semibold mb-2">
              A apărut o eroare {this.props.label ? `(${this.props.label})` : ""}
            </h2>
            <p className="text-sm text-red-800 mb-3">
              Ne pare rău, ceva nu a funcționat corect. Reîncearcă sau contactează suportul.
            </p>
            {showDebug && (
              <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-auto max-h-56">
                {String(this.state.error)}
                {"\n"}
                {this.state.info?.componentStack}
              </pre>
            )}
            <button
              type="button"
              className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Reîncarcă pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}