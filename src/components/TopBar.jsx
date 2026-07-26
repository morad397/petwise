import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  PawPrint, 
  Home, 
  Calendar, 
  ShoppingBag, 
  Bell, 
  Users, 
  MessageCircle, 
  Siren, 
  ShoppingCart, 
  Moon,
  Sun, 
  User, 
  ChevronDown 
} from 'lucide-react';

export default function TopBar() {
  const location = useLocation();
  const [petName, setPetName] = useState('My Pet');
  const [petImage, setPetImage] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load pet data
    try {
      const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');
      if (savedPets.length > 0) {
        setPetName(savedPets[0].name || 'My Pet');
        if (savedPets[0].avatar) setPetImage(savedPets[0].avatar);
      }
    } catch (e) {
      console.error('Failed to parse pets', e);
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('petwise-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.body.classList.add('dark');
        localStorage.setItem('petwise-theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('petwise-theme', 'light');
      }
      return newMode;
    });
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Pets', path: '/pets', icon: PawPrint },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'AI Vet', path: '/ai-vet', icon: MessageCircle },
    { name: 'SOS', path: '/sos', icon: Siren, isDanger: true },
  ];

  return (
    <header className="page-topbar">
      <div className="brand-lockup">
        <div className="brand-icon-circle">
          <PawPrint size={20} fill="currentColor" />
        </div>
        <span className="brand-name">Petwise</span>
      </div>

      <nav className="main-nav-new">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`nav-item ${isActive ? 'active' : ''} ${link.isDanger ? 'danger' : ''}`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="topbar-actions">
        <button className="icon-btn"><ShoppingCart size={20} /></button>
        <button className="icon-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn"><User size={20} /></button>
        <div className="user-pill">
          <img src={petImage} alt={petName} className="user-avatar" />
          <span className="user-name">{petName}</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
