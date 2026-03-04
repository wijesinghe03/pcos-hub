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
        <a href="index.html"         class="nav-link ${activePage === 'home' ? 'active' : ''}"      data-page="index.html">Home</a>
        <a href="about-us.html"      class="nav-link ${activePage === 'about' ? 'active' : ''}"    data-page="about-us.html">About Us</a>
        <a href="features.html"      class="nav-link ${activePage === 'features' ? 'active' : ''}" data-page="features.html">Features</a>
        <a href="pcos-info.html"     class="nav-link ${activePage === 'pcos-info' ? 'active' : ''}" data-page="pcos-info.html">PCOS Info</a>
        <a href="hospitals.html"     class="nav-link ${activePage === 'hospitals' ? 'active' : ''}" data-page="hospitals.html">Hospitals</a>
        <a href="blog.html"          class="nav-link ${activePage === 'blog' ? 'active' : ''}"      data-page="blog.html">Blog</a>
      </div>
      <div class="nav-actions">
        <button class="nav-btn-login" onclick="window.location.href='login.html'">Log In</button>
        <button class="nav-btn-cta"   onclick="window.location.href='signup.html'">Get Connected</button>
      </div>
      <button class="nav-hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="nav-mobile-drawer" id="mobileDrawer">
    <a href="index.html"       class="nav-link">Home</a>
    <a href="about-us.html"    class="nav-link">About Us</a>
    <a href="features.html"    class="nav-link">Features</a>
    <a href="pcos-info.html"   class="nav-link">PCOS Info</a>
    <a href="hospitals.html"   class="nav-link">Hospitals</a>
    <a href="blog.html"        class="nav-link">Blog</a>
    <div class="nav-actions" style="flex-direction:column;margin-top:16px;gap:10px">
      <button class="btn btn-outline" style="width:100%;justify-content:center" onclick="window.location.href='login.html'">Log In</button>
      <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="window.location.href='signup.html'">Get Connected</button>
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
            <p class="footer-tagline">Sri Lanka's first dedicated digital platform for managing Polycystic Ovary Syndrome — empowering patients and healthcare providers with secure, connected care.</p>
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
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="index.html"      class="footer-link"><i class="arrow">›</i> Home</a></li>
              <li><a href="about-us.html"   class="footer-link"><i class="arrow">›</i> About Us</a></li>
              <li><a href="hospitals.html"  class="footer-link"><i class="arrow">›</i> Hospitals</a></li>
              <li><a href="blog.html"       class="footer-link"><i class="arrow">›</i> PCOS Blog</a></li>
              <li><a href="login.html"     class="footer-link"><i class="arrow">›</i> Login</a></li>
              <li><a href="signup.html"    class="footer-link"><i class="arrow">›</i> Register</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="footer-col">
            <h4>PCOS Resources</h4>
            <ul class="footer-links">
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> Understanding PCOS</a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> Symptom Checker</a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> Diet &amp; Nutrition</a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> Exercise Guide</a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> Mental Wellness</a></li>
              <li><a href="blog.html" class="footer-link"><i class="arrow">›</i> FAQs</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="footer-col footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest PCOS news, research, and wellness tips delivered to your inbox.</p>
            <form class="newsletter-form" onsubmit="return false">
              <input type="email" class="newsletter-input" placeholder="Your email address">
              <button type="submit" class="newsletter-btn">Subscribe</button>
            </form>
            <div style="margin-top:16px">
              <div class="trust-badge" style="display:inline-flex;margin-bottom:6px">
                <i style="color:#27ae60">✓</i>
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="footer-stats reveal">
          <div class="footer-stat">
            <span class="footer-stat-num"><span data-count="5000" data-suffix="+">0+</span></span>
            <span class="footer-stat-label">Patients Registered</span>
          </div>
          <div class="footer-stat">
            <span class="footer-stat-num"><span data-count="120" data-suffix="+">0+</span></span>
            <span class="footer-stat-label">Partner Hospitals</span>
          </div>
          <div class="footer-stat">
            <span class="footer-stat-num"><span data-count="98" data-suffix="%">0%</span></span>
            <span class="footer-stat-label">Patient Satisfaction</span>
          </div>
        </div>
      </div>
    </div>

    <hr class="footer-divider">

    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-inner">
          <p class="footer-copy">© 2025 <a href="index.html">PCOS Care Hub</a>. Built with ♥ for Sri Lankan Women's Health. All rights reserved.</p>
          <div class="footer-trust">
            <div class="trust-badge"><i>🔒</i> SSL Secured</div>
            <div class="trust-badge"><i style="color:#27ae60">✓</i> HIPAA Compliant</div>
          </div>
          <nav class="footer-legal">
            <a href="privacy-policy.html">Privacy Policy</a>
            <a href="terms-of-service.html">Terms of Service</a>
            <a href="cookie-policy.html">Cookie Policy</a>
            <a href="contact.html">Contact</a>
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
    }, 0);
  }
});
