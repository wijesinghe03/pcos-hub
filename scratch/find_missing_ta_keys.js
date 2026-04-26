
const fs = require('fs');
const content = fs.readFileSync('assets/js/utils.js', 'utf8');

// Find positions of si: { and ta: {
const siStart = content.indexOf('    si: {');
const taStart = content.indexOf('    ta: {');
const setStart = content.indexOf('  set(lang)');

if (siStart === -1 || taStart === -1 || setStart === -1) {
  console.error('Could not find blocks. siStart:', siStart, 'taStart:', taStart, 'setStart:', setStart);
  process.exit(1);
}

const siBlock = content.substring(siStart, taStart);
const taBlock = content.substring(taStart, setStart);

// Extract keys from a block
function extractKeys(block) {
  const keys = [];
  // Match lines like:      keyName: "value"
  const regex = /^\s{6,8}([a-zA-Z_][a-zA-Z0-9_]*):/gm;
  let m;
  while ((m = regex.exec(block)) !== null) {
    keys.push(m[1]);
  }
  return [...new Set(keys)];
}

const siKeys = extractKeys(siBlock);
const taKeys = extractKeys(taBlock);

const missingFromTa = siKeys.filter(k => !taKeys.includes(k));
const missingFromSi = taKeys.filter(k => !siKeys.includes(k));

console.log(`SI keys: ${siKeys.length}, TA keys: ${taKeys.length}`);
console.log(`\nKeys in SI but MISSING from TA (${missingFromTa.length}):`);
missingFromTa.forEach(k => console.log(`  ${k}`));

if (missingFromSi.length > 0) {
  console.log(`\nKeys in TA but MISSING from SI (${missingFromSi.length}):`);
  missingFromSi.forEach(k => console.log(`  ${k}`));
}
