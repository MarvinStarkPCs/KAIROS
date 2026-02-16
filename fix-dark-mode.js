const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) results = results.concat(walk(full));
      else if (f.endsWith('.tsx')) results.push(full);
    }
  } catch(e) {}
  return results;
}

const pages = walk(path.join('resources', 'js', 'pages'));
const comps = walk(path.join('resources', 'js', 'components')).filter(f => {
  const rel = path.relative(path.join('resources', 'js', 'components'), f);
  return !rel.startsWith('ui' + path.sep);
});

const allFiles = [...pages, ...comps].filter(f => !f.endsWith('welcome.tsx'));

let totalChanges = 0;
const changedFiles = [];

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. text-gray replacements (do more specific patterns first)
  content = content.replace(/text-gray-900/g, 'text-foreground');
  content = content.replace(/text-gray-800/g, 'text-foreground');
  content = content.replace(/text-gray-700/g, 'text-muted-foreground');
  content = content.replace(/text-gray-600/g, 'text-muted-foreground');
  content = content.replace(/text-gray-500/g, 'text-muted-foreground');
  content = content.replace(/text-gray-400/g, 'text-muted-foreground');

  // 2. bg-white -> bg-card
  content = content.replace(/bg-white/g, 'bg-card');

  // 3. bg-gray-50 -> bg-muted
  content = content.replace(/bg-gray-50/g, 'bg-muted');

  // 4. bg-gray-100 -> bg-muted
  content = content.replace(/bg-gray-100/g, 'bg-muted');

  // 5. bg-gray-200 -> bg-muted (progress bars etc)
  content = content.replace(/bg-gray-200/g, 'bg-muted');

  // 6. border-gray-200 -> border-border
  content = content.replace(/border-gray-200/g, 'border-border');

  // 7. border-gray-300 -> border-input
  content = content.replace(/border-gray-300/g, 'border-input');

  // 8. divide-gray-200 -> divide-border
  content = content.replace(/divide-gray-200/g, 'divide-border');

  // 9. hover:bg-gray-50 -> hover:bg-muted
  content = content.replace(/hover:bg-gray-50/g, 'hover:bg-muted');

  // 10. hover:bg-gray-100 -> hover:bg-muted
  content = content.replace(/hover:bg-gray-100/g, 'hover:bg-muted');

  // 11. ring-gray-300 -> ring-input
  content = content.replace(/ring-gray-300/g, 'ring-input');

  // Fix native select elements: border-input bg-card -> border-input bg-background + text-foreground
  // Pattern: select elements with border-input bg-card px-3 py-2 text-sm without text-foreground
  content = content.replace(
    /border-input bg-card px-3 py-2 text-sm(?![\s"].*?text-foreground)/g,
    'border-input bg-background px-3 py-2 text-sm text-foreground'
  );

  // Also fix any select that already has text-foreground but bg-card instead of bg-background
  // (from earlier processing)
  // Only for select-like patterns (px-3 py-2 text-sm)
  content = content.replace(
    /border-input bg-card px-3 py-2 text-sm text-foreground/g,
    'border-input bg-background px-3 py-2 text-sm text-foreground'
  );

  // Add dark variants to colored badges that don't already have them
  // bg-green-100 without dark: variant following
  content = content.replace(/bg-green-100(?! dark:)/g, 'bg-green-100 dark:bg-green-900/30');
  content = content.replace(/bg-red-100(?! dark:)/g, 'bg-red-100 dark:bg-red-900/30');
  content = content.replace(/bg-blue-100(?! dark:)/g, 'bg-blue-100 dark:bg-blue-900/30');
  content = content.replace(/bg-yellow-100(?! dark:)/g, 'bg-yellow-100 dark:bg-yellow-900/30');
  content = content.replace(/bg-purple-100(?! dark:)/g, 'bg-purple-100 dark:bg-purple-900/30');
  content = content.replace(/bg-orange-100(?! dark:)/g, 'bg-orange-100 dark:bg-orange-900/30');
  content = content.replace(/bg-amber-100(?! dark:)/g, 'bg-amber-100 dark:bg-amber-900/30');
  content = content.replace(/bg-indigo-100(?! dark:)/g, 'bg-indigo-100 dark:bg-indigo-900/30');
  content = content.replace(/bg-emerald-100(?! dark:)/g, 'bg-emerald-100 dark:bg-emerald-900/30');
  content = content.replace(/bg-teal-100(?! dark:)/g, 'bg-teal-100 dark:bg-teal-900/30');
  content = content.replace(/bg-cyan-100(?! dark:)/g, 'bg-cyan-100 dark:bg-cyan-900/30');
  content = content.replace(/bg-pink-100(?! dark:)/g, 'bg-pink-100 dark:bg-pink-900/30');
  content = content.replace(/bg-rose-100(?! dark:)/g, 'bg-rose-100 dark:bg-rose-900/30');

  // Add dark variants for text-COLOR-700 that don't already have dark: variants
  content = content.replace(/text-green-700(?! dark:)/g, 'text-green-700 dark:text-green-400');
  content = content.replace(/text-red-700(?! dark:)/g, 'text-red-700 dark:text-red-400');
  content = content.replace(/text-blue-700(?! dark:)/g, 'text-blue-700 dark:text-blue-400');
  content = content.replace(/text-yellow-700(?! dark:)/g, 'text-yellow-700 dark:text-yellow-400');
  content = content.replace(/text-purple-700(?! dark:)/g, 'text-purple-700 dark:text-purple-400');
  content = content.replace(/text-orange-700(?! dark:)/g, 'text-orange-700 dark:text-orange-400');
  content = content.replace(/text-amber-700(?! dark:)/g, 'text-amber-700 dark:text-amber-400');
  content = content.replace(/text-indigo-700(?! dark:)/g, 'text-indigo-700 dark:text-indigo-400');
  content = content.replace(/text-pink-700(?! dark:)/g, 'text-pink-700 dark:text-pink-400');

  // Add dark variant for hover:bg-red-50
  content = content.replace(/hover:bg-red-50(?! dark:)/g, 'hover:bg-red-50 dark:hover:bg-red-900/20');

  // Add dark variant for hover:bg-blue-50
  content = content.replace(/hover:bg-blue-50(?! dark:)/g, 'hover:bg-blue-50 dark:hover:bg-blue-900/20');

  // Add dark variant for bg-green-50
  content = content.replace(/bg-green-50(?! dark:|\/)/g, 'bg-green-50 dark:bg-green-900/20');

  // Add dark variant for bg-orange-50
  content = content.replace(/bg-orange-50(?! dark:|\/)/g, 'bg-orange-50 dark:bg-orange-900/20');

  // Add dark variant for bg-red-50
  content = content.replace(/bg-red-50(?! dark:|\/)/g, 'bg-red-50 dark:bg-red-900/20');

  // Add dark variant for bg-amber-50
  content = content.replace(/bg-amber-50(?! dark:|\/)/g, 'bg-amber-50 dark:bg-amber-900/20');

  // Add dark variant for bg-purple-50
  content = content.replace(/bg-purple-50(?! dark:|\/)/g, 'bg-purple-50 dark:bg-purple-900/20');

  // Add dark variant for bg-blue-50
  content = content.replace(/bg-blue-50(?! dark:|\/)/g, 'bg-blue-50 dark:bg-blue-900/20');

  // Add dark variant for bg-yellow-50
  content = content.replace(/bg-yellow-50(?! dark:|\/)/g, 'bg-yellow-50 dark:bg-yellow-900/20');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
    changedFiles.push(file);
  }
}

console.log('Total files updated: ' + totalChanges);
changedFiles.forEach(f => console.log('  ' + f));
