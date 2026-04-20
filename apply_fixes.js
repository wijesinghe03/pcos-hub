const fs = require('fs');

// Helper
function editFile(filePath, editorFunc) {
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = editorFunc(content);
    if(content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log('Fixed ' + filePath);
    }
}

// 1. Fix hospital counting spans in index.html
editFile('src/pages/index.html', (c) => {
    // Reports Uploaded
    c = c.replace(/<div class="hero-card-icon purple">.*?<\/div>\s*<div>\s*<div class="hero-card-num">1,240\+<\/div>/, '<div class="hero-card-icon purple">📋</div>\n              <div>\n                <div class="hero-card-num"><span data-count="8" data-suffix="">0</span></div>');
    
    // Patients Supported 
    c = c.replace(/<div class="hero-card-icon pink">.*?<\/div>\s*<div>\s*<div class="hero-card-num">5,000\+<\/div>/, '<div class="hero-card-icon pink">👩</div>\n              <div>\n                <div class="hero-card-num"><span data-count="2" data-suffix="">0</span></div>');

    // Partner Hospitals
    c = c.replace(/<div class="hero-card-icon teal">.*?<\/div>\s*<div>\s*<div class="hero-card-num">120\+<\/div>/, '<div class="hero-card-icon teal">🏥</div>\n              <div>\n                <div class="hero-card-num"><span data-count="20" data-suffix="">0</span></div>');

    // Bottom Stats block Partner Hospitals
    c = c.replace(/<div class="stat-icon">🏥<\/div>\s*<div class="stat-num"><span data-count="120" data-suffix="\+">0\+<\/span><\/div>[\s]*<div class="stat-label">Partner Hospitals<\/div>/, '<div class="stat-icon">🏥</div>\n          <div class="stat-num"><span data-count="20" data-suffix="">0</span></div>\n          <div class="stat-label">Partner Hospitals</div>');

    return c;
});

// 2. Fix variable whites in all html files & scrub hero gradients
const pages = ['about-us.html', 'features.html', 'pcos-info.html', 'hospitals.html', 'learn-more.html', 'blog.html'];
pages.forEach(p => {
    editFile('src/pages/' + p, (c) => {
        c = c.replace(/background:\s*var\(--white\)/g, 'background:var(--bg-card)');
        c = c.replace(/<section class="hero-small" style="[^"]+">/, '<section class="hero-small" style="min-height:60vh;position:relative;overflow:hidden;display:flex;align-items:center;padding-top:var(--nav-h)">');
        return c;
    });
});

// 3. Fix pcos-info.html CSS rules
editFile('src/pages/pcos-info.html', (c) => {
    c = c.replace(/background:\s*var\(--white\);/g, 'background: var(--bg-card);');
    return c;
});

// 4. Fix search-patients.html inline hover
editFile('src/pages/search-patients.html', (c) => {
    c = c.replace(/style="padding:12px;border:2px solid #d1d5db;background:white;cursor:pointer;border-radius:8px;transition:all 0\.2s"/g, 'style="padding:12px;cursor:pointer;border-radius:8px;"');
    c = c.replace(/onmouseover="this\.style\.borderColor='.*?';this\.style\.background='.*?'"/g, '');
    c = c.replace(/onmouseout="this\.style\.borderColor='.*?';this\.style\.background='.*?'"/g, '');
    return c;
});

// 5. Fix hospitals.html CSS logic overrides
editFile('src/pages/hospitals.html', (c) => {
    if(c.indexOf('.hospital-card {') !== -1) {
        c = c.replace(/\.hospital-card\s*\{.*?(?=\.hospital-card:hover)/s, 
`.hospital-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 28px;
      border: 1.5px solid var(--border);
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .hospital-card p {
      flex-grow: 1;
    }

    `);
    }

    if(c.indexOf('[data-theme="dark"] .hospitals-hero') === -1) {
        c = c.replace(/<\/style>/, `
    [data-theme="dark"] .hospitals-hero {
      background: linear-gradient(135deg, var(--bg-light), var(--bg-card));
    }
  </style>`);
    }

    return c;
});
