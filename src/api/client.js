import axios from 'axios';
import { API_CONFIG } from '../constants/api.constants';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // ✅ Add this to skip ngrok warning
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  authInterceptor,
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  errorInterceptor
);

export default apiClient;
