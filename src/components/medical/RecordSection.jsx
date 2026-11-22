import { useState } from 'react';

// A card with a list of records and an "Add" form (used for vaccinations, medications,
// vet visits and weight entries).
//
// fields: [{ name, label, type: 'text' | 'date' | 'number' | 'textarea', required, step, placeholder }]
// onCreate(values): async, values are the raw form strings (empty ones become null)
export default function RecordSection({
  title,
  addLabel,
  emptyText,
  fields,
  initialValues,
  records,
  renderRecord,
  onCreate,
  onDelete,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openForm = () => {
    setValues(initialValues);
    setError('');
    setIsAdding(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const cleaned = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, typeof value === 'string' && value.trim() === '' ? null : value])
      );
      await onCreate(cleaned);
      setIsAdding(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await onDelete(record);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <section className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {!isAdding && (
          <button className="btn btn-primary" onClick={openForm}>{addLabel}</button>
        )}
      </div>

      {isAdding && (
        <form className="form-card" onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          {error && <p style={{ color: '#ff5a79', fontWeight: 'bold', margin: 0 }}>{error}</p>}
          {fields.map((field) => (
            <label key={field.name} className="form-group">
              <span>{field.label}{field.required ? ' *' : ''}</span>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={values[field.name] ?? ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{ minHeight: '70px', resize: 'vertical' }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={values[field.name] ?? ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  step={field.step}
                  min={field.type === 'number' ? '0' : undefined}
                />
              )}
            </label>
          ))}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      {records.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <p>{emptyText}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {records.map((record) => (
            <article
              key={record.id}
              style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '16px', border: '1px solid #eef1f6', borderRadius: '14px', background: 'white' }}
            >
              <div style={{ minWidth: 0 }}>{renderRecord(record)}</div>
              {onDelete && (
                <button className="btn btn-ghost" style={{ color: '#d43a57', alignSelf: 'flex-start' }} onClick={() => handleDelete(record)}>
                  Delete
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
