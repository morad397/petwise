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
    phone: '555-0101',
    email: 'contact@downtownvet.com',
    status: 'ACTIVE',
    openingHours: { start: '09:00', end: '17:00' }, // Simplified for mock
    serviceIds: ['Vet Consultation', 'Vaccination', 'Dental Checkup'],
    staffIds: [],
    appointmentDurationMinutes: 30
  },
  {
    id: 'clinic-2',
    name: 'Happy Paws Grooming & Care',
    address: '456 Oak Rd, Townsville',
    phone: '555-0202',
    email: 'hello@happypaws.com',
    status: 'ACTIVE',
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
  const isMigrated = localStorage.getItem('petwise_migration_v1');
  if (isMigrated === 'true') return;

  const pets = readDB(DB_KEYS.PETS);
  let changed = false;

  // Since we only have the current user in this prototype (no user table), 
  // we can only reliably migrate pets matching the current user's email, or those with no email at all.
  let currentUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
  
  // If the current user exists but has no ID (legacy signup), generate one for them now.
  if (currentUser.email && !currentUser.id) {
    currentUser.id = Date.now().toString();
    localStorage.setItem('petwise-user', JSON.stringify(currentUser));
  }

  const updatedPets = pets.map(pet => {
    if (!pet.ownerId) {
      changed = true;
      // If the pet has an ownerEmail matching the current user, or no ownerEmail at all, assign to current user.
      if (!pet.ownerEmail || pet.ownerEmail === currentUser.email) {
        return { ...pet, ownerId: currentUser.id || 'unassigned', id: pet.id || Date.now().toString() };
      } else {
        // If it belongs to some other email, just give it a stable id for now
        return { ...pet, id: pet.id || Date.now().toString() };
      }
    }
    return pet;
  });

  if (changed) {
    writeDB(DB_KEYS.PETS, updatedPets);
  }

  localStorage.setItem('petwise_migration_v1', 'true');
};

// --- Initialization ---
export const initializeDB = () => {
  const clinics = readDB(DB_KEYS.CLINICS);
  if (!clinics || clinics.length === 0) {
    writeDB(DB_KEYS.CLINICS, DEFAULT_CLINICS);
  }
  
  // Ensure appointments exist
  const appointments = readDB(DB_KEYS.APPOINTMENTS);
  if (!appointments || !Array.isArray(appointments)) {
    writeDB(DB_KEYS.APPOINTMENTS, []);
  }

  migrateLegacyPets();
};

// --- Pets ---
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
  const clinic = getClinicById(clinicId);
  if (!clinic) return [];
  
  const { start, end } = clinic.openingHours;
  const duration = clinic.appointmentDurationMinutes;
  
  // Create all possible slots
  const slots = [];
  let [currentHour, currentMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const endTotalMins = endHour * 60 + endMin;
  
  while (currentHour * 60 + currentMin + duration <= endTotalMins) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    slots.push(timeStr);
    
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
  return slots.filter(slot => !bookedTimes.includes(slot));
};
