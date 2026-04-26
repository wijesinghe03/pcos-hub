const fs = require('fs');
const path = require('path');

const replacements = [
    [/â”€â”€/g, '──'],
    [/âœ•/g, '✖'],
    [/âš /g, '⚠'],
    [/â„¹/g, 'ℹ'],
    [/â˜€ï¸ /g, '☀️'],
    [/ðŸŒ™/g, '🌙'],
    [/â€”/g, '—'],
    [/â†’/g, '→'],
    [/ðŸ” /g, '🔍'],
    [/ðŸ¥—/g, '🥗'],
    [/âž•/g, '➕'],
    [/ðŸŒ…/g, '🌅'],
    [/ðŸ Ž/g, '🍎'],
    [/ðŸ¥©/g, '🥩'],
    [/ðŸ¥¦/g, '🥦'],
    [/ðŸ “/g, '🍓'],
    [/ðŸŒ¾/g, '🌾'],
    [/ðŸ¥›/g, '🥛'],
    [/ðŸ¥‘/g, '🥑'],
    [/ðŸ’¾/g, '💾'],
    [/ðŸ“‹/g, '📋'],
    [/ðŸ ƒ/g, '🏃'],
    [/ðŸ’ª/g, '💪'],
    [/ðŸ§˜/g, '🧘'],
    [/ðŸš¶/g, '🚶'],
    [/ðŸ Š/g, '🏊'],
    [/ðŸ¤¸/g, '🤸'],
    [/ðŸŸ¢/g, '🟢'],
    [/ðŸŸ¡/g, '🟡'],
    [/ðŸ”´/g, '🔴'],
    [/ðŸ’§/g, '💧'],
    [/ðŸ˜´/g, '😴'],
    [/ðŸ˜Ÿ/g, '😟'],
    [/ðŸ˜ /g, '😐'],
    [/ðŸ™‚/g, '🙂'],
    [/ðŸ˜„/g, '😄'],
    [/âŸ³/g, '⏳'],
    [/ðŸŒ±/g, '🌱'],
    [/ðŸ“…/g, '📅'],
    [/ðŸ•“/g, '🕒'],
    [/ðŸ“¤/g, '📤'],
    [/ðŸ ¥/g, '🏥'],
    [/âœŽ/g, '✍️'],
    [/â˜…/g, '★'],
    [/â˜†/g, '☆'],
    [/â™¥/g, '♥'],
    [/â€“/g, '–'],
    [/â€¦/g, '…'],
    [/â€™/g, "'"],
    [/â€œ/g, '“'],
    [/â€ /g, '”'],
    [/Â·/g, '·'],
    [/Â /g, ' '],
    [/âœ“/g, ''],
    [/✓/g, '']
];

// Add more emojis that were missed
const extraReplacements = [
    [/ðŸŽ/g, '🍎'],
    [/ðŸ“/g, '🍓'],
    [/ðŸƒ/g, '🏃'],
    [/ðŸŠ/g, '🏊'],
    [/ðŸ˜/g, '😴'],
    [/ðŸŸ/g, '🟢'], // This might be problematic if other things use ðŸŸ
];

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Attempt to fix common emoji mojibake patterns
    content = content.replace(/ðŸ Ž/g, '🍎');
    content = content.replace(/ðŸ “/g, '🍓');
    content = content.replace(/ðŸ ƒ/g, '🏃');
    content = content.replace(/ðŸ Š/g, '🏊');
    content = content.replace(/ðŸ˜´/g, '😴');
    content = content.replace(/ðŸ“…/g, '📅');
    content = content.replace(/ðŸ•“/g, '🕒');
    content = content.replace(/ðŸ“¤/g, '📤');
    content = content.replace(/ðŸ ¥/g, '🏥');
    content = content.replace(/ðŸ’¾/g, '💾');
    content = content.replace(/ðŸ“‹/g, '📋');
    content = content.replace(/ðŸ’§/g, '💧');
    content = content.replace(/ðŸŒ±/g, '🌱');
    content = content.replace(/ðŸŒ™/g, '🌙');
    content = content.replace(/ðŸ” /g, '🔍');
    content = content.replace(/ðŸ¥—/g, '🥗');
    content = content.replace(/ðŸŒ…/g, '🌅');
    content = content.replace(/ðŸ Ž/g, '🍎');
    content = content.replace(/ðŸ¥©/g, '🥩');
    content = content.replace(/ðŸ¥¦/g, '🥦');
    content = content.replace(/ðŸ “/g, '🍓');
    content = content.replace(/ðŸŒ¾/g, '🌾');
    content = content.replace(/ðŸ¥›/g, '🥛');
    content = content.replace(/ðŸ¥‘/g, '🥑');

    // Specific fix for sleep_history bug in utils.js
    if (filePath.endsWith('utils.js')) {
        content = content.replace(/sleep_history: "Exercise History"/, 'sleep_history: "Sleep History"');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

const filesToFix = [
    'assets/js/utils.js',
    'src/pages/blog.html',
    'src/pages/features.html',
    'src/pages/index.html',
    'src/pages/about-us.html',
    'src/pages/pcos-info.html',
    'src/pages/hospitals.html'
];

filesToFix.forEach(f => fixFile(path.join(__dirname, f)));
console.log('Second pass of encoding and checkmark fixes completed.');
