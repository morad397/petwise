const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if it doesn't have the old header
    if (!content.includes('<header className="page-topbar">')) {
      return;
    }

    // Replace header block with <TopBar />
    content = content.replace(/<header className="page-topbar">[\s\S]*?<\/header>/, '<TopBar />');

    // Add import statement at the top if it doesn't exist
    if (!content.includes("import TopBar from '../components/TopBar';")) {
      // Find the first line with 'import'
      const importMatches = [...content.matchAll(/import .*?from .*?;/g)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const index = lastImport.index + lastImport[0].length;
        content = content.substring(0, index) + "\nimport TopBar from '../components/TopBar';" + content.substring(index);
      } else {
        content = "import TopBar from '../components/TopBar';\n" + content;
      }
    }

    // Also some files might have unused Link imports after this, but ESLint can fix it later if needed.
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
