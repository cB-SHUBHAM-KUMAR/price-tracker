import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import priceReducer from '../features/price-checker/store/priceSlice';
import alertsReducer from '../features/alerts/store/alertsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  price: priceReducer,
  alerts: alertsReducer,
});

export default rootReducer;


