import axios from 'axios';
import store from '../store/store';
import { logout } from '../features/authSlice';

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

// Setup axios interceptor for automatic token refresh
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

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
          
          // Redirect to login
          window.location.href = '/';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // If not 401 or refresh failed, reject
      return Promise.reject(error);
    }
  );
};
