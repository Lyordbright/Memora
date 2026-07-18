import axios from 'axios';


export const baseURL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL,
  withCredentials: true, 
});


const SKIP_AUTO_REDIRECT = ['/auth/me', '/auth/login', '/auth/register'];

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const shouldRedirect = err.response?.status === 401 && !SKIP_AUTO_REDIRECT.some((p) => url.includes(p));
    if (shouldRedirect && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;