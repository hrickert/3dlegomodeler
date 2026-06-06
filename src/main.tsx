import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { StoreProvider } from './contexts/StoreContext'
import { theme } from './theme'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StoreProvider>
          <App />
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
