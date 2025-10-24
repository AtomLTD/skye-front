import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ui/theme-provider.tsx'
import { AccentColorProvider } from './contexts/AccentColorContext.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AccentColorProvider>
          <App />
        </AccentColorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
