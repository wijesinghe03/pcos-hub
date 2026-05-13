// ============================================================
// PCOS CARE HUB — Component Injector (components.js)
// ============================================================

function renderNavbar(activePage = '') {
  return `
  <div id="page-loader" class="page-loader"><div class="loader-ring"></div></div>
  <nav class="navbar" id="mainNav">
    <div class="container">
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-icon">♥</div>
        <span><span>PCOS</span> Care Hub</span>
      </a>
      <div class="nav-links">
        <a href="index.html"         class="nav-link ${activePage === 'home' ? 'active' : ''}"      data-page="index.html" data-i18n="nav_home">Home</a>
        <a href="about-us.html"      class="nav-link ${activePage === 'about' ? 'active' : ''}"    data-page="about-us.html" data-i18n="nav_about">About Us</a>
        <a href="features.html"      class="nav-link ${activePage === 'features' ? 'active' : ''}" data-page="features.html" data-i18n="nav_features">Features</a>
        <a href="pcos-info.html"     class="nav-link ${activePage === 'pcos-info' ? 'active' : ''}" data-page="pcos-info.html" data-i18n="nav_pcos_info">PCOS Info</a>
        <a href="hospitals.html"     class="nav-link ${activePage === 'hospitals' ? 'active' : ''}" data-page="hospitals.html" data-i18n="nav_hospitals">Hospitals</a>
        <a href="blog.html"          class="nav-link ${activePage === 'blog' ? 'active' : ''}"      data-page="blog.html" data-i18n="nav_blog">Blog</a>
        <a href="contact.html"       class="nav-link ${activePage === 'contact' ? 'active' : ''}"   data-page="contact.html" data-i18n="nav_contact">Contact</a>
      </div>
      <div class="nav-actions">
        <button id="globalThemeToggle" class="theme-toggle-btn" onclick="Theme.toggle()" title="Toggle Theme">
          ${typeof Theme !== 'undefined' ? Theme.getIcon() : '🌙'}
        </button>
        ${(typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? 
          `<button class="nav-btn-cta" onclick="window.location.href='patient-dashboard.html'" data-i18n="view_in_dashboard">View in Dashboard</button>` : 
          `<button class="nav-btn-login" onclick="window.location.href='login.html'" data-i18n="nav_login">Log In</button>
           <button class="nav-btn-cta"   onclick="window.location.href='signup-choice.html'" data-i18n="nav_signup">Get Connected</button>`
        }
      </div>
      <button class="nav-hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="nav-mobile-drawer" id="mobileDrawer">
    <a href="index.html"       class="nav-link" data-i18n="nav_home">Home</a>
    <a href="about-us.html"    class="nav-link" data-i18n="nav_about">About Us</a>
    <a href="features.html"    class="nav-link" data-i18n="nav_features">Features</a>
    <a href="pcos-info.html"   class="nav-link" data-i18n="nav_pcos_info">PCOS Info</a>
    <a href="hospitals.html"   class="nav-link" data-i18n="nav_hospitals">Hospitals</a>
    <a href="blog.html"        class="nav-link" data-i18n="nav_blog">Blog</a>
    <a href="contact.html"     class="nav-link" data-i18n="nav_contact">Contact</a>
    <div class="nav-actions" style="flex-direction:column;margin-top:16px;gap:10px">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:10px;">
        <span style="font-weight:600; color:var(--text-mid)" data-i18n="nav_appearance">Appearance</span>
        <button id="globalThemeToggleMobile" class="theme-toggle-btn" onclick="Theme.toggle()" title="Toggle Theme">
          ${typeof Theme !== 'undefined' ? Theme.getIcon() : '🌙'}
        </button>
      </div>
      ${(typeof Auth !== 'undefined' && Auth.isLoggedIn()) ? 
        `<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="window.location.href='patient-dashboard.html'" data-i18n="view_in_dashboard">View in Dashboard</button>` : 
        `<button class="btn btn-outline" style="width:100%;justify-content:center" onclick="window.location.href='login.html'" data-i18n="nav_login">Log In</button>
         <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="window.location.href='signup-choice.html'" data-i18n="nav_signup">Get Connected</button>`
      }
    </div>
  </div>
  <button class="scroll-to-top" id="scrollToTop" title="Scroll to top" aria-label="Scroll to top">↑</button>`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">

          <!-- Brand -->
          <div class="footer-brand">
            <a href="index.html" class="footer-logo">
              <div class="footer-logo-icon">♥</div>
              <div class="footer-logo-text"><span>PCOS</span> Care Hub</div>
            </a>
            <p class="footer-tagline" data-i18n="footer_tagline">Sri Lanka's first dedicated digital platform for managing Polycystic Ovary Syndrome — empowering patients and healthcare providers with secure, connected care.</p>
            <div class="footer-social">
              <a class="social-btn" href="#" aria-label="Facebook">f</a>
              <a class="social-btn" href="#" aria-label="Twitter">𝕏</a>
              <a class="social-btn" href="#" aria-label="Instagram">📷</a>
              <a class="social-btn" href="#" aria-label="LinkedIn">in</a>
              <a class="social-btn" href="#" aria-label="YouTube">▶</a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h4 data-i18n="footer_quick_links">Quick Links</h4>
            <ul class="footer-links">
              <li><a href="index.html"      class="footer-link"><i class="arrow">›</i> <span data-i18n="nav_home">Home</span></a></li>
              <li><a href="about-us.html"   class="footer-link"><i class="arrow">›</i> <span data-i18n="nav_about">About Us</span></a></li>
              <li><a href="hospitals.html"  class="footer-link"><i class="arrow">›</i> <span data-i18n="nav_hospitals">Hospitals</span></a></li>
              <li><a href="blog.html"       class="footer-link"><i class="arrow">›</i> <span data-i18n="nav_blog">PCOS Blog</span></a></li>
              <li><a href="login.html"     class="footer-link"><i class="arrow">›</i> <span data-i18n="nav_login">Login</span></a></li>
              <li><a href="signup-choice.html"    class="footer-link"><i class="arrow">›</i> <span data-i18n="nav_signup">Register</span></a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="footer-col">
            <h4 data-i18n="footer_resources">PCOS Resources</h4>
            <ul class="footer-links">
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> <span data-i18n="know_pcos">Understanding PCOS</span></a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> <span data-i18n="symptoms">Symptom Checker</span></a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> <span data-i18n="know_diet">Diet &amp; Nutrition</span></a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> <span data-i18n="know_treatment">Exercise Guide</span></a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> <span data-i18n="know_mental">Mental Wellness</span></a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> <span data-i18n="faqs">FAQs</span></a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="footer-col footer-newsletter">
            <h4 data-i18n="footer_stay_updated">Stay Updated</h4>
            <p data-i18n="footer_newsletter_desc">Get the latest PCOS news, research, and wellness tips delivered to your inbox.</p>
            <form class="newsletter-form" onsubmit="return false">
              <input type="email" id="newsletter-email-input" class="newsletter-input" placeholder="Your email address">
              <button type="submit" class="newsletter-btn" data-i18n="footer_subscribe">Subscribe</button>
            </form>
            <div style="margin-top:14px; display:flex; align-items:center; gap:10px; flex-wrap:wrap">
              <div class="trust-badge" style="display:inline-flex; cursor:default;"><span>✅ No spam, ever</span></div>
              <button onclick="toggleUnsubForm()" style="background:none;border:none;color:rgba(255,255,255,0.45);font-size:0.78rem;cursor:pointer;text-decoration:underline;padding:0;font-family:inherit">Unsubscribe</button>
            </div>
            <div id="footer-unsub-form" style="display:none; margin-top:12px;">
              <form class="newsletter-form" onsubmit="return false">
                <input type="email" id="unsub-email-input" class="newsletter-input" placeholder="Your subscribed email">
                <button type="button" class="newsletter-btn" style="background:linear-gradient(135deg,#ef4444,#dc2626)" onclick="handleUnsubscribe()">Unsubscribe</button>
              </form>
              <p style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-top:8px">Enter the email you subscribed with.</p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="footer-stats reveal">
          <div class="footer-stat">
            <span class="footer-stat-num"><span data-count="2" data-suffix="">0</span></span>
            <span class="footer-stat-label" data-i18n="footer_stat_patients">Patients Registered</span>
          </div>
          <div class="footer-stat">
            <span class="footer-stat-num"><span data-count="20" data-suffix="">0</span></span>
            <span class="footer-stat-label" data-i18n="footer_stat_hospitals">Partner Hospitals</span>
          </div>
          <div class="footer-stat">
            <span class="footer-stat-num"><span data-count="98" data-suffix="%">0%</span></span>
            <span class="footer-stat-label" data-i18n="footer_stat_satisfaction">Patient Satisfaction</span>
          </div>
        </div>
      </div>
    </div>

    <hr class="footer-divider">

    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-inner">
          <p class="footer-copy">© 2025 <a href="index.html">PCOS Care Hub</a>. <span data-i18n="footer_built_with">Built with ♥ for Sri Lankan Women's Health.</span> <span data-i18n="footer_all_rights">All rights reserved.</span></p>
          <div class="footer-trust">
            <a href="security-info.html" class="trust-badge" title="SSL Secured — All data encrypted in transit"><span class="badge-icon">🔒</span> SSL Secured</a>
            <a href="security-info.html" class="trust-badge" title="HIPAA Compliant — Health data protection standards"><span class="badge-icon">⚕️</span> HIPAA Compliant</a>
            <a href="security-info.html" class="trust-badge" title="GDPR Ready — You control your data"><span class="badge-icon">🇪🇺</span> GDPR Ready</a>
            <a href="security-info.html" class="trust-badge" title="256-bit AES encryption for all stored data"><span class="badge-icon">🛡️</span> 256-bit AES</a>
          </div>
          <nav class="footer-legal">
            <a href="privacy-policy.html" data-i18n="footer_privacy">Privacy Policy</a>
            <a href="terms-of-service.html" data-i18n="footer_terms">Terms of Service</a>
            <a href="cookie-policy.html" data-i18n="footer_cookie">Cookie Policy</a>
            <a href="security-info.html">Security</a>
            <a href="contact.html" data-i18n="footer_contact">Contact</a>
          </nav>
        </div>
      </div>
    </div>
  </footer>`;
}

// Inject navbar into element with id="navbar-placeholder"
document.addEventListener('DOMContentLoaded', () => {
  const navPlaceholder = document.getElementById('navbar-placeholder');
  if (navPlaceholder) {
    const page = navPlaceholder.dataset.page || '';
    navPlaceholder.outerHTML = renderNavbar(page);
    
    // Re-init navbar after injection
    setTimeout(() => {
      if (typeof initNavbar === 'function') initNavbar();
      if (typeof setActiveNav === 'function') setActiveNav();
    }, 0);
  }

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = renderFooter();
    
    // Re-run newsletter init
    setTimeout(() => {
      if (typeof initNewsletter === 'function') initNewsletter();
      if (typeof initReveal === 'function') initReveal();
      if (typeof initCountUps === 'function') initCountUps();
      // Ensure loader is hidden after all components are ready
      if (typeof PageLoader !== 'undefined') PageLoader.hide();
      // Re-apply localization AFTER all components are in the DOM
      // This guarantees every page (including contact) is translated correctly
      if (typeof L10n !== 'undefined') L10n.init();
    }, 0);
  }
});
