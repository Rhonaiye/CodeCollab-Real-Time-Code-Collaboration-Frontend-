import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import DriverDashboard from './components/Countdown.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <DriverDashboard/>
  </StrictMode>,
)





