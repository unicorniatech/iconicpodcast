import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics on client side
inject();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>
);