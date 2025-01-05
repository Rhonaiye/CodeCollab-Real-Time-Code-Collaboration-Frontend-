import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Countdown from './components/Countdown.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Countdown/>
  </StrictMode>,
)
