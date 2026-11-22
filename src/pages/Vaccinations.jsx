import { useParams, useNavigate } from 'react-router-dom';
import usePet from '../hooks/usePet';
import useRecords from '../hooks/useRecords';
import RecordSection from '../components/medical/RecordSection';
import { vaccinationsApi, treatmentsApi, formatDate, todayIso } from '../services/medicalService';

function Vaccinations() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { pet, loading } = usePet(petId);
  const vaccinations = useRecords(vaccinationsApi, petId, Boolean(pet));
  const treatments = useRecords(treatmentsApi, petId, Boolean(pet));
  const medications = treatments.records.filter((t) => t.kind === 'MEDICATION');

  if (loading) return <p>Loading...</p>;
  if (!pet) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
      </div>

      {(vaccinations.error || treatments.error) && (
        <p style={{ color: '#d93025', fontWeight: 'bold' }}>{vaccinations.error || treatments.error}</p>
      )}

      <RecordSection
        title={`Vaccinations for ${pet.name}`}
        addLabel="Add Vaccination"
        emptyText={`No vaccination records added for ${pet.name}.`}
        records={vaccinations.records}
        initialValues={{ vaccineName: '', dateAdministered: todayIso(), nextDueDate: '', veterinarian: '', notes: '' }}
        fields={[
          { name: 'vaccineName', label: 'Vaccine', required: true, placeholder: 'e.g. Rabies' },
          { name: 'dateAdministered', label: 'Date given', type: 'date', required: true },
          { name: 'nextDueDate', label: 'Next dose due (creates a reminder)', type: 'date' },
          { name: 'veterinarian', label: 'Veterinarian' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        onCreate={async (values) => {
          await vaccinationsApi.create(pet.id, values);
          await vaccinations.reload();
        }}
        onDelete={async (record) => {
          await vaccinationsApi.remove(pet.id, record.id);
          await vaccinations.reload();
        }}
        renderRecord={(v) => (
          <>
            <strong style={{ fontSize: '1.05rem' }}>💉 {v.vaccineName}</strong>
            <p style={{ margin: '4px 0 0', color: '#4a5568' }}>
              Given {formatDate(v.dateAdministered)}
              {v.veterinarian ? ` by ${v.veterinarian}` : ''}
              {v.nextDueDate && <> • <strong>Next due {formatDate(v.nextDueDate)}</strong></>}
            </p>
            {v.notes && <p style={{ margin: '4px 0 0', color: '#64748b' }}>{v.notes}</p>}
          </>
        )}
      />

      <RecordSection
        title={`Medications for ${pet.name}`}
        addLabel="Add Medication"
        emptyText={`No medications added for ${pet.name}.`}
        records={medications}
        initialValues={{ medication: '', diagnosis: '', treatmentDate: todayIso(), notes: '' }}
        fields={[
          { name: 'medication', label: 'Medication', required: true, placeholder: 'e.g. Amoxicillin 250mg' },
          { name: 'diagnosis', label: 'Reason', required: true, placeholder: 'e.g. Ear infection' },
          { name: 'treatmentDate', label: 'Start date', type: 'date', required: true },
          { name: 'notes', label: 'Dosage & instructions', type: 'textarea', placeholder: 'e.g. twice a day for 7 days' },
        ]}
        onCreate={async (values) => {
          await treatmentsApi.create(pet.id, { ...values, kind: 'MEDICATION' });
          await treatments.reload();
        }}
        onDelete={async (record) => {
          await treatmentsApi.remove(pet.id, record.id);
          await treatments.reload();
        }}
        renderRecord={(m) => (
          <>
            <strong style={{ fontSize: '1.05rem' }}>💊 {m.medication}</strong>
            <p style={{ margin: '4px 0 0', color: '#4a5568' }}>
              For {m.diagnosis} • since {formatDate(m.treatmentDate)}
            </p>
            {m.notes && <p style={{ margin: '4px 0 0', color: '#64748b' }}>{m.notes}</p>}
          </>
        )}
      />
    </>
  );
}

export default Vaccinations;
