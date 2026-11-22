// dataService.js
// Pets and clinics come from the FastAPI backend (MySQL).
// Appointments are still kept in localStorage until the appointments API is built (module 2).

import { apiRequest } from './api';

const DB_KEYS = {
  USERS: 'petwise-users',
  PETS: 'petwise-pets',
  APPOINTMENTS: 'petwise-appointments'
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

// --- Migration ---
const migrateLegacyAppointments = () => {
  const isMigrated = localStorage.getItem('petwise_appointment_migration_v1');
  if (isMigrated === 'true') return;

  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  const pets = readDB(DB_KEYS.PETS);
  
  let changed = false;

  const updatedAppointments = appointments.map(app => {
    let modifiedApp = { ...app };
    if (!modifiedApp.petId) {
      if (modifiedApp.patientName) {
        const foundPet = pets.find(p => p.name === modifiedApp.patientName);
        if (foundPet) {
          modifiedApp.petId = foundPet.id;
          changed = true;
        }
      }
    }
    return modifiedApp;
  });

  if (changed) {
    writeDB(DB_KEYS.APPOINTMENTS, updatedAppointments);
  }

  localStorage.setItem('petwise_appointment_migration_v1', 'true');
};

// --- Initialization ---
// Clinics now live in MySQL (see backend/app/seed.py).
export const initializeDB = () => {
  const isReset = localStorage.getItem('petwise_development_reset_completed');

  // Ensure appointments exist
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  if (!appointments || !Array.isArray(appointments)) {
    writeDB(DB_KEYS.APPOINTMENTS, []);
  }

  if (isReset !== 'true') {
    migrateLegacyAppointments();
  }
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
  initializeDB();
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


// --- Appointments ---
export const getAppointmentsByUserId = (userId) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  return appointments.filter(apt => apt.userId === userId);
};

export const getAppointmentsByClinicId = (clinicId) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  return appointments.filter(apt => String(apt.clinicId) === String(clinicId));
};

export const createAppointment = (appointmentData) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  const newApt = {
    ...appointmentData,
    id: 'apt-' + Date.now(),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  appointments.push(newApt);
  writeDB(DB_KEYS.APPOINTMENTS, appointments);
  return newApt;
};

export const updateAppointment = (appointmentId, appointmentData) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index !== -1) {
    appointments[index] = { 
      ...appointments[index], 
      ...appointmentData,
      updatedAt: new Date().toISOString()
    };
    writeDB(DB_KEYS.APPOINTMENTS, appointments);
    return appointments[index];
  }
  return null;
};

export const deleteAppointment = (appointmentId) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  const filtered = appointments.filter(a => a.id !== appointmentId);
  writeDB(DB_KEYS.APPOINTMENTS, filtered);
};

// --- Availability ---
// `clinic` is the clinic object (already loaded from the API by the caller).
export const getAvailableSlots = (clinic, date) => {
  if (!clinic) return { status: "CLINIC_NOT_SELECTED", slots: [] };
  if (!date) return { status: "DATE_NOT_SELECTED", slots: [] };
  const clinicId = clinic.id;
  
  // Convert local date to local dayOfWeek (0 = Sunday, 1 = Monday...)
  const dateObj = new Date(date + 'T00:00:00'); // Parse explicitly in local time assuming YYYY-MM-DD
  let dayOfWeek = dateObj.getDay();
  // Handle invalid dates
  if (isNaN(dayOfWeek)) {
    return { status: "DATE_NOT_SELECTED", slots: [] };
  }

  // Handle old clinics that use `start` and `end` on the top level object
  // If openingHours is not the array structure, use fallback
  let daySchedule = null;
  let isLegacy = false;
  if (Array.isArray(clinic.openingHours) && clinic.openingHours.length > 0 && typeof clinic.openingHours[0] === 'object') {
    daySchedule = clinic.openingHours.find(h => Number(h.dayOfWeek) === Number(dayOfWeek));
  } else if (clinic.openingHours && clinic.openingHours.start && clinic.openingHours.end) {
    // Legacy clinic
    isLegacy = true;
    daySchedule = {
      isOpen: true,
      openTime: clinic.openingHours.start,
      closeTime: clinic.openingHours.end
    };
  }

  if (!daySchedule || !daySchedule.isOpen) {
    return { status: "CLINIC_CLOSED", slots: [] };
  }
  
  const start = daySchedule.openTime;
  const end = daySchedule.closeTime;
  const duration = clinic.appointmentDurationMinutes || 30;
  
  // Create all possible slots
  const slots = [];
  let [currentHour, currentMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const endTotalMins = endHour * 60 + endMin;
  
  // Determine if selected date is today to block past slots
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const isToday = (date === todayStr);
  const currentNowMins = new Date().getHours() * 60 + new Date().getMinutes();

  while (currentHour * 60 + currentMin + duration <= endTotalMins) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    const slotMins = currentHour * 60 + currentMin;

    // Filter out past slots if today
    if (!(isToday && slotMins <= currentNowMins)) {
      slots.push(timeStr);
    }
    
    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  // Fetch booked appointments for that clinic and date
  const appointments = getAppointmentsByClinicId(clinicId);
  const bookedTimes = appointments
    .filter(apt => apt.appointmentDate === date && apt.status !== 'CANCELLED' && apt.status !== 'REJECTED')
    .map(apt => apt.appointmentTime);
    
  // Return slots that are NOT booked
  const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

  if (availableSlots.length === 0) {
    return { status: "FULLY_BOOKED", slots: [] };
  }

  return { status: "AVAILABLE", slots: availableSlots };
};
