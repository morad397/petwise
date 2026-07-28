import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/AdminDashboard';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminDashboard />} />
      <Route path="/admin/inventory" element={<AdminDashboard />} />
      <Route path="/admin/system" element={<AdminDashboard />} />
      <Route path="/pets" element={<MyPets />} />
      <Route path="/pets/:id" element={<PetProfile />} />
      <Route path="/add-pet" element={<AddPet />} />
      <Route path="/pets/:id/feeding" element={<FeedingSchedule />} />
      <Route path="/pets/:id/vaccinations" element={<Vaccinations />} />
      <Route path="/pets/:id/vet-visits" element={<VetVisits />} />
      <Route path="/pets/:id/weight" element={<WeightHabits />} />
      <Route path="/pets/:id/recommendations" element={<Recommendations />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/sos" element={<Sos />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/reminders" element={<Reminders />} />
      <Route path="/community" element={<Community />} />
      <Route path="/ai-vet" element={<AiVet />} />
    </Routes>
  );
}

export default App;