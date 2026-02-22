import { BrowserRouter } from 'react-router-dom';
import AppProviders from './AppProviders';
import ErrorBoundary from './ErrorBoundary';
import AppRoutes from '../routes/AppRoutes';
import Navbar from '../shared/ui/Navbar/Navbar';
import { ThemeProvider } from '../shared/context/ThemeContext';
import '../styles/theme-variables.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProviders>
          <BrowserRouter>
            <div className="app-shell">
              <Navbar />
              <div className="app-content">
                <AppRoutes />
              </div>
            </div>
          </BrowserRouter>
        </AppProviders>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
