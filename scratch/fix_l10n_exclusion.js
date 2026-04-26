
const fs = require('fs');
const path = 'assets/js/utils.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Add exclusion logic to L10n.apply
    const oldLine = "document.querySelectorAll('[data-i18n]').forEach(el => {";
    const newLine = oldLine + "\n      // Keep navbar, footer, and mobile drawer in English as per user request\n      if (el.closest('.navbar') || el.closest('.footer') || el.closest('.nav-mobile-drawer')) return;";

    if (content.includes(oldLine)) {
        content = content.replace(oldLine, newLine);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Exclusion logic added to L10n.apply successfully.");
    } else {
        console.error("Target line not found in utils.js");
        process.exit(1);
    }
} catch (err) {
    console.error(err);
    process.exit(1);
}
