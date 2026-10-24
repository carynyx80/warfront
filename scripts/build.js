import fs from 'node:fs';
const raw = process.env.WARFRONT_SERVER_URL || '';
if (raw) {
  const url = new URL(raw);
  if (!['wss:', 'ws:'].includes(url.protocol)) throw new Error('WARFRONT_SERVER_URL must use ws:// or wss://');
  if (process.env.VERCEL && url.protocol !== 'wss:') throw new Error('Vercel requires a secure wss:// game server');
  if (url.username || url.password || url.search || url.hash) throw new Error('Game server URL must not contain credentials, query parameters, or fragments');
}
fs.mkdirSync('dist/vendor', { recursive: true });
fs.mkdirSync('dist/shared', { recursive: true });
fs.copyFileSync('node_modules/playcanvas/build/playcanvas.min.mjs', 'dist/vendor/playcanvas.mjs');
fs.copyFileSync('node_modules/playcanvas/LICENSE', 'dist/vendor/LICENSE.playcanvas');
fs.copyFileSync('packages/shared/simulation.js', 'dist/shared/simulation.js');
fs.writeFileSync('dist/config.js', `export const serverUrl = ${JSON.stringify(raw)};\n`);
console.log('Client assets packaged. Multiplayer endpoint: ' + (raw ? 'configured' : 'not configured; lobby accepts manual URL'));
