const fs = require('fs');
const path = require('path');

const cp1252Map = {
    '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87,
    '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E,
    '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
    '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F
};

function fixMojibake(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (cp1252Map[char] !== undefined) {
            bytes.push(cp1252Map[char]);
        } else {
            const code = char.charCodeAt(0);
            if (code <= 0xFF) {
                bytes.push(code);
            } else {
                const buf = Buffer.from(char, 'utf8');
                for (let j = 0; j < buf.length; j++) bytes.push(buf[j]);
            }
        }
    }
    return Buffer.from(bytes).toString('utf8');
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('âœ“') || content.includes('à¶') || content.includes('à®')) {
        console.log(`Fixing encoding for ${filePath}...`);
        content = fixMojibake(content);
    }

    let beforeRemove = content;
    
    // Removal patterns
    content = content.replace(/<i style="color:#27ae60">✓<\/i>/g, '');
    content = content.replace(/<i style="color:var\(--purple-primary\);margin-right:10px">✓<\/i>/g, '');
    content = content.replace(/<i>✓<\/i>/g, '');
    content = content.replace(/<div class="check-icon">✓<\/div>/g, '');
    content = content.replace(/✓ /g, '');
    content = content.replace(/✓/g, '');
    content = content.replace(/content:\s*['"]✓['"];/g, "content: '';");
    
    content = content.replace(/âœ“ /g, '');
    content = content.replace(/âœ“/g, '');

    if (beforeRemove !== content || true) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const files = [
    'assets/js/utils.js',
    'assets/js/components.js',
    'src/pages/index.html',
    'src/pages/features.html',
    'src/pages/lab-results.html',
    'src/pages/pcos-info.html',
    'src/pages/learn-more.html',
    'src/pages/privacy-policy.html',
    'src/pages/signup-choice.html'
];

files.forEach(f => {
    const fullPath = path.join('c:\\xampp\\htdocs\\pcos-hub', f);
    processFile(fullPath);
});
