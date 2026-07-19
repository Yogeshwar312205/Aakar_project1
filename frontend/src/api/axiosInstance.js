import axios from 'axios';
import store from '../store/store.js';
import {loginSuccess, logout} from '../features/authSlice.js'; // Action to set login state

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/', // Set your API base URL
    timeout: 10000, // Optional, set a timeout
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const accessToken = state.auth.accessToken;

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response, // Pass through the response if it's successful
    async (error) => {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        // Check for 401 error (token expired) and try to refresh token
        if (error.response && error.response.status === 401 && refreshToken) {
            try {
                const response = await axios.post('/api/refresh-token', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken, accessString } = response.data;

                // Update Redux state with the new tokens
                store.dispatch(loginSuccess({ accessToken, refreshToken: newRefreshToken, accessString }));

                // Retry the original request with the new access token
                error.config.headers['Authorization'] = `Bearer ${accessToken}`;
                return axiosInstance(error.config);  // Retry the failed request
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                store.dispatch(logout());  // Logout user if refresh fails
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
