import { useParams, useNavigate } from 'react-router-dom';
import usePet from '../hooks/usePet';
import useRecords from '../hooks/useRecords';
import RecordSection from '../components/medical/RecordSection';
import { treatmentsApi, formatDate, todayIso } from '../services/medicalService';

function VetVisits() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { pet, loading } = usePet(petId);
  const treatments = useRecords(treatmentsApi, petId, Boolean(pet));
  const visits = treatments.records.filter((t) => t.kind === 'VET_VISIT');

  if (loading) return <p>Loading...</p>;
  if (!pet) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
        <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>Book Appointment</button>
      </div>

      {treatments.error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{treatments.error}</p>}

      <RecordSection
        title={`Vet Visits for ${pet.name}`}
        addLabel="Add Visit Record"
        emptyText={`No vet visits recorded for ${pet.name}. Completed appointments appear here automatically.`}
        records={visits}
        initialValues={{ diagnosis: '', treatmentDate: todayIso(), clinicName: '', veterinarian: '', medication: '', notes: '' }}
        fields={[
          { name: 'diagnosis', label: 'Reason / diagnosis', required: true, placeholder: 'e.g. Annual checkup' },
          { name: 'treatmentDate', label: 'Visit date', type: 'date', required: true },
          { name: 'clinicName', label: 'Clinic' },
          { name: 'veterinarian', label: 'Veterinarian' },
          { name: 'medication', label: 'Medication given' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onCreate={async (values) => {
          await treatmentsApi.create(pet.id, { ...values, kind: 'VET_VISIT' });
          await treatments.reload();
        }}
        onDelete={async (record) => {
          await treatmentsApi.remove(pet.id, record.id);
          await treatments.reload();
        }}
        renderRecord={(v) => (
          <>
            <strong style={{ fontSize: '1.05rem' }}>🩺 {v.diagnosis}</strong>
            <p style={{ margin: '4px 0 0', color: '#4a5568' }}>
              {formatDate(v.treatmentDate)}
              {v.clinicName ? ` • ${v.clinicName}` : ''}
              {v.veterinarian ? ` • ${v.veterinarian}` : ''}
              {v.appointmentId ? ' • from appointment' : ''}
            </p>
            {v.medication && <p style={{ margin: '4px 0 0', color: '#4a5568' }}>Medication: {v.medication}</p>}
            {v.notes && <p style={{ margin: '4px 0 0', color: '#64748b' }}>{v.notes}</p>}
          </>
        )}
      />
    </>
  );
}

export default VetVisits;
