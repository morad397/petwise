import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAllGuides, saveEmergencyGuide, deleteEmergencyGuide } from '../../services/emergencyService';

const EMPTY = { title: '', summary: '', warning: '', steps: '', sourceName: '', sourceUrl: '', active: true };

// Admin editor for the first-aid guides shown on the SOS page
export default function GuidesEditor() {
  const [guides, setGuides] = useState([]);
  const [form, setForm] = useState(null); // null = closed
  const [error, setError] = useState('');

  const load = () =>
    getAllGuides()
      .then(setGuides)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const openForm = (guide) => {
    setError('');
    setForm(
      guide
        ? { ...EMPTY, ...guide, warning: guide.warning || '', sourceUrl: guide.sourceUrl || '', steps: guide.instructions.join('\n') }
        : EMPTY
    );
  };

  const run = async (action) => {
    try {
      await action();
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const instructions = form.steps.split('\n').map((s) => s.trim()).filter(Boolean);
    if (instructions.length === 0) {
      setError('Add at least one step (one per line).');
      return;
    }
    const ok = await run(() => saveEmergencyGuide({ ...form, instructions }));
    if (ok) setForm(null);
  };

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  return (
    <section className="section-card" style={{ border: '2px solid #fee2e2' }}>
      <div className="card-header" style={{ borderBottom: '1px solid #fee2e2', paddingBottom: '12px' }}>
        <h3 style={{ color: '#b91c1c' }}>First-Aid Guides (SOS page)</h3>
        {!form && (
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => openForm(null)}>
            <Plus size={16} /> Add Guide
          </button>
        )}
      </div>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      {form && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <div className="input-group">
            <label>Title *</label>
            <input className="input-field" required value={form.title} onChange={set('title')} placeholder="e.g. Bee sting" />
          </div>
          <div className="input-group">
            <label>Short summary</label>
            <input className="input-field" value={form.summary} onChange={set('summary')} placeholder="When to use this guide" />
          </div>
          <div className="input-group">
            <label>Warning (shown in red)</label>
            <input className="input-field" value={form.warning} onChange={set('warning')} />
          </div>
          <div className="input-group">
            <label>Steps * (one per line)</label>
            <textarea className="input-field" required style={{ minHeight: '110px', resize: 'vertical' }} value={form.steps} onChange={set('steps')} />
          </div>
          <div className="input-group">
            <label>Source name</label>
            <input className="input-field" value={form.sourceName} onChange={set('sourceName')} placeholder="e.g. Your clinic's veterinarian" />
          </div>
          <div className="input-group">
            <label>Source link</label>
            <input className="input-field" type="url" value={form.sourceUrl} onChange={set('sourceUrl')} placeholder="https://..." />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Show on the SOS page
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary">Save Guide</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
        {guides.length === 0 && <p style={{ color: '#64748b' }}>No guides yet.</p>}
        {guides.map((guide) => (
          <div key={guide.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', opacity: guide.active ? 1 : 0.55 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{guide.title}</strong>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {guide.instructions.length} steps{guide.active ? '' : ' • hidden'}
              </div>
            </div>
            <button className="icon-btn" title={guide.active ? 'Hide from SOS page' : 'Show on SOS page'}
              onClick={() => run(() => saveEmergencyGuide({ ...guide, active: !guide.active }))}>
              {guide.active ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button className="icon-btn" title="Edit" onClick={() => openForm(guide)}><Edit2 size={16} /></button>
            <button className="icon-btn" title="Delete" style={{ color: '#d93025' }}
              onClick={() => window.confirm(`Delete "${guide.title}"?`) && run(() => deleteEmergencyGuide(guide.id))}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
