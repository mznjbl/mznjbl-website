import { mkdirSync, rmSync, cpSync } from 'node:fs';

const output = 'dist';

rmSync(output, { recursive: true, force: true });
mkdirSync(output);

const files = [
  'index.html',
  'about.html',
  'projects.html',
  'privacy.html',
  'styles.css',
  'app.js',
  'assets',
  'supply.html',
  'dead-end.html',
  'told-you.html',
  'projects'
];

for (const file of files) {
  cpSync(file, `${output}/${file}`, { recursive: true });
}

console.log('MZNJBL/ production build complete.');
