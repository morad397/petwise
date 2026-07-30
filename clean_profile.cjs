const fs = require('fs');
const path = require('path');

const files = [
  'WeightHabits.jsx', 'VetVisits.jsx', 'Vaccinations.jsx', 'Recommendations.jsx',
  'PetProfile.jsx', 'FeedingSchedule.jsx'
];

files.forEach(file => {
  const filepath = path.join('c:/Users/user/OneDrive - Kinneret Academic College/מסמכים/GitHub/petwise/petwise/src/pages', file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  content = content.replace(/<div className="app-shell">\s*<main className="page-inner profile-layout">/g, '<>');
  
  fs.writeFileSync(filepath, content);
});
