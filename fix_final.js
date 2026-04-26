const fs = require('fs');

const emojiMap = {
    'â˜€ï¸ ': '☀️',
    'ðŸ Ž': '🍎',
    'ðŸ “': '🍓',
    'ðŸ ƒ': '🏃',
    'ðŸ Š': '🏊',
    'ðŸ˜´': '😴',
    'ðŸ’§': '💧',
    'ðŸŒ±': '🌱',
    'ðŸ“…': '📅',
    'ðŸ•“': '🕒',
    'ðŸ“¤': '📤',
    'ðŸ ¥': '🏥',
    'ðŸ’¾': '💾',
    'ðŸ“‹': '📋',
    'ðŸ” ': '🔍',
    'ðŸ¥—': '🥗',
    'ðŸŒ…': '🌅',
    'ðŸ¥©': '🥩',
    'ðŸ¥¦': '🥦',
    'ðŸŒ¾': '🌾',
    'ðŸ¥›': '🥛',
    'ðŸ¥‘': '🥑',
    'ðŸ’ª': '💪',
    'ðŸ§˜': '🧘',
    'ðŸš¶': '🚶',
    'ðŸ¤¸': '🤸',
    'ðŸŸ¢': '🟢',
    'ðŸŸ¡': '🟡',
    'ðŸ”´': '🔴',
    'ðŸ˜Ÿ': '😟',
    'ðŸ˜ ': '😐',
    'ðŸ™‚': '🙂',
    'ðŸ˜„': '😄',
    'ðŸŒ™': '🌙',
    'â€”': '—',
    'â†’': '→',
    'âŸ³': '⏳',
    'â€¦': '…',
    'â€™': "'",
    'â€œ': '“',
    'â€ ': '”',
    'Â·': '·',
    'âœ“': '',
    '✓': ''
};

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    let changed = false;
    for (const [key, val] of Object.entries(emojiMap)) {
        if (content.includes(key)) {
            content = content.split(key).join(val);
            changed = true;
        }
    }
    
    if (path.endsWith('utils.js')) {
        if (content.includes('sleep_history: "📋 Exercise History"')) {
            content = content.replace('sleep_history: "📋 Exercise History"', 'sleep_history: "Sleep History"');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(path, content, 'utf8');
        console.log("Fixed: " + path);
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

files.forEach(f => {
    if (fs.existsSync(f)) fixFile(f);
});
