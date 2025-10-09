import axios from 'axios';
import { API_CONFIG } from '../constants/api.constants';
import storage from '../utils/storage';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => authInterceptor(config),
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => errorInterceptor(error, apiClient)
);

export default apiClient;
