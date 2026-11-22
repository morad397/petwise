// reminderService.js
// The logged-in user's reminders.

import { apiRequest } from './api';

export const getReminders = ({ includeCompleted = true, petId } = {}) => {
  const params = new URLSearchParams({ include_completed: String(includeCompleted) });
  if (petId) params.set('pet_id', petId);
  return apiRequest(`/reminders?${params}`);
};

export const createReminder = (data) => apiRequest('/reminders', { method: 'POST', body: data });
export const updateReminder = (id, data) => apiRequest(`/reminders/${id}`, { method: 'PUT', body: data });
export const completeReminder = (id) => apiRequest(`/reminders/${id}/complete`, { method: 'POST' });
export const snoozeReminder = (id, minutes = 60) =>
  apiRequest(`/reminders/${id}/snooze`, { method: 'POST', body: { minutes } });
export const deleteReminder = (id) => apiRequest(`/reminders/${id}`, { method: 'DELETE' });

// "2026-12-01T18:00:00" -> "Tue, Dec 1 • 6:00 PM"
export const formatDueDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  const day = d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }),
  });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} • ${time}`;
};

export const isOverdue = (reminder) => !reminder.isCompleted && new Date(reminder.dueDate) < new Date();
