import axios from 'axios';

// In local dev, Vite's proxy forwards /api to localhost:5000 (see vite.config.js).
// In production, the frontend and backend are deployed separately, so the
// full backend URL must be provided via VITE_API_URL (set in Vercel's env vars).
const baseURL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL,
  withCredentials: true, // send/receive the httpOnly JWT cookie
});

// A 401 on any protected route means the session expired or was revoked.
// /auth/me is expected to 401 when simply not logged in yet, and
// /auth/login /auth/register handle their own 401s inline, so skip those.
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
