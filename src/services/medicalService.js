// medicalService.js
// A pet's medical records: vaccinations, treatments (vet visits + medications) and weight entries.

import { apiRequest } from './api';

const base = (petId, kind) => `/pets/${encodeURIComponent(petId)}/${kind}`;

function recordApi(kind) {
  return {
    list: (petId) => apiRequest(base(petId, kind)),
    create: (petId, data) => apiRequest(base(petId, kind), { method: 'POST', body: data }),
    update: (petId, id, data) => apiRequest(`${base(petId, kind)}/${id}`, { method: 'PUT', body: data }),
    remove: (petId, id) => apiRequest(`${base(petId, kind)}/${id}`, { method: 'DELETE' }),
  };
}

export const vaccinationsApi = recordApi('vaccinations');
export const treatmentsApi = recordApi('treatments');
export const weightsApi = recordApi('weights');

// "2026-03-01" -> "Mar 1, 2026"
export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Today's local date as "YYYY-MM-DD"
export const todayIso = () => new Date().toLocaleDateString('en-CA');
