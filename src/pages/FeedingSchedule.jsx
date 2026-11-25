import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePet from '../hooks/usePet';
import { feedingApi, todayIso } from '../services/medicalService';
import { createReminder } from '../services/reminderService';

const EMPTY_MEAL = { mealName: '', time: '08:00', food: '', amount: '', notes: '' };

// "07:30" -> "7:30 AM"
const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

function PetFeedingSchedule() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { pet, loading } = usePet(petId);

  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null); // null = closed
  const [busyId, setBusyId] = useState(null);
  const today = todayIso();

  const load = useCallback(
    () =>
      feedingApi
        .list(petId, today)
        .then((list) => {
          setMeals(list);
          setError('');
        })
        .catch((e) => setError(e.message)),
    [petId, today]
  );

  useEffect(() => {
    if (pet) load();
  }, [pet, load]);

  const run = async (id, action) => {
    setBusyId(id);
    try {
      await action();
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const body = {
        mealName: form.mealName.trim(),
        time: form.time,
        food: form.food.trim(),
        amount: form.amount.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (form.id) await feedingApi.update(pet.id, form.id, body);
      else await feedingApi.create(pet.id, body);
      setForm(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  // one-off reminder at the meal's next time (today if still ahead, else tomorrow)
  const remindMe = (meal) =>
    run(meal.id, async () => {
      const [h, m] = meal.time.split(':').map(Number);
      const due = new Date();
      due.setHours(h, m, 0, 0);
      if (due <= new Date()) due.setDate(due.getDate() + 1);
      await createReminder({
        type: 'FEEDING',
        title: `${meal.mealName} for ${pet.name}`,
        message: [meal.food, meal.amount].filter(Boolean).join(' • '),
        dueDate: `${due.toLocaleDateString('en-CA')}T${meal.time}`,
        petId: pet.id,
      });
      alert(`Reminder added for ${due.toLocaleDateString('en-US', { weekday: 'long' })} at ${formatTime(meal.time)}.`);
    });

  if (loading) return <p>Loading...</p>;
  if (!pet) return null;

  const fedCount = meals.filter((m) => m.fed).length;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
        {!form && <button className="btn btn-primary" onClick={() => setForm(EMPTY_MEAL)}>Add Meal</button>}
      </div>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      {form && (
        <section className="section-card">
          <h2>{form.id ? 'Edit meal' : 'New meal'}</h2>
          <form className="form-card" onSubmit={handleSave}>
            <label className="form-group">
              <span>Meal *</span>
              <input value={form.mealName} onChange={(e) => setForm({ ...form, mealName: e.target.value })} required placeholder="e.g. Breakfast" />
            </label>
            <label className="form-group">
              <span>Time *</span>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </label>
            <label className="form-group">
              <span>Food *</span>
              <input value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value })} required placeholder="e.g. Salmon dry food" />
            </label>
            <label className="form-group">
              <span>Amount</span>
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 250 g / 1 cup" />
            </label>
            <label className="form-group">
              <span>Notes</span>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Mix with warm water" />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Feeding Schedule for {pet.name}</h2>
          {meals.length > 0 && (
            <span className={`status-pill ${fedCount === meals.length ? 'status-completed' : 'status-pending'}`}>
              Today: {fedCount} of {meals.length} meals given
            </span>
          )}
        </div>

        {meals.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p>No meals added for {pet.name}. Add the daily meals so everyone in the family can see what was already given.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {meals.map((meal) => (
              <article
                key={meal.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
                  padding: '16px', borderRadius: '14px', background: 'white',
                  border: meal.fed ? '1px solid #bbf7d0' : '1px solid #eef1f6',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: '1.05rem' }}>🍖 {meal.mealName} • {formatTime(meal.time)}</strong>
                  <p style={{ margin: '4px 0 0', color: '#4a5568' }}>
                    {meal.food}{meal.amount ? ` • ${meal.amount}` : ''}
                  </p>
                  {meal.notes && <p style={{ margin: '4px 0 0', color: '#64748b' }}>{meal.notes}</p>}
                  {meal.fed && (
                    <p style={{ margin: '6px 0 0', color: '#15803d', fontWeight: 600 }}>
                      ✓ Given today at {new Date(meal.fedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} by {meal.fedByName}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {meal.fed ? (
                    <button className="btn btn-ghost" disabled={busyId === meal.id} onClick={() => run(meal.id, () => feedingApi.undoFed(pet.id, meal.id, today))}>
                      Undo
                    </button>
                  ) : (
                    <button className="btn btn-primary" disabled={busyId === meal.id} onClick={() => run(meal.id, () => feedingApi.markFed(pet.id, meal.id, today))}>
                      Mark as fed
                    </button>
                  )}
                  <button className="btn btn-ghost" disabled={busyId === meal.id} onClick={() => remindMe(meal)}>Remind me</button>
                  <button className="btn btn-ghost" onClick={() => setForm({ ...EMPTY_MEAL, ...meal, amount: meal.amount || '', notes: meal.notes || '' })}>Edit</button>
                  <button className="btn btn-ghost" style={{ color: '#d43a57' }}
                    onClick={() => window.confirm(`Delete ${meal.mealName}?`) && run(meal.id, () => feedingApi.remove(pet.id, meal.id))}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default PetFeedingSchedule;
