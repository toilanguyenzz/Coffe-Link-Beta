import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Note: Removed React.StrictMode to fix Leaflet map initialization issues
// Leaflet maps don't handle double-mount in StrictMode well (React 18)
root.render(
  <App />
);