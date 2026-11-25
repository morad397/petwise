import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { logout } from '../services/authService';
import { productImage, formatPrice } from '../services/shopService';
import NotificationBell from './NotificationBell';
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
  const { cart, isCartOpen, toggleCart, closeCart, refreshCart, removeFromCart, changeQuantity, resetCart } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [userName, setUserName] = useState('User');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is admin or staff
    try {
      const user = JSON.parse(localStorage.getItem('petwise-user') || '{}');
      if (user.role === 'admin' || user.role === 'ADMIN') {
        setIsAdmin(true);
        if (user.fullName) setUserName(user.fullName);
      } else if (user.role === 'CLINIC_STAFF') {
        setIsStaff(true);
        if (user.fullName) setUserName(user.fullName);
      } else {
        if (user.fullName) setUserName(user.fullName);
      }
    } catch (e) {
      console.error('Failed to parse user', e);
    }

    // Load this user's cart from the server
    refreshCart();

    // Load theme preference
    const savedTheme = localStorage.getItem('petwise-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
  }, [refreshCart]);

  const runCartAction = async (action) => {
    try {
      await action();
    } catch (error) {
      alert(error.message);
    }
  };

  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

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
    logout();
    resetCart();
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
    { name: 'Clinics', path: '/admin/clinics', icon: Home },
    { name: 'Inventory', path: '/admin/inventory', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Reports', path: '/admin/reports', icon: Siren },
    { name: 'System', path: '/admin/system', icon: Bell },
  ];

  const staffNavLinks = [
    { name: 'Overview', path: '/staff', icon: Home },
    { name: 'Appointments', path: '/staff/appointments', icon: Calendar },
    { name: 'Patients', path: '/staff/patients', icon: PawPrint },
    { name: 'Schedule', path: '/staff/schedule', icon: Calendar },
    { name: 'Profile', path: '/staff/profile', icon: Users },
  ];

  const navLinks = isAdmin ? adminNavLinks : (isStaff ? staffNavLinks : userNavLinks);

  const cartTotal = cart.total;

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
          return (
            <NavLink 
              key={link.name} 
              to={link.path} 
              end={link.path === '/admin' || link.path === '/staff'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${link.isDanger ? 'danger' : ''}`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleDarkMode} title="Toggle Theme">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell />

        {!(isAdmin || isStaff) && (
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={toggleCart}>
              <ShoppingCart size={20} />
              {cart.itemCount > 0 && (
                <span className="cart-badge">{cart.itemCount}</span>
              )}
            </button>
            
            {isCartOpen && (
              <div className="cart-dropdown">
                <div className="cart-header">
                  <h4>Your Cart</h4>
                  <button className="icon-btn" onClick={toggleCart}><X size={16} /></button>
                </div>
                <div className="cart-items">
                  {cart.items.length === 0 ? (
                    <p className="empty-cart">Your cart is empty.</p>
                  ) : (
                    cart.items.map((item) => (
                      <div key={item.productId} className="cart-item">
                        <img src={productImage(item.imageUrl)} alt={item.name} />
                        <div className="cart-item-info">
                          <p>{item.name}</p>
                          <strong>{formatPrice(item.unitPrice)} x {item.quantity}</strong>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <button className="icon-btn" style={{ width: 24, height: 24 }} title="One less"
                              onClick={() => runCartAction(() => changeQuantity(item.productId, item.quantity - 1))}>−</button>
                            <button className="icon-btn" style={{ width: 24, height: 24 }} title="One more"
                              disabled={item.quantity >= item.inStock}
                              onClick={() => runCartAction(() => changeQuantity(item.productId, item.quantity + 1))}>+</button>
                          </div>
                        </div>
                        <button className="icon-btn remove-btn" onClick={() => runCartAction(() => removeFromCart(item.productId))}>
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {cart.items.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total:</span>
                      <strong>${cartTotal.toFixed(2)}</strong>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={goToCheckout}>Checkout</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button className="icon-btn" onClick={handleLogout} title="Logout" style={{ color: '#d43a57' }}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
