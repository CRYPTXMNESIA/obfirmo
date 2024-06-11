import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import { registerSW } from 'virtual:pwa-register';

const App = lazy(() => import('./App'));

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
    <Suspense fallback={
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: '#bebebe', // Adjust this color if needed
            fontSize: '.70rem',
            lineHeight: "1.2",
            whiteSpace: "pre",
            fontWeight: 'bold',
        }}>
            {`    __                ___            
   / /___  ____ _____/ (_)___  ____ _
  / / __ \\/ __ \`/ __  / / __ \\/ __ \`/
 / / /_/ / /_/ / /_/ / / / / / /_/ / 
/_/\\____/\\__,_/\\__,_/_/_/ /_/\\__, /  
                            /____/   `}
        </div>
    }>
      <App />
    </Suspense>
  </React.StrictMode>
);
