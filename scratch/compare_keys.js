
const fs = require('fs');
const content = fs.readFileSync('c:/xampp/htdocs/pcos-hub/assets/js/utils.js', 'utf8');

function getKeys(lang) {
    const regex = new RegExp(`${lang}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm');
    const match = regex.exec(content);
    if (!match) return [];
    const section = match[1];
    const keyRegex = /^\s*([a-zA-Z0-9_'"]+):/gm;
    let keys = [];
    let kMatch;
    while ((kMatch = keyRegex.exec(section)) !== null) {
        keys.push(kMatch[1].replace(/['"]/g, ''));
    }
    return keys;
}

const enKeys = getKeys('en');
const taKeys = getKeys('ta');

const missingInTa = enKeys.filter(k => !taKeys.includes(k));

console.log("Missing in Tamil:");
console.log(JSON.stringify(missingInTa, null, 2));
