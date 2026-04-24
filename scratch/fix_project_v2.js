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
                // Keep as is or handle error? If it's not in CP1252 and > 255, it might be already fixed or something else.
                // But for mojibake recovery, we assume it was a byte.
                // If it's something like \u2013 (en-dash), it's 0x96 in CP1252.
                // Most common ones are in the map above.
                // If not found, we just push the lower byte? No, let's keep it as UTF-8 sequence for now if it's high.
                // Actually, if we are here, it means the character was ALREADY interpreted as UTF-8.
                // If it's a "real" high character that wasn't mojibake, this might break it.
                // But we check for mojibake signs before running this.
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
    
    // Check if it looks corrupted
    if (content.includes('âœ“') || content.includes('à¶') || content.includes('à®')) {
        console.log(`Fixing encoding for ${filePath}...`);
        content = fixMojibake(content);
    }

    // Now remove checkmarks
    // After fixing, they should be literal ✓
    let beforeRemove = content;
    content = content.replace(/✓ /g, '');
    content = content.replace(/✓/g, '');
    
    // Also remove garbled versions just in case fixMojibake didn't catch them or they were literal in the file
    content = content.replace(/âœ“ /g, '');
    content = content.replace(/âœ“/g, '');

    // Cleanup HTML/JS icons
    content = content.replace(/<i style="color:#27ae60">✓<\/i>/g, '');
    content = content.replace(/<i style="color:var\(--purple-primary\);margin-right:10px">✓<\/i>/g, '');
    content = content.replace(/<i>✓<\/i>/g, '');
    content = content.replace(/content:\s*['"]✓['"];/g, "content: '';");

    if (beforeRemove !== content || true) { // Always write if we fixed encoding
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const files = [
    'assets/js/utils.js',
    'assets/js/components.js',
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
