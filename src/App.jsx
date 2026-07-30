import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSystem from './pages/admin/AdminSystem';
import AdminClinics from './pages/admin/AdminClinics';
import Dashboard from './pages/Dashboard';
import PetProfile from './pages/PetProfile';
import AddPet from './pages/AddPet';
import FeedingSchedule from './pages/FeedingSchedule';
import Vaccinations from './pages/Vaccinations';
import VetVisits from './pages/VetVisits';
import WeightHabits from './pages/WeightHabits';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Appointments from './pages/Appointments';
import Sos from './pages/Sos';
import Shop from './pages/Shop';
import Reminders from './pages/Reminders';
import Community from './pages/Community';
import AiVet from './pages/AiVet';
import MyPets from './pages/MyPets';
import ProtectedRoute from './components/ProtectedRoute';
import PetOwnerLayout from './components/PetOwnerLayout';
import StaffLayout from './components/clinic/StaffLayout';
import StaffOverview from './pages/clinic/StaffOverview';
import StaffAppointments from './pages/clinic/StaffAppointments';
import StaffPatients from './pages/clinic/StaffPatients';
import StaffSchedule from './pages/clinic/StaffSchedule';
import StaffProfile from './pages/clinic/StaffProfile';

function App() {
  useEffect(() => {
    if (localStorage.getItem('petwise_fresh_start') !== 'true') {
      const keys = Object.keys(localStorage);
      const petwiseKeys = keys.filter(k => k.startsWith('petwise'));
      petwiseKeys.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('petwise_fresh_start', 'true');
      window.location.href = '/register';
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="clinics" element={<AdminClinics />} />
        </Route>
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['CLINIC_STAFF', 'ADMIN']} />}>
        <Route element={<StaffLayout />}>
          <Route index element={<StaffOverview />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="patients" element={<StaffPatients />} />
          <Route path="schedule" element={<StaffSchedule />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>
      </Route>

      {/* Pet Owner Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['PET_OWNER', 'ADMIN']} />}>
        {/* AddPet uses auth-shell, so it doesn't get PetOwnerLayout */}
        <Route path="/add-pet" element={<AddPet />} />
        
        <Route element={<PetOwnerLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pets" element={<MyPets />} />
          <Route path="/pets/:petId" element={<PetProfile />} />
          <Route path="/pets/:petId/feeding" element={<FeedingSchedule />} />
          <Route path="/pets/:petId/medical" element={<Vaccinations />} />
          <Route path="/pets/:petId/vet-visits" element={<VetVisits />} />
          <Route path="/pets/:petId/weight-habits" element={<WeightHabits />} />
          <Route path="/pets/:petId/recommendations" element={<Recommendations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/sos" element={<Sos />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/community" element={<Community />} />
          <Route path="/ai-vet" element={<AiVet />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;