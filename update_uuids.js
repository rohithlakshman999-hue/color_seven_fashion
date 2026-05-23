const fs = require('fs');
const crypto = require('crypto');
let c = fs.readFileSync('src/data/products.ts', 'utf8');
c = c.replace(/id: "\d+"/g, () => `id: "${crypto.randomUUID()}"`);
c = c.replace(/id: "c\d+"/g, () => `id: "${crypto.randomUUID()}"`);
fs.writeFileSync('src/data/products.ts', c);
console.log('Done products.ts');
