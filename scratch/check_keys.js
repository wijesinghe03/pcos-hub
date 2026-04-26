
const fs = require('fs');
const path = require('path');

const files = [
    'c:/xampp/htdocs/pcos-hub/src/pages/index.html',
    'c:/xampp/htdocs/pcos-hub/assets/js/components.js'
];

const keys = new Set();
const regex = /data-i18n="([^"]+)"/g;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.add(match[1]);
    }
});

const utilsContent = fs.readFileSync('c:/xampp/htdocs/pcos-hub/assets/js/utils.js', 'utf8');

// Find the Tamil section
const taSectionMatch = utilsContent.match(/ta:\s*\{([\s\S]*?)\n\s*\}/);
if (!taSectionMatch) {
    console.log("Tamil section not found");
    process.exit(1);
}
const taSection = taSectionMatch[1];

const missingKeys = [];
keys.forEach(key => {
    if (!taSection.includes(`${key}:`)) {
        missingKeys.push(key);
    }
});

console.log("Missing Keys in Tamil:");
console.log(missingKeys);
