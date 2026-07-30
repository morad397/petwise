import { useState, useEffect } from 'react';
import { getPetsByOwnerId, getClinics, getClinicById, getAvailableSlots } from '../../services/dataService';
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
      setPets(getPetsByOwnerId(currentUser.id));
      setClinics(getClinics().filter(c => c.status === 'ACTIVE'));
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
      const clinic = getClinicById(form.clinicId);
      if (clinic) {
        setAvailableServices(clinic.serviceIds || []);
      } else {
        setAvailableServices([]);
      }
    }
  }, [form.clinicId]);

  // Handle date selection changes for slot availability
  useEffect(() => {
    if (form.clinicId && form.appointmentDate) {
      setAvailableSlots(getAvailableSlots(form.clinicId, form.appointmentDate));
    } else {
      setAvailableSlots([]);
    }
  }, [form.clinicId, form.appointmentDate]);

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
      const selectedPet = pets.find(p => p.id === form.petId);
      const selectedClinic = clinics.find(c => c.id === form.clinicId);

      onSave({
        ...form,
        title: form.serviceId, // map back to UI format
        petName: selectedPet ? selectedPet.name : '',
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
          <select required name="clinicId" value={form.clinicId} onChange={handleChange} className="input-field">
            <option value="">-- Choose a clinic --</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
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

        {form.appointmentDate && (
          <div className="form-group">
            <span>Time *</span>
            {availableSlots.length > 0 ? (
              <select required name="appointmentTime" value={form.appointmentTime} onChange={handleChange} className="input-field">
                <option value="">-- Choose a time --</option>
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            ) : (
              <p style={{ color: '#d93025', padding: '12px', background: '#fce8e6', borderRadius: '8px' }}>
                No available slots for this date.
              </p>
            )}
          </div>
        )}

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
