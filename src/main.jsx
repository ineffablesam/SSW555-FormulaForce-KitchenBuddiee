import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './css/index.css'
import { BrowserRouter } from 'react-router-dom'
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker?.register('/sw.js').catch(() => { })
  })
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
