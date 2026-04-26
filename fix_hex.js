const fs = require('fs');

const patterns = [
    { find: 'c3a2cb9ce282acc3afc2b8c28f', replace: 'e29880efb88f' }, // Sun
    { find: 'c3a2e28094', replace: 'e28094' }, // Em dash
    { find: 'c3a2e28099', replace: '27' }, // Single quote
    { find: 'c3a2e2809c', replace: 'e2809c' }, // Left double quote
    { find: 'c3a2e2809d', replace: 'e2809d' }, // Right double quote
    { find: 'c3a2e28692', replace: 'e28692' }, // Arrow
    { find: 'c3a2c28fc2b1', replace: '23f1efb88f' }, // Stopwatch
    { find: 'c3a2e280a6', replace: 'e280a6' }, // Ellipsis
    { find: 'c3a2c29cc293', replace: '' },     // Checkmark
    { find: 'e29c93', replace: '' }            // Literal Checkmark
];

function fix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let buf = fs.readFileSync(filePath);
    let changed = false;

    for (const p of patterns) {
        let findBuf = Buffer.from(p.find, 'hex');
        let replBuf = Buffer.from(p.replace, 'hex');
        
        let idx = buf.indexOf(findBuf);
        while (idx !== -1) {
            buf = Buffer.concat([
                buf.slice(0, idx),
                replBuf,
                buf.slice(idx + findBuf.length)
            ]);
            changed = true;
            idx = buf.indexOf(findBuf, idx + replBuf.length);
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, buf);
        console.log("Fixed: " + filePath);
    }
}

const files = [
    'assets/js/utils.js',
    'src/pages/blog.html',
    'src/pages/features.html',
    'src/pages/index.html',
    'src/pages/about-us.html',
    'src/pages/pcos-info.html',
    'src/pages/hospitals.html'
];

files.forEach(fix);

// Fix the typo in utils.js separately as it's text-based
const utilsPath = 'assets/js/utils.js';
if (fs.existsSync(utilsPath)) {
    let content = fs.readFileSync(utilsPath, 'utf8');
    if (content.includes('sleep_history: "📋 Exercise History"')) {
        content = content.replace('sleep_history: "📋 Exercise History"', 'sleep_history: "Sleep History"');
        fs.writeFileSync(utilsPath, content, 'utf8');
        console.log("Fixed typo in: " + utilsPath);
    }
}
