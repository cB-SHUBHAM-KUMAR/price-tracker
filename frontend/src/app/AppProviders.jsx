import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '../store';

/**
 * Wraps the app with all global providers (Redux, Theme, Notifications, etc.)
 * Add new providers here as the app grows.
 */
function AppProviders({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '8px', background: '#333', color: '#fff' },
        }}
      />
    </Provider>
  );
}

export default AppProviders;
