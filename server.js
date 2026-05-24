// Local development server — mirrors the Netlify setup:
//   • static files from /public
//   • /api/proxy → same logic as netlify/functions/proxy.js
const express = require('express');
const https   = require('https');
const http    = require('http');
const path    = require('path');
const { exec } = require('child_process');

const app  = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Proxy Google Sheets CSV (avoids CORS in the browser)
function fetchCSV(sheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  return fetchFollow(url, 0);
}

function fetchFollow(url, hops) {
  if (hops > 10) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        let next = res.headers.location;
        if (next.startsWith('/')) { const u = new URL(url); next = `${u.protocol}//${u.host}${next}`; }
        return fetchFollow(next, hops + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

app.get('/api/proxy', async (req, res) => {
  const { sheetId } = req.query;
  if (!sheetId || !/^[a-zA-Z0-9_-]+$/.test(sheetId)) {
    return res.status(400).json({ error: 'Invalid or missing sheetId' });
  }
  try {
    const text  = await fetchCSV(sheetId);
    const start = text.trimStart();
    if (start.startsWith('<!DOCTYPE') || start.startsWith('<html')) {
      return res.status(403).json({
        error: 'Sheet is private — Google blocked access.',
        hint: 'In Google Sheets: Share → Change → Anyone with the link → Viewer',
      });
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   📊  Job Application Tracker        ║');
  console.log(`║   →  http://localhost:${PORT}           ║`);
  console.log('╚══════════════════════════════════════╝\n');
  setTimeout(() => exec('xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null'), 500);
});
