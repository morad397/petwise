import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2, Ban, CheckCircle, Plus } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { getClinics } from '../../services/dataService';

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Pet Owner', date: 'Oct 12, 2026', status: 'Active' },
  { id: '2', name: 'Sarah Smith', email: 'sarah.s@domain.com', role: 'Staff', date: 'Nov 01, 2026', status: 'Active' },
  { id: '3', name: 'Emily Clark', email: 'emily.c@pets.org', role: 'Pet Owner', date: 'Oct 24, 2026', status: 'Suspended' },
  { id: '4', name: 'James Park', email: 'jpark@vetclinic.com', role: 'Admin', date: 'Jan 15, 2026', status: 'Active' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Pet Owner',
    clinicId: '',
    department: ''
  });

  // Role Change Modal State
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    user: null,
    role: 'Pet Owner',
    clinicId: '',
    department: ''
  });

  useEffect(() => {
    // Load clinics
    setClinics(getClinics());

    // Load users from localStorage (combining actual user + mock data)
    const loggedInUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    if (loggedInUser.email) setCurrentUserEmail(loggedInUser.email);

    const savedUsersStr = localStorage.getItem('petwise-users');
    const savedUsers = JSON.parse(savedUsersStr || '[]');
    
    // If no users and never initialized, start with empty array for fresh start
    if (!savedUsersStr) {
      localStorage.setItem('petwise-users', JSON.stringify([]));
      setUsers([]);
    } else {
      setUsers(savedUsers);
    }
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!addForm.fullName || !addForm.email || !addForm.password) {
      alert("Please fill all required fields.");
      return;
    }
    
    const internalRole = addForm.role === 'Staff' ? 'CLINIC_STAFF' : (addForm.role === 'Admin' ? 'ADMIN' : 'PET_OWNER');
    
    if (internalRole === 'CLINIC_STAFF' && !addForm.clinicId) {
      alert("Clinic Staff must be assigned to a clinic.");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: addForm.fullName,
      fullName: addForm.fullName, // Also save fullName for compatibility
      email: addForm.email.toLowerCase(),
      role: internalRole,
      status: 'Active',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    if (internalRole === 'CLINIC_STAFF') {
      newUser.clinicId = addForm.clinicId;
      newUser.department = addForm.department;
    }

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setIsAddModalOpen(false);
    setAddForm({ fullName: '', email: '', password: '', role: 'Pet Owner', clinicId: '', department: '' });
  };

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('petwise-users', JSON.stringify(updatedUsers));
  };

  const openRoleChangeModal = (user) => {
    const displayRole = user.role === 'CLINIC_STAFF' ? 'Staff' : (user.role === 'ADMIN' ? 'Admin' : 'Pet Owner');
    setRoleChangeModal({
      isOpen: true,
      user,
      role: displayRole,
      clinicId: user.clinicId || '',
      department: user.department || ''
    });
  };

  const submitRoleChange = (e) => {
    e.preventDefault();
    const internalRole = roleChangeModal.role === 'Staff' ? 'CLINIC_STAFF' : (roleChangeModal.role === 'Admin' ? 'ADMIN' : 'PET_OWNER');
    
    if (internalRole === 'CLINIC_STAFF' && !roleChangeModal.clinicId) {
      alert("Clinic Staff must be assigned to a clinic.");
      return;
    }
    
    const updatedUser = { 
      ...roleChangeModal.user, 
      role: internalRole,
    };

    if (internalRole === 'CLINIC_STAFF') {
      updatedUser.clinicId = roleChangeModal.clinicId;
      updatedUser.department = roleChangeModal.department;
    } else {
      delete updatedUser.clinicId;
      delete updatedUser.department;
    }

    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(updated);
    setRoleChangeModal({ isOpen: false, user: null, role: 'Pet Owner', clinicId: '', department: '' });
  };

  const handleStatusToggle = (user) => {
    if (user.email === currentUserEmail) return; // Prevent self-suspend
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const updated = users.map(u => u.id === user.id ? { ...u, status: newStatus } : u);
    saveUsers(updated);
  };

  const handleDeleteRequest = (user) => {
    if (user.email === currentUserEmail) return; // Prevent self-delete
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const updated = users.filter(u => u.id !== userToDelete.id);
      saveUsers(updated);
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Filtering and Sorting
  let displayedUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  displayedUsers.sort((a, b) => {
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOrder === 'date-new') return new Date(b.date) - new Date(a.date);
    if (sortOrder === 'date-old') return new Date(a.date) - new Date(b.date);
    return 0;
  });

  const stats = {
    total: users.length,
    owners: users.filter(u => u.role === 'Pet Owner').length,
    staff: users.filter(u => u.role === 'Staff').length,
    admins: users.filter(u => u.role === 'Admin').length,
    active: users.filter(u => u.status === 'Active').length,
  };

  return (
    <>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="eyebrow">User Management</p>
          <h1>View and manage all PetWise users.</h1>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          Add User
        </button>
      </header>

      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card"><h3>{stats.total}</h3><p>Total Users</p></div>
        <div className="stat-card"><h3>{stats.owners}</h3><p>Pet Owners</p></div>
        <div className="stat-card"><h3>{stats.staff}</h3><p>Staff Members</p></div>
        <div className="stat-card"><h3>{stats.admins}</h3><p>Administrators</p></div>
        <div className="stat-card"><h3>{stats.active}</h3><p>Active Users</p></div>
      </section>

      <section className="section-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', flex: 1, minWidth: '250px' }}>
            <Search size={18} color="#666" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Filter size={18} color="#666" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Roles</option>
              <option value="Pet Owner">Pet Owners</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={selectStyle}>
              <option value="name-asc">Sort: A-Z</option>
              <option value="name-desc">Sort: Z-A</option>
              <option value="date-new">Newest First</option>
              <option value="date-old">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User / Profile</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length > 0 ? displayedUsers.map((user) => {
                const isSelf = user.email === currentUserEmail;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="table-user">
                        <strong>{user.name}</strong>
                        <span>{user.email} {isSelf && <strong style={{color: '#ff5a79'}}>(You)</strong>}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{user.role === 'CLINIC_STAFF' ? 'Staff' : (user.role === 'ADMIN' ? 'Admin' : 'Pet Owner')}</span>
                        {!isSelf && (
                          <button 
                            className="icon-btn" 
                            title="Edit Role" 
                            onClick={() => openRoleChangeModal(user)}
                            style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>{user.date}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="icon-btn" 
                          title={user.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
                          onClick={() => handleStatusToggle(user)}
                          disabled={isSelf}
                          style={{ opacity: isSelf ? 0.5 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                        >
                          {user.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Delete User"
                          onClick={() => handleDeleteRequest(user)}
                          disabled={isSelf}
                          style={{ color: isSelf ? 'inherit' : '#d93025', opacity: isSelf ? 0.5 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ color: '#666' }}>No users match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', color: '#0f2138' }}>Add New User</h2>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Full Name
                <input 
                  type="text" 
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({...addForm, fullName: e.target.value})}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Email
                <input 
                  type="email" 
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Temporary Password
                <input 
                  type="password" 
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Role
                <select 
                  value={addForm.role}
                  onChange={(e) => setAddForm({...addForm, role: e.target.value})}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                >
                  <option value="Pet Owner">Pet Owner</option>
                  <option value="Staff">Clinic Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>

              {addForm.role === 'Staff' && (
                <>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    Assign to Clinic
                    <select 
                      value={addForm.clinicId}
                      onChange={(e) => setAddForm({...addForm, clinicId: e.target.value})}
                      style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                      required
                    >
                      <option value="">Select a Clinic</option>
                      {clinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    Department
                    <input 
                      type="text" 
                      value={addForm.department}
                      onChange={(e) => setAddForm({...addForm, department: e.target.value})}
                      placeholder="e.g. Surgery, Reception"
                      style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </label>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', color: '#0f2138' }}>Change User Role</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Editing role for: <strong>{roleChangeModal.user?.name}</strong>
            </p>
            <form onSubmit={submitRoleChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                Role
                <select 
                  value={roleChangeModal.role}
                  onChange={(e) => setRoleChangeModal({...roleChangeModal, role: e.target.value})}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                >
                  <option value="Pet Owner">Pet Owner</option>
                  <option value="Staff">Clinic Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>

              {roleChangeModal.role === 'Staff' && (
                <>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    Assign to Clinic
                    <select 
                      value={roleChangeModal.clinicId}
                      onChange={(e) => setRoleChangeModal({...roleChangeModal, clinicId: e.target.value})}
                      style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                      required
                    >
                      <option value="">Select a Clinic</option>
                      {clinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    Department
                    <input 
                      type="text" 
                      value={roleChangeModal.department}
                      onChange={(e) => setRoleChangeModal({...roleChangeModal, department: e.target.value})}
                      placeholder="e.g. Surgery, Reception"
                      style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </label>
                </>
              )}

              {roleChangeModal.role === 'Staff' && roleChangeModal.user?.role !== 'CLINIC_STAFF' && (
                <div style={{ background: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <strong>Note:</strong> Changing a Pet Owner to Staff will require them to log in again.
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setRoleChangeModal({ isOpen: false, user: null, role: 'Pet Owner', clinicId: '', department: '' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer'
};
