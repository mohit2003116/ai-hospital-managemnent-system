import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { dataStore } from './utils/dataStore'
import { LanguageProvider } from './context/LanguageContext'

// Initialize realistic data structures
dataStore.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
