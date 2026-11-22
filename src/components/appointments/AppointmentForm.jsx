import { useState, useEffect } from 'react';
import { getMyPets, getClinics, getAvailableSlots } from '../../services/dataService';
import { Stethoscope } from 'lucide-react';

const EMPTY_FORM = {
  petId: '',
  clinicId: '',
  serviceId: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: ''
};

// initialData: an appointment from the API when managing an existing one
// onSave(payload): async; may throw an error whose message is shown in the form
export default function AppointmentForm({ initialData, onSave, onCancel }) {
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotStatus, setSlotStatus] = useState("CLINIC_NOT_SELECTED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(() =>
    initialData
      ? {
          petId: String(initialData.petId),
          clinicId: String(initialData.clinicId),
          serviceId: initialData.service || '',
          appointmentDate: initialData.appointmentDate || '',
          appointmentTime: initialData.appointmentTime || '',
          notes: initialData.notes || ''
        }
      : EMPTY_FORM
  );

  // Load the user's pets and the active clinics
  useEffect(() => {
    getMyPets()
      .then(setPets)
      .catch((e) => setError(e.message));
    getClinics()
      .then((list) => setClinics(list.filter(c => c.status === 'ACTIVE')))
      .catch((e) => setError(e.message));
  }, []);

  const selectedClinic = clinics.find(c => String(c.id) === String(form.clinicId));
  const availableServices = selectedClinic ? selectedClinic.services || [] : [];

  // Ask the server which times are free whenever the clinic or date changes
  useEffect(() => {
    if (!form.clinicId || !form.appointmentDate) return;
    let cancelled = false;
    getAvailableSlots(form.clinicId, form.appointmentDate, initialData?.id)
      .then((result) => {
        if (cancelled) return;
        setSlotStatus(result.status);
        setAvailableSlots(result.slots);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [form.clinicId, form.appointmentDate, initialData?.id]);

  const shownSlotStatus = !form.clinicId
    ? "CLINIC_NOT_SELECTED"
    : !form.appointmentDate
      ? "DATE_NOT_SELECTED"
      : slotStatus;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      // a new date means the old time may no longer be free
      ...(name === 'appointmentDate' ? { appointmentTime: '' } : {})
    }));
  };

  const isFormValid = form.petId && form.clinicId && form.serviceId && form.appointmentDate && form.appointmentTime;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onSave({
        petId: Number(form.petId),
        clinicId: Number(form.clinicId),
        service: form.serviceId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        notes: form.notes.trim() || null
      });
    } catch (err) {
      // e.g. "This time is not available" if someone booked it a moment ago
      setError(err.message);
      if (form.clinicId && form.appointmentDate) {
        getAvailableSlots(form.clinicId, form.appointmentDate, initialData?.id)
          .then((result) => {
            setSlotStatus(result.status);
            setAvailableSlots(result.slots);
          })
          .catch(() => {});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>{initialData ? 'Manage Appointment' : 'Book New Appointment'}</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && <p style={{ color: '#d93025', padding: '12px', background: '#fce8e6', borderRadius: '8px', margin: 0 }}>{error}</p>}
        
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
            min={new Date().toLocaleDateString('en-CA')} // today in the user's time zone
            className="input-field"
          />
        </div>

        <div className="form-group">
          <span>Time *</span>
          {shownSlotStatus === "CLINIC_NOT_SELECTED" && (
            <p style={{ color: '#64748b' }}>Select a clinic first to view available times.</p>
          )}
          {shownSlotStatus === "DATE_NOT_SELECTED" && (
            <p style={{ color: '#64748b' }}>Select a date to view available times.</p>
          )}
          {shownSlotStatus === "CLINIC_CLOSED" && (
            <p style={{ color: '#d93025', padding: '12px', background: '#fce8e6', borderRadius: '8px' }}>
              This clinic is closed on the selected date.
            </p>
          )}
          {shownSlotStatus === "FULLY_BOOKED" && (
            <p style={{ color: '#d93025', padding: '12px', background: '#fce8e6', borderRadius: '8px' }}>
              No available slots for this date.
            </p>
          )}
          {shownSlotStatus === "AVAILABLE" && (
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
