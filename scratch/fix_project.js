const fs = require('fs');
const path = require('path');

function fixEncodingAndRemoveChecks(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it looks corrupted (contains âœ“)
    if (content.includes('âœ“') || content.includes('à¶')) {
        try {
            // Re-encode: UTF-8 string -> Latin-1 bytes -> UTF-8 string
            const buf = Buffer.from(content, 'latin1');
            content = buf.toString('utf8');
            console.log(`Fixed encoding for ${filePath}`);
        } catch (e) {
            console.error(`Error fixing encoding for ${filePath}: ${e.message}`);
        }
    }

    // Remove checkmarks
    let original = content;
    content = content.replace(/<i style="color:#27ae60">✓<\/i>/g, '');
    content = content.replace(/<i style="color:var\(--purple-primary\);margin-right:10px">✓<\/i>/g, '');
    content = content.replace(/<i>✓<\/i>/g, '');
    content = content.replace(/✓ /g, '');
    content = content.replace(/✓/g, '');
    content = content.replace(/content:\s*['"]✓['"];/g, "content: '';");
    
    // Also remove the garbled versions if any remained
    content = content.replace(/âœ“ /g, '');
    content = content.replace(/âœ“/g, '');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned checkmarks in ${filePath}`);
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
    'src/pages/signup-choice.html',
    'src/pages/features.html'
];

files.forEach(f => {
    const fullPath = path.join('c:\\xampp\\htdocs\\pcos-hub', f);
    fixEncodingAndRemoveChecks(fullPath);
});
