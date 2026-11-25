// emergencyService.js
// SOS page data from the API: emergency contact settings and first-aid guides.
// Everyone can read them; only admins change them (System page).

import { apiRequest } from './api';

// { emergencyPhone, emergencyContactName, availabilityText, emergencyDisclaimer }
export const getEmergencySettings = () => apiRequest('/emergency/settings', { auth: false });
export const updateEmergencySettings = (settings) =>
  apiRequest('/emergency/settings', { method: 'PUT', body: settings });

// [{ id, title, summary, warning, instructions: [], sourceName, sourceUrl, reviewedAt, active }]
export const getActiveGuides = () => apiRequest('/emergency/guides', { auth: false });
export const getAllGuides = () => apiRequest('/emergency/guides?include_inactive=true');

export const saveEmergencyGuide = (guide) => {
  const body = {
    title: guide.title,
    summary: guide.summary || '',
    warning: guide.warning || null,
    instructions: guide.instructions,
    sourceName: guide.sourceName || '',
    sourceUrl: guide.sourceUrl || null,
    reviewedAt: guide.reviewedAt || null,
    active: guide.active !== false,
  };
  return guide.id
    ? apiRequest(`/emergency/guides/${guide.id}`, { method: 'PUT', body })
    : apiRequest('/emergency/guides', { method: 'POST', body });
};

export const deleteEmergencyGuide = (guideId) => apiRequest(`/emergency/guides/${guideId}`, { method: 'DELETE' });
