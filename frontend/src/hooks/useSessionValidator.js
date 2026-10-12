import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import axios from 'axios';

/**
 * Hook to validate session on app initialization
 * Proactively checks if access token is valid before protected routes render
 * If token is expired, axios interceptor will handle refresh automatically
 * If refresh fails, user will be logged out
 */
export const useSessionValidator = () => {
  const [validating, setValidating] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const validateSession = async () => {
      // If no authenticated session exists, skip validation
      if (!isAuthenticated || !user?.employeeId) {
        console.log('ℹ️ No authenticated session to validate');
        setValidating(false);
        return;
      }

      console.log('🔐 Validating session for user:', user.employeeId);

      try {
        // Make a lightweight authenticated request to validate token
        // If access token is expired, axios interceptor will automatically:
        // 1. Catch the 401 error
        // 2. Call refresh token endpoint
        // 3. Retry the request with new token
        // 4. Or logout if refresh also fails
        await axios.get(
          `http://localhost:3000/api/v1/employee/${user.employeeId}/access`,
          { withCredentials: true }
        );
        
        console.log('✅ Session validated successfully');
      } catch (error) {
        // If we get here, it means:
        // 1. Either the refresh token also expired/invalid
        // 2. Or the interceptor already handled logout
        // The interceptor will have already dispatched logout and redirected
        console.log('⚠️ Session validation failed, interceptor handling logout');
      } finally {
        // Always mark validation as complete to let app render
        // If session was invalid, interceptor will have redirected to login
        setValidating(false);
      }
    };

    validateSession();
  }, []); // Run only once on mount

  return { validating };
};
