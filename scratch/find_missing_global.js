
const fs = require('fs');

const indexHtml = fs.readFileSync('c:/xampp/htdocs/pcos-hub/src/pages/index.html', 'utf8');
const utilsJs = fs.readFileSync('c:/xampp/htdocs/pcos-hub/assets/js/utils.js', 'utf8');

const regex = /data-i18n="([^"]+)"/g;
let match;
const indexKeys = new Set();
while ((match = regex.exec(indexHtml)) !== null) {
    indexKeys.add(match[1]);
}

const missingInUtils = [];
indexKeys.forEach(key => {
    if (!utilsJs.includes(`${key}:`)) {
        missingInUtils.push(key);
    }
});

console.log("Keys used in index.html but missing in utils.js:");
console.log(missingInUtils);
