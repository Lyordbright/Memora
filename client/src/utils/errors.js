export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message === 'Network Error') return "Can't reach the server right now. Check your connection.";
  return fallback;
}
