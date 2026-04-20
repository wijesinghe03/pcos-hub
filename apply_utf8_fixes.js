const fs = require('fs');

function replaceFileContent(filePath, replacer) {
    if (!fs.existsSync(filePath)) return;
    const orig = fs.readFileSync(filePath, 'utf8');
    const modified = replacer(orig);
    if (orig !== modified) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. index.html updates
replaceFileContent('src/pages/index.html', (c) => {
    // A. Replace all signup.html links
    c = c.replace(/href="signup\.html"/g, 'href="signup-choice.html"');
    
    // B. Make "Create Account" howit-step a link
    c = c.replace(/<div class="howit-step reveal">([\s\S]*?<div class="step-circle">[\s\S]*?<h4>Create Account<\/h4>)/,
        `<div class="howit-step reveal" onclick="window.location.href='signup-choice.html'" style="cursor:pointer" title="Click to create an account">$1`
    );

    // C. Re-apply data-count to hero-card-1 (Reports)
    c = c.replace(/<div class="hero-card-icon purple">.*?<\/div>\s*<div>\s*<div class="hero-card-num">1,240\+<\/div>/, 
        '<div class="hero-card-icon purple">📋</div>\n              <div>\n                <div class="hero-card-num"><span data-count="8" data-suffix="">0</span></div>');

    // D. Re-apply data-count to hero-card-2 (Patients)
    c = c.replace(/<div class="hero-card-icon pink">.*?<\/div>\s*<div>\s*<div class="hero-card-num">5,000\+<\/div>/, 
        '<div class="hero-card-icon pink">👩</div>\n              <div>\n                <div class="hero-card-num"><span data-count="2" data-suffix="">0</span></div>');

    // E. Re-apply data-count to hero-card-3 (Hospitals)
    c = c.replace(/<div class="hero-card-icon teal">.*?<\/div>\s*<div>\s*<div class="hero-card-num">120\+<\/div>/, 
        '<div class="hero-card-icon teal">🏥</div>\n              <div>\n                <div class="hero-card-num"><span data-count="20" data-suffix="">0</span></div>');

    // F. Re-apply bottom stat Partner Hospitals 120+ -> 20
    c = c.replace(/<div class="stat-icon">🏥<\/div>\s*<div class="stat-num"><span data-count="120" data-suffix="\+">0\+<\/span><\/div>[\s]*<div class="stat-label">Partner Hospitals<\/div>/, 
        '<div class="stat-icon">🏥</div>\n          <div class="stat-num"><span data-count="20" data-suffix="">0</span></div>\n          <div class="stat-label">Partner Hospitals</div>');

    return c;
});

// 2. CSS & Inline styling fixes for public pages
const pages = ['about-us.html', 'features.html', 'pcos-info.html', 'learn-more.html', 'blog.html'];
pages.forEach(p => {
    replaceFileContent('src/pages/' + p, (c) => {
        c = c.replace(/background:\s*var\(--white\)/g, 'background:var(--bg-card)');
        c = c.replace(/<section class="hero-small" style="[^"]+">/, '<section class="hero-small" style="min-height:60vh;position:relative;overflow:hidden;display:flex;align-items:center;padding-top:var(--nav-h)">');
        return c;
    });
});

// 3. Hospitals.html specifics
replaceFileContent('src/pages/hospitals.html', (c) => {
    // Add flexbox to `.hospital-card` and overrides
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

    // Add general darkmode override
    if(c.indexOf('[data-theme="dark"] .hospitals-hero') === -1) {
        c = c.replace(/<\/style>/, `
    [data-theme="dark"] .hospitals-hero {
      background: linear-gradient(135deg, var(--bg-light), var(--bg-card));
    }
  </style>`);
    }

    return c;
});

// 4. PCOS-info specifics
replaceFileContent('src/pages/pcos-info.html', (c) => {
    c = c.replace(/background:\s*var\(--white\);/g, 'background: var(--bg-card);');
    return c;
});

// 5. search-patients Javascript fix
replaceFileContent('src/pages/search-patients.html', (c) => {
    c = c.replace(/style="padding:12px;border:2px solid #d1d5db;background:white;cursor:pointer;border-radius:8px;transition:all 0\.2s"/g, 'style="padding:12px;cursor:pointer;border-radius:8px;"');
    c = c.replace(/onmouseover="this\.style\.borderColor='.*?';this\.style\.background='.*?'"/g, '');
    c = c.replace(/onmouseout="this\.style\.borderColor='.*?';this\.style\.background='.*?'"/g, '');
    return c;
});

console.log('All modifications applied successfully.');
