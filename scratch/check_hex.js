const fs = require('fs');

function checkHex(filePath, lineNum) {
    if (!fs.existsSync(filePath)) {
        console.log("File not found: " + filePath);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const line = lines[lineNum - 1];
    console.log(`Line ${lineNum}: ${line}`);
    if (!line) return;
    const buffer = Buffer.from(line, 'utf8');
    console.log(`Hex: ${buffer.toString('hex')}`);
}

checkHex('assets/js/utils.js', 112);
checkHex('src/pages/blog.html', 152);
