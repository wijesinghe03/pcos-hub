
const fs = require('fs');
const content = fs.readFileSync('c:/xampp/htdocs/pcos-hub/assets/js/utils.js', 'utf8');
const lines = content.split('\n');

const sinhalaRegex = /[\u0D80-\u0DFF]/;

for (let i = 2620; i < 3815 && i < lines.length; i++) {
    if (sinhalaRegex.test(lines[i])) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    }
}
