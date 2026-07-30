// emergencyService.js
// Handles localStorage mock database operations for Emergency Settings

const DB_KEYS = {
  SETTINGS: 'petwise-emergency-settings',
  GUIDES: 'petwise-emergency-guides'
};

const readDB = (key, defaultVal) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const writeDB = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Settings ---
export const getEmergencySettings = () => {
  return readDB(DB_KEYS.SETTINGS, {
    emergencyPhone: '',
    emergencyContactName: '',
    availabilityText: '',
    emergencyDisclaimer: 'PetWise does not provide a veterinary diagnosis. If you are unsure or your pet’s condition is worsening, contact a licensed veterinarian immediately.'
  });
};

export const updateEmergencySettings = (settings) => {
  writeDB(DB_KEYS.SETTINGS, settings);
  return settings;
};

// --- Guides ---
export const getEmergencyGuides = () => {
  return readDB(DB_KEYS.GUIDES, []);
};

export const getActiveGuides = () => {
  return getEmergencyGuides().filter(g => g.active);
};

export const saveEmergencyGuide = (guideData) => {
  const guides = getEmergencyGuides();
  const index = guides.findIndex(g => g.id === guideData.id);
  
  if (index >= 0) {
    guides[index] = { ...guides[index], ...guideData };
  } else {
    guides.push({
      ...guideData,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    });
  }
  
  writeDB(DB_KEYS.GUIDES, guides);
};

export const deleteEmergencyGuide = (guideId) => {
  const guides = getEmergencyGuides();
  writeDB(DB_KEYS.GUIDES, guides.filter(g => g.id !== guideId));
};
