const fs = require('fs');
const path = require('path');

// Load HTML into jsdom
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
// Extract body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
document.body.innerHTML = bodyMatch ? bodyMatch[1] : html;

// Mock Chart.js globally before loading app.js
global.Chart = jest.fn().mockImplementation(() => ({
  data: { datasets: [{ data: [] }] },
  update: jest.fn(),
  destroy: jest.fn()
}));

// Load app.js (not a module, so use eval)
const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
eval(appCode);
