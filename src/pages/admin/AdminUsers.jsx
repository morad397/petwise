import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2, Ban, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmationModal from '../../components/admin/ConfirmationModal';

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Pet Owner', date: 'Oct 12, 2026', status: 'Active' },
  { id: '2', name: 'Sarah Smith', email: 'sarah.s@domain.com', role: 'Staff', date: 'Nov 01, 2026', status: 'Active' },
  { id: '3', name: 'Emily Clark', email: 'emily.c@pets.org', role: 'Pet Owner', date: 'Oct 24, 2026', status: 'Suspended' },
  { id: '4', name: 'James Park', email: 'jpark@vetclinic.com', role: 'Admin', date: 'Jan 15, 2026', status: 'Active' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    // Load users from localStorage (combining actual user + mock data)
    const loggedInUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    if (loggedInUser.email) setCurrentUserEmail(loggedInUser.email);

    const savedUsers = JSON.parse(localStorage.getItem('petwise-users') || '[]');
    
    // If no users, initialize with mock + current user
    if (savedUsers.length === 0) {
      const initialUsers = [...MOCK_USERS];
      if (loggedInUser.email && !initialUsers.find(u => u.email === loggedInUser.email)) {
        initialUsers.push({
          id: Date.now().toString(),
          name: loggedInUser.fullName || 'Admin User',
          email: loggedInUser.email,
          role: loggedInUser.role === 'admin' ? 'Admin' : 'Pet Owner',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: 'Active'
        });
      }
      localStorage.setItem('petwise-users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
    } else {
      setUsers(savedUsers);
    }
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('petwise-users', JSON.stringify(updatedUsers));
  };

  const handleRoleChange = (id, newRole) => {
    const updated = users.map(u => u.id === id ? { ...u, role: newRole } : u);
    saveUsers(updated);
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
      <header className="admin-header">
        <div>
          <p className="eyebrow">User Management</p>
          <h1>View and manage all PetWise users.</h1>
        </div>
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
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{ ...selectStyle, padding: '4px 8px', fontSize: '12px' }}
                        disabled={isSelf}
                      >
                        <option value="Pet Owner">Pet Owner</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                      </select>
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
