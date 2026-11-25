import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  timeAgo,
} from '../services/notificationService';

const REFRESH_MS = 60 * 1000; // check for new notifications every minute

// Bell icon with an unread count and a drop-down list (shown for every role)
export default function NotificationBell() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], unreadCount: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const load = () =>
    getNotifications()
      .then(setData)
      .catch(() => {}); // not logged in or offline: keep the last list

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const open = () => {
    setIsOpen((current) => !current);
    load();
  };

  const handleClick = async (item) => {
    try {
      if (!item.isRead) await markNotificationRead(item.id);
    } catch {
      // ignore, still navigate
    }
    setIsOpen(false);
    load();
    if (item.link) navigate(item.link);
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    load();
  };

  const handleDelete = async (event, item) => {
    event.stopPropagation();
    await deleteNotification(item.id).catch(() => {});
    load();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={open} title="Notifications" aria-label="Notifications">
        <Bell size={20} />
        {data.unreadCount > 0 && <span className="cart-badge">{data.unreadCount > 9 ? '9+' : data.unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="cart-dropdown" style={{ width: '340px' }}>
          <div className="cart-header">
            <h4>Notifications</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {data.unreadCount > 0 && (
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={handleReadAll}>
                  Mark all read
                </button>
              )}
              <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
          </div>
          <div className="cart-items" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {data.items.length === 0 ? (
              <p className="empty-cart">No notifications yet.</p>
            ) : (
              data.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClick(item)}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '10px 8px',
                    borderBottom: '1px solid #eef1f6',
                    cursor: 'pointer',
                    background: item.isRead ? 'transparent' : '#fff5f7',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: '50%', flexShrink: 0, background: item.isRead ? 'transparent' : '#ff5a79' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: item.isRead ? 500 : 700, color: '#0f2138', fontSize: '0.9rem' }}>{item.title}</p>
                    {item.message && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.82rem' }}>{item.message}</p>}
                    <small style={{ color: '#94a3b8' }}>{timeAgo(item.createdAt)}</small>
                  </div>
                  <button className="icon-btn remove-btn" title="Remove" onClick={(e) => handleDelete(e, item)}><X size={12} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
