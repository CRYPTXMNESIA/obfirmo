import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// Register the service worker with an onUpdate handler
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Optionally, notify the user and give them the option to refresh immediately
    if (window.confirm("New version available! Would you like to update?")) {
      const waitingServiceWorker = registration.waiting;
      if (waitingServiceWorker) {
        waitingServiceWorker.addEventListener("statechange", (event) => {
          if (event.target.state === "activated") {
            window.location.reload();
          }
        });
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
      }
    }
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();