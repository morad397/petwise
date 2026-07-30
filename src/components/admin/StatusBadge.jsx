export default function StatusBadge({ status, type }) {
  let badgeClass = 'status-badge ';
  
  // Define styles based on generic types or specific statuses
  if (type === 'success' || status === 'Active' || status === 'Operational' || status === 'In Stock') {
    badgeClass += 'badge-success';
  } else if (type === 'warning' || status === 'Low Stock' || status === 'Planned' || status === 'Maintenance') {
    badgeClass += 'badge-warning';
  } else if (type === 'danger' || status === 'Suspended' || status === 'Out of Stock' || status === 'Not Connected' || status === 'Error') {
    badgeClass += 'badge-danger';
  } else if (type === 'info') {
    badgeClass += 'badge-info';
  } else {
    badgeClass += 'badge-default';
  }

  return (
    <span className={badgeClass} style={inlineStyles(badgeClass)}>
      {status}
    </span>
  );
}

// Temporary inline styles to ensure it looks good before adding to index.css
function inlineStyles(badgeClass) {
  const base = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
  };

  if (badgeClass.includes('badge-success')) {
    return { ...base, backgroundColor: '#e6f4ea', color: '#137333' };
  }
  if (badgeClass.includes('badge-warning')) {
    return { ...base, backgroundColor: '#fef7e0', color: '#b06000' };
  }
  if (badgeClass.includes('badge-danger')) {
    return { ...base, backgroundColor: '#fce8e6', color: '#c5221f' };
  }
  if (badgeClass.includes('badge-info')) {
    return { ...base, backgroundColor: '#e8f0fe', color: '#1a73e8' };
  }
  return { ...base, backgroundColor: '#f1f3f4', color: '#5f6368' };
}
