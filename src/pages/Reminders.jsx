import { useEffect, useState } from 'react';
import { getMyPets } from '../services/dataService';
import {
  getReminders,
  createReminder,
  completeReminder,
  snoozeReminder,
  deleteReminder,
  formatDueDate,
  isOverdue,
} from '../services/reminderService';

const TYPES = [
  { value: 'FEEDING', label: 'Feeding', icon: '🍖' },
  { value: 'MEDICATION', label: 'Medication', icon: '💊' },
  { value: 'VACCINATION', label: 'Vaccination', icon: '💉' },
  { value: 'VET_VISIT', label: 'Vet visit', icon: '🩺' },
  { value: 'WALK', label: 'Walk', icon: '🐕' },
  { value: 'APPOINTMENT', label: 'Appointment', icon: '📅' },
  { value: 'OTHER', label: 'Other', icon: '🔔' },
];
const typeInfo = (value) => TYPES.find((t) => t.value === value) || TYPES[TYPES.length - 1];

// default due time: one hour from now, as "YYYY-MM-DDTHH:MM" for <input type="datetime-local">
const inOneHour = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return `${d.toLocaleDateString('en-CA')}T${d.toTimeString().slice(0, 5)}`;
};

const emptyForm = () => ({ type: 'FEEDING', title: '', message: '', dueDate: inOneHour(), petId: '' });

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = () =>
    getReminders()
      .then((list) => {
        setReminders(list);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
    getMyPets().then(setPets).catch(() => setPets([]));
  }, []);

  // run an action, then reload the list
  const act = async (action) => {
    try {
      await action();
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await createReminder({
        type: form.type,
        title: form.title.trim(),
        message: form.message.trim() || null,
        dueDate: form.dueDate,
        petId: form.petId ? Number(form.petId) : null,
      });
      setIsAdding(false);
      setForm(emptyForm());
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const open = reminders.filter((r) => !r.isCompleted);
  const done = reminders.filter((r) => r.isCompleted);
  const shown = showDone ? done : open;

  return (
    <>
      <section className="section-card hero-panel dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">Reminders</p>
          <h1>Care schedule</h1>
          <p>Never miss a feeding, health check, walk, or medication. Vaccine due dates and confirmed appointments are added automatically.</p>
        </div>
        {!isAdding && (
          <button className="btn btn-primary btn-large" onClick={() => setIsAdding(true)}>+ Add Reminder</button>
        )}
      </section>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      {isAdding && (
        <section className="section-card">
          <h2>New reminder</h2>
          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Type</span>
              <select name="type" value={form.type} onChange={handleChange}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </label>
            <label className="form-group">
              <span>Title *</span>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Dinner time" />
            </label>
            <label className="form-group">
              <span>When *</span>
              <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} required />
            </label>
            <label className="form-group">
              <span>Pet</span>
              <select name="petId" value={form.petId} onChange={handleChange}>
                <option value="">— All / none —</option>
                {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="form-group">
              <span>Details</span>
              <input name="message" value={form.message} onChange={handleChange} placeholder="Optional" />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <div style={{ display: 'flex', gap: '8px', margin: '8px 0 16px' }}>
        <button className={`btn ${showDone ? 'btn-ghost' : 'btn-secondary'}`} onClick={() => setShowDone(false)}>
          To do ({open.length})
        </button>
        <button className={`btn ${showDone ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setShowDone(true)}>
          Done ({done.length})
        </button>
      </div>

      <section className="appointment-grid">
        {isLoading && <p>Loading reminders…</p>}
        {!isLoading && shown.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', gridColumn: '1 / -1' }}>
            <p style={{ color: '#666' }}>{showDone ? 'No completed reminders yet.' : 'Nothing to do. Add a reminder to get started.'}</p>
          </div>
        )}
        {shown.map((item) => {
          const info = typeInfo(item.type);
          const overdue = isOverdue(item);
          return (
            <article key={item.id} className="mini-card appointment-card" style={overdue ? { border: '2px solid #ff5a79' } : undefined}>
              <span className="eyebrow" style={overdue ? { color: '#d43a57' } : undefined}>
                {overdue ? 'Overdue • ' : ''}{formatDueDate(item.dueDate)}
              </span>
              <h3>{info.icon} {item.title}</h3>
              <p>
                {item.petName && <><strong>{item.petName}</strong>{item.message ? ' — ' : ''}</>}
                {item.message}
                {item.source && <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Added automatically</span>}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!item.isCompleted && (
                  <>
                    <button className="btn btn-secondary" onClick={() => act(() => completeReminder(item.id))}>Mark done</button>
                    <button className="btn btn-ghost" onClick={() => act(() => snoozeReminder(item.id, 60))}>Snooze 1h</button>
                  </>
                )}
                <button className="btn btn-ghost" style={{ color: '#d43a57' }} onClick={() => window.confirm('Delete this reminder?') && act(() => deleteReminder(item.id))}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default Reminders;
