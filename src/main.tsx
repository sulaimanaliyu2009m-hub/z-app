import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Z Runtime Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white p-6 font-mono flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-red-400 mb-2">Z Encountered an Issue</h2>
          <pre className="text-xs bg-neutral-900 border border-neutral-800 p-4 rounded-xl max-w-md overflow-x-auto text-left text-neutral-300 mb-4 whitespace-pre-wrap">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="bg-sky-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-sky-600 transition"
          >
            Clear Stale Cache & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
