import './assets/base.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import verData from '../src/assets/version.json';

const getVersion = () => {
  return `${verData.version}-${verData.branch}-${verData["commit hash"]}`;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <p className="absolute bottom-0 right-0 text-muted-foreground">{getVersion()}</p>
  </React.StrictMode>
)
