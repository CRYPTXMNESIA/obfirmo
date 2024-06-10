import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

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
  <React.StrictMode style={{ backgroundColor: "black" }}>
    <App />
  </React.StrictMode>
);
