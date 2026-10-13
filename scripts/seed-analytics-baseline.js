const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateBaselineAnalytics(totalCount = 2119, todayCount = 87) {
  const pages = [
    { path: '/', title: 'COLOUR SEVEN FASHION | Home', weight: 38 },
    { path: '/shop', title: 'Shop Premium Streetwear | Colour Seven', weight: 24 },
    { path: '/shop/watches', title: 'Luxury Watches Collection | Colour Seven', weight: 14 },
    { path: '/shop/shoes', title: 'Streetwear Footwear | Colour Seven', weight: 8 },
    { path: '/shop/clothing', title: 'Streetwear & Apparel | Colour Seven', weight: 7 },
    { path: '/products/rolex-submariner-date', title: 'Rolex Submariner Date | Colour Seven', weight: 3 },
    { path: '/cart', title: 'Shopping Bag | Colour Seven', weight: 2.5 },
    { path: '/about', title: 'About Us | Colour Seven', weight: 2 },
    { path: '/contact', title: 'Contact Support | Colour Seven', weight: 1.5 },
  ];

  const devices = [
    { type: 'mobile', weight: 58, browsers: ['Mobile Safari', 'Chrome Mobile'], os: ['iOS', 'Android'] },
    { type: 'desktop', weight: 38, browsers: ['Chrome', 'Safari', 'Edge', 'Firefox'], os: ['Windows', 'macOS'] },
    { type: 'tablet', weight: 4, browsers: ['Safari', 'Chrome'], os: ['iPadOS', 'Android'] },
  ];

  const referrers = [
    { url: 'https://www.instagram.com/', weight: 38 },
    { url: 'https://www.google.com/', weight: 32 },
    { url: '', weight: 20 }, // Direct
    { url: 'https://www.facebook.com/', weight: 6 },
    { url: 'https://in.pinterest.com/', weight: 4 },
  ];

  function pickWeighted(items) {
    const total = items.reduce((acc, curr) => acc + curr.weight, 0);
    let random = Math.random() * total;
    for (const item of items) {
      if (random < item.weight) return item;
      random -= item.weight;
    }
    return items[0];
  }

  // Pre-generate pool of ~1,400 anonymous visitors (to simulate new + returning visitors)
  const visitorPool = [];
  for (let i = 0; i < 1450; i++) {
    visitorPool.push({
      id: `cs_vid_${crypto.randomUUID().slice(0, 16)}`,
      device: pickWeighted(devices),
      favPage: pickWeighted(pages).path,
    });
  }

  const visits = [];
  const now = new Date(); // Current local time: Oct 13, 2026

  // 1. Generate TODAY's visits (exactly todayCount)
  for (let i = 0; i < todayCount; i++) {
    const visitor = visitorPool[Math.floor(Math.random() * visitorPool.length)];
    const page = Math.random() < 0.4 ? { path: visitor.favPage, title: '' } : pickWeighted(pages);
    const ref = pickWeighted(referrers);

    // Spread across 08:00 AM to 18:25 PM today
    const hour = 8 + Math.floor(Math.random() * 10); // 8 to 17
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const visitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);

    visits.push({
      id: crypto.randomUUID(),
      visitor_id: visitor.id,
      session_id: `cs_sid_${crypto.randomUUID().slice(0, 12)}`,
      pathname: page.path,
      page_title: page.title || 'Colour Seven Fashion',
      referrer: ref.url || undefined,
      device_type: visitor.device.type,
      browser: visitor.device.browsers[Math.floor(Math.random() * visitor.device.browsers.length)],
      os: visitor.device.os[Math.floor(Math.random() * visitor.device.os.length)],
      ip_hash: crypto.createHash('sha256').update(visitor.id).digest('hex').slice(0, 32),
      created_at: visitDate.toISOString(),
    });
  }

  // 2. Generate PAST visits (exactly pastCount = totalCount - todayCount)
  const pastCount = totalCount - todayCount;
  // Distribute over previous 29 days
  const days = 29;
  const visitsPerDay = [];
  let remaining = pastCount;

  for (let d = 1; d <= days; d++) {
    const isWeekend = (new Date(now.getFullYear(), now.getMonth(), now.getDate() - d).getDay() % 6 === 0);
    // Average ~70/day, weekends slightly higher
    const base = isWeekend ? 78 : 68;
    const variation = Math.floor(Math.random() * 25) - 12; // +/- 12
    const target = Math.max(45, base + variation);
    visitsPerDay.push(target);
    remaining -= target;
  }

  // Adjust remaining to exact match
  while (remaining !== 0) {
    const idx = Math.floor(Math.random() * days);
    if (remaining > 0) {
      visitsPerDay[idx]++;
      remaining--;
    } else if (remaining < 0 && visitsPerDay[idx] > 30) {
      visitsPerDay[idx]--;
      remaining++;
    }
  }

  for (let d = 1; d <= days; d++) {
    const countForDay = visitsPerDay[d - 1];
    for (let i = 0; i < countForDay; i++) {
      const visitor = visitorPool[Math.floor(Math.random() * visitorPool.length)];
      const page = Math.random() < 0.35 ? { path: visitor.favPage, title: '' } : pickWeighted(pages);
      const ref = pickWeighted(referrers);

      // Random hour between 07:00 and 23:00
      const hour = 7 + Math.floor(Math.random() * 16);
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const visitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, hour, minute, second);

      visits.push({
        id: crypto.randomUUID(),
        visitor_id: visitor.id,
        session_id: `cs_sid_${crypto.randomUUID().slice(0, 12)}`,
        pathname: page.path,
        page_title: page.title || 'Colour Seven Fashion',
        referrer: ref.url || undefined,
        device_type: visitor.device.type,
        browser: visitor.device.browsers[Math.floor(Math.random() * visitor.device.browsers.length)],
        os: visitor.device.os[Math.floor(Math.random() * visitor.device.os.length)],
        ip_hash: crypto.createHash('sha256').update(visitor.id).digest('hex').slice(0, 32),
        created_at: visitDate.toISOString(),
      });
    }
  }

  // Sort descending by created_at (newest first)
  visits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return visits;
}

const baseline = generateBaselineAnalytics(2119, 87);
const outPath = path.join(__dirname, '../data/analytics_store.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(baseline, null, 2), 'utf-8');

console.log(`Generated baseline analytics store with ${baseline.length} total visits at ${outPath}`);

// Verification
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
const todayVisits = baseline.filter(v => new Date(v.created_at) >= todayStart);
const uniqueVisitors = new Set(baseline.map(v => v.visitor_id)).size;
const todayVisitors = new Set(todayVisits.map(v => v.visitor_id)).size;

console.log({
  totalViews: baseline.length,
  totalUniqueVisitors: uniqueVisitors,
  todayViews: todayVisits.length,
  todayVisitors: todayVisitors
});
