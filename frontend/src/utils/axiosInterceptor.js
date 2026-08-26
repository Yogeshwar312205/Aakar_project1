import axios from 'axios';
import store from '../store/store';
import { logout } from '../features/authSlice';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Setup axios interceptor for automatic token refresh and error handling
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 403 Forbidden (Authorization Error) - RBAC
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'You do not have permission to perform this action';
        
        // Show user-friendly error message
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Log for debugging
        console.error('[RBAC] Access Denied:', {
          url: originalRequest.url,
          method: originalRequest.method,
          message: errorMessage
        });
        
        // Return the error without retrying
        return Promise.reject(error);
      }

      // Check if error is 401 (Unauthorized) and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axios(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the access token
          const response = await axios.post(
            `${API_BASE_URL}/employee/refreshToken`,
            {},
            {
              withCredentials: true,
            }
          );

          if (response.data.data.accessToken) {
            // Update token in localStorage
            const authData = JSON.parse(localStorage.getItem('authData'));
            if (authData) {
              authData.accessToken = response.data.data.accessToken;
              localStorage.setItem('authData', JSON.stringify(authData));
            }

            // Process queued requests
            processQueue(null, response.data.data.accessToken);

            // Retry original request
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed - log user out
          processQueue(refreshError, null);
          store.dispatch(logout());
          
          // Show logout message
          toast.info('Session expired. Please login again.', {
            position: 'top-right',
            autoClose: 3000,
          });
          
          // Redirect to login
          window.location.href = '/';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error status codes with user-friendly messages
      if (error.response) {
        const status = error.response.status;
        let message = '';
        
        switch (status) {
          case 400:
            message = error.response?.data?.message || 'Invalid request. Please check your input.';
            break;
          case 404:
            message = error.response?.data?.message || 'The requested resource was not found.';
            break;
          case 500:
            message = error.response?.data?.message || 'Server error. Please try again later.';
            break;
          case 503:
            message = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            message = error.response?.data?.message || 'An error occurred. Please try again.';
        }
        
        // Show error toast for non-401/403 errors
        if (status !== 401 && status !== 403) {
          toast.error(message, {
            position: 'top-right',
            autoClose: 4000,
          });
        }
      } else if (error.request) {
        // Network error - no response received
        toast.error('Network error. Please check your connection.', {
          position: 'top-right',
          autoClose: 4000,
        });
      }

      // If not 401 or refresh failed, reject
      return Promise.reject(error);
    }
  );
};
