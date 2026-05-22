const cp = require('child_process');
const path = require('path');

const poly = path.join(__dirname, 'polyfill-self.js');
// Normalize to forward slashes for NODE_OPTIONS on Windows
const polyNormalized = poly.replace(/\\/g, '/');
const env = Object.assign({}, process.env);

env.NODE_OPTIONS = (env.NODE_OPTIONS ? env.NODE_OPTIONS + ' ' : '') + `--require "${polyNormalized}"`;

const args = ['next', 'dev', '--webpack'];

const child = cp.spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env,
});

child.on('exit', (code) => process.exit(code));
child.on('error', (err) => {
  console.error('Failed to start Next dev:', err);
  process.exit(1);
});
