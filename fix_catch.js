const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const regex = /catch\s*\(\s*([a-zA-Z0-9_]+)(?:\s*:\s*any)?\s*\)\s*\{([\s\S]*?)throw\s+\1\s*;/g;
  
  content = content.replace(regex, (match, errName, inside) => {
    changed = true;
    
    // remove existing console.error if present inside the catch block to avoid double logging
    let cleanInside = inside.replace(/console\.error\([^;]+\);?/g, '').trim();
    if (cleanInside.includes("console.error")) {
        // Fallback for multiline console.error
        cleanInside = cleanInside.replace(/console\.error\([\s\S]*?\);?/g, '').trim();
    }

    return `catch (${errName}: any) {
    console.error("Supabase error:", {
      message: ${errName}?.message,
      details: ${errName}?.details,
      hint: ${errName}?.hint,
      code: ${errName}?.code,
      fullError: JSON.stringify(${errName}, null, 2)
    });
    ${cleanInside}
    throw new Error(${errName}?.message || JSON.stringify(${errName}) || "Unknown error");`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
  }
}

const files = [
  'src/lib/catalogStore.ts',
  'src/lib/productsStore.ts',
  'src/context/CatalogContext.tsx',
  'src/context/ProductContext.tsx',
  'src/context/HomepageContentContext.tsx',
  'src/context/ContactInfoContext.tsx',
  'src/context/SiteSettingsContext.tsx'
];

files.forEach(fixFile);
