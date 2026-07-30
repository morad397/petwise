const fs = require('fs');
const path = require('path');

const files = [
  'WeightHabits.jsx', 'VetVisits.jsx', 'Vaccinations.jsx', 'Sos.jsx',
  'Shop.jsx', 'Settings.jsx', 'Reminders.jsx', 'Recommendations.jsx',
  'PetProfile.jsx', 'MyPets.jsx', 'FeedingSchedule.jsx', 'Dashboard.jsx',
  'Community.jsx', 'Appointments.jsx', 'AiVet.jsx'
];

files.forEach(file => {
  const filepath = path.join('c:/Users/user/OneDrive - Kinneret Academic College/מסמכים/GitHub/petwise/petwise/src/pages', file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  content = content.replace(/import TopBar from '..\/components\/TopBar';\n/g, '');
  content = content.replace(/<div className="app-shell">\s*<TopBar \/>\s*<main className="page-inner dashboard-layout">/, '<>');
  content = content.replace(/<div className="app-shell">\s*<TopBar \/>\s*<main className="page-inner">/, '<>');
  content = content.replace(/<div className="app-shell">\s*<TopBar \/>\s*<main[^>]*>/, '<>');
  
  // Replace the closing tags
  content = content.replace(/<\/main>\s*<\/div>\s*\);\s*}/g, '</>\n  );\n}');
  content = content.replace(/<\/main>\s*<\/div>/g, '</>');
  
  fs.writeFileSync(filepath, content);
});
