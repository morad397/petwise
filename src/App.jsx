import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pets/:id" element={<PetProfile />} />
      <Route path="/add-pet" element={<AddPet />} />
      <Route path="/pets/:id/feeding" element={<FeedingSchedule />} />
      <Route path="/pets/:id/vaccinations" element={<Vaccinations />} />
      <Route path="/pets/:id/vet-visits" element={<VetVisits />} />
      <Route path="/pets/:id/weight" element={<WeightHabits />} />
      <Route path="/pets/:id/recommendations" element={<Recommendations />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;