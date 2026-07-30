import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { getClinics, createClinic, updateClinic } from '../../services/dataService';

export default function AdminClinics() {
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clinicData, setClinicData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setClinics(getClinics());
  }, []);

  const handleEdit = (clinic) => {
    setClinicData({ ...clinic });
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setClinicData({
      name: '',
      address: '',
      phone: '',
      email: '',
      status: 'ACTIVE',
      openingHours: { start: '09:00', end: '17:00' },
      appointmentDurationMinutes: 30,
      serviceIds: []
    });
    setIsEditModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (clinicData.id) {
      updateClinic(clinicData.id, clinicData);
    } else {
      createClinic(clinicData);
    }
    setClinics(getClinics());
    setIsEditModalOpen(false);
  };

  const handleDeleteRequest = (clinic) => {
    setClinicData(clinic);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Soft delete or status change is better than actual delete to preserve records
    if (clinicData.id) {
      updateClinic(clinicData.id, { status: 'SUSPENDED' });
      setClinics(getClinics());
    }
    setIsDeleteModalOpen(false);
  };

  let displayed = clinics.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Clinic Management</p>
          <h1>Registered Clinics & Staff</h1>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Clinic
        </button>
      </header>

      <section className="section-card">
        <div className="card-header">
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', width: '300px' }}>
            <Search size={18} color="#666" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search clinics..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Clinic Name</th>
                <th>Contact</th>
                <th>Hours</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((clinic) => (
                <tr key={clinic.id}>
                  <td>
                    <strong>{clinic.name}</strong>
                    <br/>
                    <small style={{ color: '#666' }}>{clinic.address}</small>
                  </td>
                  <td>
                    {clinic.email}<br/>
                    {clinic.phone}
                  </td>
                  <td>
                    {clinic.openingHours.start} - {clinic.openingHours.end}
                  </td>
                  <td><StatusBadge status={clinic.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => handleEdit(clinic)} title="Edit Clinic">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteRequest(clinic)} title="Suspend Clinic" style={{ color: '#d93025' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No clinics found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal */}
      {isEditModalOpen && clinicData && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{clinicData.id ? 'Edit Clinic' : 'Add Clinic'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Clinic Name</label>
                <input required type="text" className="input-field" value={clinicData.name} onChange={e => setClinicData({...clinicData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Address</label>
                <input required type="text" className="input-field" value={clinicData.address} onChange={e => setClinicData({...clinicData, address: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input required type="email" className="input-field" value={clinicData.email} onChange={e => setClinicData({...clinicData, email: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Phone</label>
                  <input required type="text" className="input-field" value={clinicData.phone} onChange={e => setClinicData({...clinicData, phone: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Opening Time</label>
                  <input required type="time" className="input-field" value={clinicData.openingHours.start} onChange={e => setClinicData({...clinicData, openingHours: { ...clinicData.openingHours, start: e.target.value }})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Closing Time</label>
                  <input required type="time" className="input-field" value={clinicData.openingHours.end} onChange={e => setClinicData({...clinicData, openingHours: { ...clinicData.openingHours, end: e.target.value }})} />
                </div>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select className="input-field" value={clinicData.status} onChange={e => setClinicData({...clinicData, status: e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Clinic</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        title="Suspend Clinic"
        message="Are you sure you want to suspend this clinic? Staff will no longer be able to manage appointments."
        confirmText="Suspend Clinic"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
