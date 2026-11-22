// dataService.js
// Pets and clinics come from the FastAPI backend (MongoDB).
// Appointments, medical records and reminders also come from the API (module 2).

import { apiRequest } from './api';

const DB_KEYS = {
  USERS: 'petwise-users',
};

// Helper to read from localStorage
const readDB = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

// Helper to write to localStorage
const writeDB = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Reset ---
export const resetDevelopmentData = (preserveAdminId) => {
  const users = readDB(DB_KEYS.USERS) || [];
  const remainingUsers = users.filter(user => String(user.id) === String(preserveAdminId));
  
  const PETWISE_RESET_KEYS = [
    "petwise-users",
    "petwise-pets",
    "petwise-appointments",
    "petwise-inventory",
    "petwise-cart",
    "petwise-reminders",
    "petwise-orders",
    "petwise-medical_records",
    "petwise-vet_visits",
    "petwise-feeding_records",
    "petwise-weight_records",
    "petwise-habits",
    "petwise-community_posts",
    "petwise-notifications",
    "petwise-activity_logs",
    "petwise-active-pet-index",
    "petwise_pet_image_migration_v2",
    "petwise_appointment_migration_v1",
    // New Community Keys
    "petwise-community-posts",
    "petwise-community-comments",
    "petwise-community-stories",
    "petwise-community-groups",
    "petwise-community-follows",
    "petwise-community-reports",
    "petwise-community-hidden",
    // Emergency Keys
    "petwise-emergency-settings",
    "petwise-emergency-guides"
  ];
  
  PETWISE_RESET_KEYS.forEach(key => localStorage.removeItem(key));
  
  if (remainingUsers.length > 0) {
    writeDB(DB_KEYS.USERS, remainingUsers);
  }
  
  localStorage.setItem('petwise_development_reset_completed', 'true');
  return true;
};

// --- Pets (API) ---
// The server only returns the logged-in user's pets, so no owner id is needed.
export const getMyPets = () => apiRequest('/pets');

// Kept for older callers; ownerId is ignored because the server decides by the login token.
// eslint-disable-next-line no-unused-vars
export const getPetsByOwnerId = (_ownerId) => getMyPets();

// Throws ApiError with status 404 (not found) or 403 (not your pet).
export const getPetById = (petId) => apiRequest(`/pets/${encodeURIComponent(petId)}`);

export const createPet = (petData) => apiRequest('/pets', { method: 'POST', body: petData });

export const updatePet = (petId, petData) =>
  apiRequest(`/pets/${encodeURIComponent(petId)}`, { method: 'PUT', body: petData });

export const deletePet = (petId) =>
  apiRequest(`/pets/${encodeURIComponent(petId)}`, { method: 'DELETE' });

// "22.5" -> "22.5 kg", missing -> fallback text
export const formatWeight = (pet, fallback = '') =>
  pet && pet.weightKg != null ? `${pet.weightKg} kg` : fallback;


// --- Clinics (API) ---
export const getClinics = () => apiRequest('/clinics', { auth: false });

export const getClinicById = (clinicId) =>
  apiRequest(`/clinics/${encodeURIComponent(clinicId)}`, { auth: false });

export const createClinic = (clinicData) =>
  apiRequest('/clinics', { method: 'POST', body: clinicData });

export const updateClinic = (clinicId, clinicData) =>
  apiRequest(`/clinics/${encodeURIComponent(clinicId)}`, { method: 'PUT', body: clinicData });


// --- Appointments (API) ---
// Owners get their own, clinic staff their clinic's, admins all (decided by the server).
export const getAppointments = (status) =>
  apiRequest(status ? `/appointments?status=${encodeURIComponent(status)}` : '/appointments');

export const createAppointment = (data) => apiRequest('/appointments', { method: 'POST', body: data });

// Owner changes a request; it goes back to PENDING.
export const updateAppointment = (appointmentId, data) =>
  apiRequest(`/appointments/${appointmentId}`, { method: 'PUT', body: data });

export const cancelAppointment = (appointmentId) =>
  apiRequest(`/appointments/${appointmentId}/cancel`, { method: 'POST' });

export const acceptSuggestedTime = (appointmentId) =>
  apiRequest(`/appointments/${appointmentId}/accept-suggestion`, { method: 'POST' });

// Clinic staff: CONFIRMED | REJECTED | RESCHEDULE_REQUESTED | IN_PROGRESS | COMPLETED
export const setAppointmentStatus = (appointmentId, status, extra = {}) =>
  apiRequest(`/appointments/${appointmentId}/status`, { method: 'POST', body: { status, ...extra } });

export const getClinicPatients = () => apiRequest('/staff/patients');

// --- Availability (API) ---
// Returns { status: 'AVAILABLE' | 'CLINIC_CLOSED' | 'FULLY_BOOKED', slots: ['09:00', ...] }
export const getAvailableSlots = (clinicId, date, excludeAppointmentId) => {
  const params = new URLSearchParams({ date });
  // For today, hide times that already passed (in the user's own time zone)
  if (date === new Date().toLocaleDateString('en-CA')) {
    params.set('after', new Date().toTimeString().slice(0, 5));
  }
  if (excludeAppointmentId) params.set('exclude', excludeAppointmentId);
  return apiRequest(`/clinics/${encodeURIComponent(clinicId)}/slots?${params}`, { auth: false });
};
