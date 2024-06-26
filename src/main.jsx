import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register the service worker with an onUpdate handler
const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm("New version available! Would you like to install it now?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('The app is ready to work offline');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode style={{ backgroundColor: "#0b0d11" }}>
    <App />
  </React.StrictMode>
);
