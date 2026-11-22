// authService.js
// Login, sign-up and the current user, backed by the FastAPI /api/auth endpoints.
// The token and a copy of the user are kept in localStorage so a page refresh keeps you logged in.

import { apiRequest, TOKEN_KEY, USER_KEY } from './api';

function saveSession({ accessToken, user }) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Cached user from the last login / refresh (no network call).
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  } catch {
    return {};
  }
}

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  return saveSession(data);
}

export async function register({ fullName, email, password, role, clinicId, department }) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      fullName,
      email,
      password,
      role,
      clinicId: clinicId ? Number(clinicId) : null,
      department: department || null,
    },
  });
  return saveSession(data);
}

// Asks the server who is logged in (the server is the source of truth for the role).
export async function fetchMe() {
  const user = await apiRequest('/auth/me');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateMe(changes) {
  const user = await apiRequest('/auth/me', { method: 'PUT', body: changes });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function homePathForRole(user) {
  switch (user && user.role) {
    case 'ADMIN':
      return '/admin';
    case 'CLINIC_STAFF':
      return user.clinicId ? '/staff' : '/staff/profile';
    default:
      return '/dashboard';
  }
}

// --- Admin user management ---
export const getAllUsers = () => apiRequest('/users');
export const adminCreateUser = (userData) => apiRequest('/users', { method: 'POST', body: userData });
export const adminUpdateUser = (userId, changes) =>
  apiRequest(`/users/${userId}`, { method: 'PATCH', body: changes });
export const adminDeleteUser = (userId) => apiRequest(`/users/${userId}`, { method: 'DELETE' });
