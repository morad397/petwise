import { useState, useEffect } from 'react';
import { getMyPets, getClinics, getAvailableSlots } from '../../services/dataService';
import { Stethoscope } from 'lucide-react';

export default function AppointmentForm({ 
  initialData, 
  onSave, 
  onCancel, 
  currentUser
}) {
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotStatus, setSlotStatus] = useState("CLINIC_NOT_SELECTED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    petId: '',
    clinicId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });

  // Load basic data
  useEffect(() => {
    if (currentUser.id) {
      getMyPets()
        .then(setPets)
        .catch((error) => console.error('Failed to load pets', error));
      getClinics()
        .then((list) => setClinics(list.filter(c => c.status === 'ACTIVE')))
        .catch((error) => console.error('Failed to load clinics', error));
    }

    if (initialData) {
      setForm({
        petId: initialData.petId || '',
        clinicId: initialData.clinicId || '',
        serviceId: initialData.serviceId || initialData.title || '',
        appointmentDate: initialData.appointmentDate || '',
        appointmentTime: initialData.appointmentTime || '',
        notes: initialData.notes || initialData.detail || ''
      });
    }
  }, [currentUser, initialData]);

  // Handle clinic selection changes
  useEffect(() => {
    if (form.clinicId) {
      const clinic = clinics.find(c => String(c.id) === String(form.clinicId));
      if (clinic) {
        setAvailableServices(clinic.services || []);
      } else {
        setAvailableServices([]);
      }
    }
  }, [form.clinicId, clinics]);

  // Handle date selection changes for slot availability
  useEffect(() => {
    if (form.clinicId && form.appointmentDate) {
      const clinic = clinics.find(c => String(c.id) === String(form.clinicId));
      const result = getAvailableSlots(clinic, form.appointmentDate);
      setSlotStatus(result.status);
      setAvailableSlots(result.slots);
    } else if (!form.clinicId) {
      setSlotStatus("CLINIC_NOT_SELECTED");
      setAvailableSlots([]);
    } else if (!form.appointmentDate) {
      setSlotStatus("DATE_NOT_SELECTED");
      setAvailableSlots([]);
    }
  }, [form.clinicId, form.appointmentDate, clinics]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = form.petId && form.clinicId && form.serviceId && form.appointmentDate && form.appointmentTime;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Validate past dates
    const selectedDate = new Date(`${form.appointmentDate}T${form.appointmentTime}`);
    if (selectedDate < new Date()) {
      alert("Cannot schedule appointments in the past.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate slight network delay
    setTimeout(() => {
      const selectedPet = pets.find(p => String(p.id) === String(form.petId));

      onSave({
        ...form,
        title: form.serviceId, // map back to UI format
        petName: selectedPet ? selectedPet.name : '',
        // Saved with the appointment so clinic staff can see the patient
        // (until the appointments API exists in module 2).
        petSpecies: selectedPet ? selectedPet.species : '',
        ownerName: currentUser.fullName || currentUser.email,
        detail: form.notes,
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="section-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>{initialData ? 'Manage Appointment' : 'Book New Appointment'}</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="form-group">
          <span>Select Pet *</span>
          <select required name="petId" value={form.petId} onChange={handleChange} className="input-field">
            <option value="">-- Choose a pet --</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <span>Select Clinic *</span>
          <select 
            required 
            name="clinicId" 
            value={form.clinicId} 
            onChange={(e) => {
              handleChange(e);
              setForm(prev => ({ ...prev, serviceId: '', appointmentTime: '' }));
            }} 
            className="input-field"
          >
            <option value="">-- Choose a clinic --</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} — {clinic.city}
              </option>
            ))}
          </select>
        </div>

        {form.clinicId && (
          <div className="form-group">
            <span>Select Service *</span>
            <div className="dash-quick-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
              {availableServices.map(service => (
                <div 
                  key={service}
                  className={`dash-quick-btn ${form.serviceId === service ? 'dash-quick-pink' : ''}`}
                  style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'flex-start', 
                    padding: '16px', 
                    border: form.serviceId === service ? '2px solid #ff5a79' : '2px solid #eef1f6', 
                    background: 'white',
                    cursor: 'pointer',
                    borderRadius: '12px'
                  }}
                  onClick={() => setForm({...form, serviceId: service})}
                >
                  <Stethoscope color={form.serviceId === service ? '#ff5a79' : '#8493a8'} />
                  <span style={{ fontSize: '1.1rem', marginLeft: '12px', color: '#0d1b2a' }}>{service}</span>
                </div>
              ))}
            </div>
            {availableServices.length === 0 && <p style={{ color: '#d93025' }}>This clinic offers no services.</p>}
          </div>
        )}

        <div className="form-group">
          <span>Date *</span>
          <input 
            required 
            type="date" 
            name="appointmentDate"
            value={form.appointmentDate} 
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates in picker
            className="input-field"
          />
        </div>

        <div className="form-group">
          <span>Time *</span>
          {slotStatus === "CLINIC_NOT_SELECTED" && (
            <p style={{ color: '#64748b' }}>Select a clinic first to view available times.</p>
          )}
          {slotStatus === "DATE_NOT_SELECTED" && (
            <p style={{ color: '#64748b' }}>Select a date to view available times.</p>
          )}
          {slotStatus === "CLINIC_CLOSED" && (
            <p style={{ color: '#d93025', padding: '12px', background: '#fce8e6', borderRadius: '8px' }}>
              This clinic is closed on the selected date.
            </p>
          )}
          {slotStatus === "FULLY_BOOKED" && (
            <p style={{ color: '#d93025', padding: '12px', background: '#fce8e6', borderRadius: '8px' }}>
              No available slots for this date.
            </p>
          )}
          {slotStatus === "AVAILABLE" && (
            <select required name="appointmentTime" value={form.appointmentTime} onChange={handleChange} className="input-field">
              <option value="">-- Choose a time --</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <span>Additional Notes</span>
          <textarea 
            name="notes"
            value={form.notes} 
            onChange={handleChange}
            placeholder="Any special requirements or concerns?"
            className="input-field"
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel} disabled={isSubmitting}>
            {initialData ? 'Discard Changes' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}
