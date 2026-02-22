import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logout, clearError } from '../store/authSlice';

/**
 * Custom hook encapsulating all auth-related state and actions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
}

export default useAuth;
