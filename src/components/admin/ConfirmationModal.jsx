import { X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="icon-btn" onClick={onCancel}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 0', color: '#4a4a4a' }}>
          <p>{message}</p>
        </div>
        <div style={footerStyle}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            style={isDanger ? dangerBtnStyle : {}}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const contentStyle = {
  background: 'white',
  borderRadius: '16px',
  padding: '24px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #eee',
  paddingBottom: '12px'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  paddingTop: '16px',
  borderTop: '1px solid #eee'
};

const dangerBtnStyle = {
  backgroundColor: '#d93025',
  color: 'white',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '8px',
  fontWeight: '600',
  cursor: 'pointer'
};
