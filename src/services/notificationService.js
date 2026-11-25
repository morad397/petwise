// notificationService.js
// The logged-in user's notifications (sent by the server when something happens).

import { apiRequest } from './api';

// returns { items: [{ id, type, title, message, link, isRead, createdAt }], unreadCount }
export const getNotifications = () => apiRequest('/notifications');
export const markNotificationRead = (id) => apiRequest(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => apiRequest('/notifications/read-all', { method: 'POST' });
export const deleteNotification = (id) => apiRequest(`/notifications/${id}`, { method: 'DELETE' });

// "5 min ago" / "3 h ago" / "Nov 24"
export const timeAgo = (iso) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
