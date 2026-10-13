const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/analytics_store.json'), 'utf8'));
let sql = '-- Seed 2,119 baseline visits for website_visits table\n';
sql += 'INSERT INTO website_visits (id, visitor_id, session_id, pathname, page_title, referrer, device_type, browser, os, ip_hash, created_at) VALUES\n';

const rows = data.map((v) => {
  const esc = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL');
  return `(${esc(v.id)}, ${esc(v.visitor_id)}, ${esc(v.session_id)}, ${esc(v.pathname)}, ${esc(v.page_title)}, ${esc(v.referrer)}, ${esc(v.device_type)}, ${esc(v.browser)}, ${esc(v.os)}, ${esc(v.ip_hash)}, ${esc(v.created_at)})`;
});

sql += rows.join(',\n') + ';\n';

fs.writeFileSync(path.join(__dirname, '../supabase/migrations/005_seed_baseline_analytics.sql'), sql, 'utf8');
console.log('Generated SQL seed file with', data.length, 'records');
