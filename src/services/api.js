// api.js
// One place for every call to the PetWise backend (FastAPI).
// The backend address comes from VITE_API_URL in .env.development.

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export const TOKEN_KEY = 'petwise-token';
export const USER_KEY = 'petwise-user';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// FastAPI returns { detail: "message" } or, for validation errors, { detail: [{ msg, loc }, ...] }
function readErrorMessage(body, status) {
  const detail = body && body.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : '';
    return field && field !== 'body' ? `${field}: ${first.msg}` : first.msg;
  }
  if (status === 0) return 'Cannot reach the PetWise server. Is the backend running?';
  return `Request failed (${status})`;
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(readErrorMessage(null, 0), 0);
  }

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Token missing/expired on a protected call: forget the session.
    if (response.status === 401 && auth) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    throw new ApiError(readErrorMessage(data, response.status), response.status);
  }
  return data;
}
