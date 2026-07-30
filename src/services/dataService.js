// dataService.js
// Handles localStorage mock database operations

const DB_KEYS = {
  USERS: 'petwise-users',
  PETS: 'petwise-pets',
  CLINICS: 'petwise-clinics',
  APPOINTMENTS: 'petwise-appointments'
};

const DEFAULT_CLINICS = [
  {
    id: 'clinic-1',
    name: 'Downtown Vet Center',
    address: '123 Main St, Cityville',
    city: 'Cityville',
    phone: '555-0101',
    email: 'contact@downtownvet.com',
    status: 'ACTIVE',
    isEmergencyClinic: true,
    isOpen24Hours: true,
    latitude: 40.7128,
    longitude: -74.0060,
    emergencyServices: ['Trauma', 'Surgery', 'Oxygen'],
    openingHours: { start: '00:00', end: '23:59' }, // Simplified for mock
    serviceIds: ['Vet Consultation', 'Vaccination', 'Dental Checkup'],
    staffIds: [],
    appointmentDurationMinutes: 30
  },
  {
    id: 'clinic-2',
    name: 'Happy Paws Grooming & Care',
    address: '456 Oak Rd, Townsville',
    city: 'Townsville',
    phone: '555-0202',
    email: 'hello@happypaws.com',
    status: 'ACTIVE',
    isEmergencyClinic: false,
    openingHours: { start: '08:00', end: '18:00' },
    serviceIds: ['Grooming', 'Vet Consultation'],
    staffIds: [],
    appointmentDurationMinutes: 45
  }
];

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
const migrateLegacyPets = () => {
  const isMigrated = localStorage.getItem('petwise_pet_image_migration_v2');
  if (isMigrated === 'true') return;

  const pets = readDB(DB_KEYS.PETS);
  let changed = false;

  let currentUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
  const fallbackOwnerId = currentUser.id || 'unknown_owner';

  const updatedPets = pets.map(pet => {
    let modified = { ...pet };
    let hasChanges = false;
    
    if (modified.imageUrl && !modified.avatar) {
      modified.avatar = modified.imageUrl;
      delete modified.imageUrl;
      hasChanges = true;
    }
    
    if (modified.breed && !modified.type) {
      modified.type = 'Dog'; // Guessing
      hasChanges = true;
    }
    
    if (!modified.ownerId) {
      modified.ownerId = fallbackOwnerId;
      hasChanges = true;
    }
    
    if (hasChanges) changed = true;
    return modified;
  });

  if (changed) {
    writeDB(DB_KEYS.PETS, updatedPets);
  }

  localStorage.setItem('petwise_pet_image_migration_v2', 'true');
};

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
const DEMO_CLINICS = [
  {
    id: 'demo-clinic-1',
    name: 'PetWise Central Veterinary Clinic',
    city: 'Tiberias',
    address: 'Demo location — Tiberias',
    phone: '1-800-PETWISE',
    status: 'ACTIVE',
    isDemo: true,
    appointmentDurationMinutes: 30,
    openingHours: [
      { dayOfWeek: 0, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 5, isOpen: false },
      { dayOfWeek: 6, isOpen: false }
    ],
    services: ['General Checkup', 'Vaccination', 'Dental Care', 'Health Follow-up', 'Emergency Consultation'],
    serviceIds: ['General Checkup', 'Vaccination', 'Dental Care', 'Health Follow-up', 'Emergency Consultation'],
    staffIds: [],
    isEmergencyClinic: true,
    isOpen24Hours: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-clinic-2',
    name: 'Lake Veterinary Center',
    city: 'Kinneret Area',
    address: 'Demo location — Kinneret Area',
    status: 'ACTIVE',
    isDemo: true,
    appointmentDurationMinutes: 30,
    openingHours: [
      { dayOfWeek: 0, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 6, isOpen: false }
    ],
    services: ['General Checkup', 'Vaccination', 'Grooming Consultation', 'Nutrition Consultation'],
    serviceIds: ['General Checkup', 'Vaccination', 'Grooming Consultation', 'Nutrition Consultation'],
    staffIds: [],
    isEmergencyClinic: false,
    isOpen24Hours: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-clinic-3',
    name: 'North Pet Care Clinic',
    city: 'Nazareth',
    address: 'Demo location — Nazareth',
    status: 'ACTIVE',
    isDemo: true,
    appointmentDurationMinutes: 45,
    openingHours: [
      { dayOfWeek: 0, isOpen: false },
      { dayOfWeek: 1, isOpen: true, openTime: '08:30', closeTime: '19:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '08:30', closeTime: '19:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '08:30', closeTime: '19:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '08:30', closeTime: '19:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '08:30', closeTime: '19:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '08:30', closeTime: '19:00' }
    ],
    services: ['General Checkup', 'Vaccination', 'Health Follow-up', 'Dental Care'],
    serviceIds: ['General Checkup', 'Vaccination', 'Health Follow-up', 'Dental Care'],
    staffIds: [],
    isEmergencyClinic: false,
    isOpen24Hours: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initializeDB = () => {
  const isReset = localStorage.getItem('petwise_development_reset_completed');

  const clinics = readDB(DB_KEYS.CLINICS);
  const CLINIC_SEED_VERSION = "petwise_demo_clinics_v1";
  if (!localStorage.getItem(CLINIC_SEED_VERSION) && clinics.length === 0) {
    writeDB(DB_KEYS.CLINICS, DEMO_CLINICS);
    localStorage.setItem(CLINIC_SEED_VERSION, "completed");
  }
  
  // Ensure appointments exist
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  if (!appointments || !Array.isArray(appointments)) {
    writeDB(DB_KEYS.APPOINTMENTS, []);
  }

  if (isReset !== 'true') {
    migrateLegacyPets();
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

// --- Exports ---
export const getPetsByOwnerId = (ownerId) => {
  const pets = readDB(DB_KEYS.PETS);
  return pets.filter(pet => String(pet.ownerId) === String(ownerId));
};

export const getPetById = (petId) => {
  const pets = readDB(DB_KEYS.PETS);
  return pets.find(pet => pet.id === petId || pet.name.toLowerCase() === petId);
};

export const createPet = (petData) => {
  const pets = readDB(DB_KEYS.PETS);
  const newPet = { ...petData, id: Date.now().toString() };
  pets.push(newPet);
  writeDB(DB_KEYS.PETS, pets);
  return newPet;
};

export const updatePet = (petId, petData) => {
  const pets = readDB(DB_KEYS.PETS);
  const index = pets.findIndex(p => p.id === petId);
  if (index !== -1) {
    pets[index] = { ...pets[index], ...petData };
    writeDB(DB_KEYS.PETS, pets);
    return pets[index];
  }
  return null;
};

export const deletePet = (petId) => {
  const pets = readDB(DB_KEYS.PETS);
  const filtered = pets.filter(p => p.id !== petId);
  writeDB(DB_KEYS.PETS, filtered);
};


// --- Clinics ---
export const getClinics = () => {
  return readDB(DB_KEYS.CLINICS);
};

export const getClinicById = (clinicId) => {
  const clinics = readDB(DB_KEYS.CLINICS);
  return clinics.find(c => c.id === clinicId);
};

export const createClinic = (clinicData) => {
  const clinics = readDB(DB_KEYS.CLINICS);
  const newClinic = { ...clinicData, id: 'clinic-' + Date.now() };
  clinics.push(newClinic);
  writeDB(DB_KEYS.CLINICS, clinics);
  return newClinic;
};

export const updateClinic = (clinicId, clinicData) => {
  const clinics = readDB(DB_KEYS.CLINICS);
  const index = clinics.findIndex(c => c.id === clinicId);
  if (index !== -1) {
    clinics[index] = { ...clinics[index], ...clinicData };
    writeDB(DB_KEYS.CLINICS, clinics);
    return clinics[index];
  }
  return null;
};


// --- Appointments ---
export const getAppointmentsByUserId = (userId) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  return appointments.filter(apt => apt.userId === userId);
};

export const getAppointmentsByClinicId = (clinicId) => {
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  return appointments.filter(apt => apt.clinicId === clinicId);
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
export const getAvailableSlots = (clinicId, date) => {
  if (!clinicId) return { status: "CLINIC_NOT_SELECTED", slots: [] };
  if (!date) return { status: "DATE_NOT_SELECTED", slots: [] };

  const clinic = getClinicById(clinicId);
  if (!clinic) return { status: "CLINIC_NOT_SELECTED", slots: [] };
  
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
