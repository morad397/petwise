import { useParams, useNavigate } from 'react-router-dom';
import usePet from '../hooks/usePet';
import useRecords from '../hooks/useRecords';
import RecordSection from '../components/medical/RecordSection';
import { weightsApi, formatDate, todayIso } from '../services/medicalService';

function WeightHabits() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { pet, loading } = usePet(petId);
  const weights = useRecords(weightsApi, petId, Boolean(pet));

  if (loading) return <p>Loading...</p>;
  if (!pet) return null;

  // newest first; compare each entry with the one before it
  const changeFrom = (index) => {
    const older = weights.records[index + 1];
    if (!older) return null;
    const diff = Math.round((weights.records[index].weightKg - older.weightKg) * 10) / 10;
    if (diff === 0) return '±0 kg';
    return `${diff > 0 ? '+' : ''}${diff} kg`;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
      </div>

      {weights.error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{weights.error}</p>}

      <RecordSection
        title={`Weight Tracker for ${pet.name}`}
        addLabel="Add Weight Entry"
        emptyText={`No weight entries added for ${pet.name}.`}
        records={weights.records}
        initialValues={{ weightKg: '', recordedDate: todayIso(), notes: '' }}
        fields={[
          { name: 'weightKg', label: 'Weight (kg)', type: 'number', step: '0.1', required: true },
          { name: 'recordedDate', label: 'Date', type: 'date', required: true },
          { name: 'notes', label: 'Notes' },
        ]}
        onCreate={async (values) => {
          await weightsApi.create(pet.id, { ...values, weightKg: Number(values.weightKg) });
          await weights.reload();
        }}
        onDelete={async (record) => {
          await weightsApi.remove(pet.id, record.id);
          await weights.reload();
        }}
        renderRecord={(w) => {
          const change = changeFrom(weights.records.indexOf(w));
          return (
            <>
              <strong style={{ fontSize: '1.05rem' }}>⚖️ {w.weightKg} kg</strong>
              {change && <span style={{ marginLeft: '8px', color: '#64748b' }}>({change})</span>}
              <p style={{ margin: '4px 0 0', color: '#4a5568' }}>{formatDate(w.recordedDate)}</p>
              {w.notes && <p style={{ margin: '4px 0 0', color: '#64748b' }}>{w.notes}</p>}
            </>
          );
        }}
      />

      <section className="section-card">
        <h2>Habits &amp; Activity for {pet.name}</h2>
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>No habits added for {pet.name}.</p>
        </div>
      </section>
    </>
  );
}

export default WeightHabits;
