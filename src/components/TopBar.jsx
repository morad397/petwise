import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
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
  LogOut, 
  ChevronDown,
  X,
  Check,
  Plus
} from 'lucide-react';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, isCartOpen, toggleCart, removeFromCart } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('My Pet');
  const [petImage, setPetImage] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPetMenuOpen, setIsPetMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    try {
      const user = JSON.parse(localStorage.getItem('petwise-user') || '{}');
      if (user.role === 'admin') {
        setIsAdmin(true);
        if (user.fullName) setUserName(user.fullName);
      }
    } catch (e) {
      console.error('Failed to parse user', e);
    }

    // Load pet data
    try {
      const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');
      setPets(savedPets);
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

  const handleLogout = () => {
    localStorage.removeItem('petwise-user');
    navigate('/login');
  };

  const userNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Pets', path: '/pets', icon: PawPrint },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'AI Vet', path: '/ai-vet', icon: MessageCircle },
    { name: 'SOS', path: '/sos', icon: Siren, isDanger: true },
  ];

  const adminNavLinks = [
    { name: 'Overview', path: '/admin', icon: Home },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Inventory', path: '/admin/inventory', icon: ShoppingBag },
    { name: 'System', path: '/admin/system', icon: Bell },
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  const cartTotal = cart.reduce((total, item) => {
    const priceNum = parseFloat(item.price.replace('$', ''));
    return total + (priceNum * item.quantity);
  }, 0);

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
        {!isAdmin && (
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={toggleCart}>
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </button>
            
            {isCartOpen && (
              <div className="cart-dropdown">
                <div className="cart-header">
                  <h4>Your Cart</h4>
                  <button className="icon-btn" onClick={toggleCart}><X size={16} /></button>
                </div>
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <p className="empty-cart">Your cart is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.name} className="cart-item">
                        <img src={item.image} alt={item.name} />
                        <div className="cart-item-info">
                          <p>{item.name}</p>
                          <strong>{item.price} x {item.quantity}</strong>
                        </div>
                        <button className="icon-btn remove-btn" onClick={() => removeFromCart(item.name)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total:</span>
                      <strong>${cartTotal.toFixed(2)}</strong>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Checkout</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button className="icon-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </button>
        
        <div style={{ position: 'relative' }}>
          {isAdmin ? (
            <div className="user-pill" style={{cursor: 'default'}}>
              <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#ff5a79', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'}}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{userName} (Admin)</span>
            </div>
          ) : (
            <>
              <div className="user-pill" onClick={() => setIsPetMenuOpen(!isPetMenuOpen)}>
                <img src={petImage} alt={petName} className="user-avatar" />
                <span className="user-name">{petName}</span>
                <ChevronDown size={16} />
              </div>

              {isPetMenuOpen && (
                <div className="pet-selector-dropdown">
                  {pets.map((pet, index) => (
                    <div key={pet.name || index} className="pet-selector-item" onClick={() => setIsPetMenuOpen(false)}>
                      <img src={pet.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'} alt={pet.name} />
                      <div className="pet-selector-info">
                        <strong>{pet.name}</strong>
                        <span>{pet.type || 'Pet'}</span>
                      </div>
                      {index === 0 && <Check size={18} color="#ff5a79" style={{ marginLeft: 'auto' }} />}
                    </div>
                  ))}
                  <div className="pet-selector-footer">
                    <Link to="/add-pet" className="add-pet-link" onClick={() => setIsPetMenuOpen(false)}>
                      <Plus size={16} />
                      <span>Add Pet</span>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
