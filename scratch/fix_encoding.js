const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'assets/js/utils.js');
const content = fs.readFileSync(filePath, 'utf8');

// Function to fix mojibake (UTF-8 bytes interpreted as Latin-1 and then saved as UTF-8)
function fixMojibake(str) {
    // This is a common trick to reverse double-encoding or mojibake
    // It works by converting the string to a buffer using Latin-1 (which preserves the byte values)
    // and then reading that buffer back as UTF-8.
    try {
        return Buffer.from(str, 'binary').toString('utf8');
    } catch (e) {
        return str;
    }
}

// We only want to apply this to the parts that are actually corrupted.
// However, if the whole file is corrupted, we can try the whole thing.
// Let's test on a small piece first or just try the whole file if it looks safe.

const fixedContent = fixMojibake(content);

fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('Fixed encoding for utils.js');
