import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types or paths if needed
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;
