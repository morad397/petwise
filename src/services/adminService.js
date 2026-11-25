// adminService.js
// Admin-only API calls: dashboard numbers, reported posts, activity log.

import { apiRequest } from './api';

export const getAdminStats = () => apiRequest('/admin/stats');
export const getReportedPosts = () => apiRequest('/admin/reports');
export const dismissReports = (postId) => apiRequest(`/admin/reports/${postId}`, { method: 'DELETE' });
export const getActivityLog = () => apiRequest('/admin/activity');
