// ============================================================
// PCOS CARE HUB — Component Injector (components.js)
// ============================================================

function renderNavbar(activePage = '') {
  const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  let dashboardUrl = 'patient-dashboard.html';
  if (user) {
    const role = (user.role || '').toLowerCase();
    if (role.includes('admin')) dashboardUrl = '../../admin/dashboard.html';
    else if (role.includes('hospital')) dashboardUrl = 'hospital-dashboard.html';
  }

  return `
  <div id="page-loader" class="page-loader"><div class="loader-ring"></div></div>
  <nav class="navbar" id="mainNav">
    <div class="container">
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-icon">${typeof Icons !== 'undefined' ? Icons.get('heart', 20) : '♥'}</div>
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
          ${typeof Theme !== 'undefined' ? Theme.getIcon() : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'}
        </button>
        ${(user && user.loggedIn) ? 
          `<button class="nav-btn-cta" onclick="window.location.href='${dashboardUrl}'" data-i18n="view_in_dashboard">View Dashboard</button>` : 
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
          ${typeof Theme !== 'undefined' ? Theme.getIcon() : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'}
        </button>
      </div>
      ${(user && user.loggedIn) ? 
        `<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="window.location.href='${dashboardUrl}'" data-i18n="view_in_dashboard">View Dashboard</button>` : 
        `<button class="btn btn-outline" style="width:100%;justify-content:center" onclick="window.location.href='login.html'" data-i18n="nav_login">Log In</button>
         <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="window.location.href='signup-choice.html'" data-i18n="nav_signup">Get Connected</button>`
      }
    </div>
  </div>
  <button class="scroll-to-top" id="scrollToTop" title="Scroll to top" aria-label="Scroll to top">↑</button>`;
}

/**
 * Renders the standardized Hospital Dashboard Sidebar
 * @param {string} activePage - The ID of the active sidebar item
 * @returns {string} - HTML string for the sidebar
 */
function renderHospitalSidebar(activePage = 'dashboard') {
  return `
    <a href="index.html" class="sidebar-logo">
      <div class="sidebar-logo-icon">♥</div>
      <div class="sidebar-logo-text"><span>PCOS</span> Care Hub</div>
    </a>
    <a href="hospital-profile.html" class="sidebar-profile" title="View Profile">
      <div class="sidebar-avatar" id="sidebarAvatar" style="background:linear-gradient(135deg,#3498db,#2980b9)">CH</div>
      <div>
        <div class="sidebar-name" id="sidebarName">City Hospital</div>
        <div class="sidebar-role">Hospital Staff</div>
      </div>
      <i>›</i>
    </a>
    <div class="sidebar-section">
      <span class="sidebar-section-label">Main</span>
      <a class="sidebar-item ${activePage === 'dashboard' ? 'active' : ''}" href="hospital-dashboard.html"><i>🏠</i> Dashboard</a>
      <a class="sidebar-item ${activePage === 'search' ? 'active' : ''}" href="search-patients.html"><i>🔎</i> Search Patients</a>
      <a class="sidebar-item ${activePage === 'doctors' ? 'active' : ''}" href="manage-doctors.html"><i>👩‍⚕️</i> Manage Doctors</a>
      <a class="sidebar-item ${activePage === 'lab-results' ? 'active' : ''}" href="hospital-lab-results.html"><i>🔬</i> Lab Results <span class="sidebar-badge">8</span></a>
      <a class="sidebar-item ${activePage === 'consultations' ? 'active' : ''}" href="hospital-consultations.html"><i>💬</i> Consultations <span class="sidebar-badge">3</span></a>
    </div>
    <div class="sidebar-section">
      <span class="sidebar-section-label">Management</span>
      <a class="sidebar-item ${activePage === 'all-patients' ? 'active' : ''}" href="search-patients.html"><i>👥</i> All Patients</a>
      <a class="sidebar-item ${activePage === 'appointments' ? 'active' : ''}" href="hospital-appointments.html"><i>🗓️</i> Appointments</a>
    </div>
    
    <div class="sidebar-section" style="padding-top:4px">
      <span class="sidebar-section-label">Hospital Account</span>
    </div>
    <div class="sidebar-hospital-account">
      <div class="sha-badge dot" id="shaStatusBadge">Verified</div>
      <div class="sha-hospital-name" id="shaHospitalName">City Hospital</div>
      <div class="sha-hospital-type" id="shaHospitalType">🏥 General Hospital</div>

      <div class="sha-info-row">
        <i>📍</i><span id="shaLocation">Colombo, Sri Lanka</span>
      </div>
      <div class="sha-info-row">
        <i>📞</i><span id="shaPhone">+94 11 234 5678</span>
      </div>
      <div class="sha-info-row">
        <i>✉️</i><span id="shaEmail">info@cityhospital.lk</span>
      </div>
      <div class="sha-info-row">
        <i>🪪</i><span id="shaRegNo">Reg: MOH-LK-2019-0042</span>
      </div>

      <hr class="sha-divider">

      <div class="sha-actions">
        <a href="hospital-profile.html" class="sha-action-btn outline">🏥 Profile</a>
        <a href="hospital-settings.html" class="sha-action-btn outline">⚙️ Settings</a>
      </div>

      <a href="hospital-signout.html" class="sha-logout">🚪 Sign Out</a>
    </div>
  `;
}

/**
 * Populates the hospital sidebar with real data
 * @param {Object} h - Hospital data object
 */
function populateHospitalSidebar(h) {
  if (!h) return;
  const name = h.hosp_name || h.name || 'Hospital';
  const type = h.hospital_type || '';
  const loc = h.location || h.address || '';
  const phone = h.phone || '';
  const email = h.email || '';
  const reg = h.reg_number || '';
  const verified = h.is_verified == 1;

  const initials = name.split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
  const avatarEl = document.getElementById('sidebarAvatar');
  if (avatarEl) avatarEl.textContent = initials;

  const nameEl = document.getElementById('sidebarName');
  if (nameEl) nameEl.textContent = name;

  const shaBadge = document.getElementById('shaStatusBadge');
  if (shaBadge) {
    shaBadge.textContent = verified ? 'Verified' : 'Pending';
    shaBadge.className = verified ? 'sha-badge dot' : 'sha-badge';
    shaBadge.style.background = verified ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)';
    shaBadge.style.color = verified ? '#2ecc71' : '#d35400';
    shaBadge.style.borderColor = verified ? 'rgba(46, 204, 113, 0.25)' : 'rgba(243, 156, 18, 0.25)';
  }

  const shaName = document.getElementById('shaHospitalName');
  if (shaName) shaName.textContent = name;

  const shaType = document.getElementById('shaHospitalType');
  if (shaType) {
    const labels = {
      government: '🏥 Government Hospital',
      private: '🏥 Private Hospital',
      clinic: '🏥 Clinic',
      diagnostic: '🔬 Diagnostic Center'
    };
    shaType.textContent = labels[type] || ('🏥 ' + (type.charAt(0).toUpperCase() + type.slice(1) || 'Healthcare Institution'));
  }

  const shaLoc = document.getElementById('shaLocation');
  if (shaLoc && loc) shaLoc.textContent = loc;

  const shaPhone = document.getElementById('shaPhone');
  if (shaPhone && phone) shaPhone.textContent = phone;

  const shaEmail = document.getElementById('shaEmail');
  if (shaEmail && email) shaEmail.textContent = email;

  const shaReg = document.getElementById('shaRegNo');
  if (shaReg && reg) shaReg.textContent = 'Reg: ' + reg;
}


function renderChatbot() {
  return `
  <div class="chatbot-container">
    <button class="chatbot-toggle" id="chatbotToggle" title="PCOS AI Assistant">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
    <div class="chatbot-window" id="chatbotWindow">
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-header-icon">✨</div>
          <div class="chatbot-header-text">
            <h3 data-i18n="chatbot_title">PCOS AI Guide</h3>
            <p data-i18n="chatbot_subtitle">Always here to help</p>
          </div>
        </div>
        <button class="chatbot-close" id="chatbotClose">&times;</button>
      </div>
      <div class="chatbot-messages" id="chatbotMessages">
        <div class="chat-msg bot" data-i18n="chatbot_welcome">
          Hello! I'm your PCOS Hub assistant. How can I help you today?
        </div>
      </div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Ask about PCOS or website..." data-i18n-placeholder="chatbot_placeholder">
        <button class="chatbot-send" id="chatbotSend">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>`;
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
              <div class="footer-logo-icon">${typeof Icons !== 'undefined' ? Icons.get('heart', 20) : '♥'}</div>
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
      
      // Ensure api.js is loaded
      ensureAPI(() => {
        // Init Chatbot
        const chatbotDiv = document.createElement('div');
        chatbotDiv.innerHTML = renderChatbot();
        document.body.appendChild(chatbotDiv);
        initChatbot();
      });

      // Ensure loader is hidden after all components are ready
      if (typeof PageLoader !== 'undefined') PageLoader.hide();
      // Re-apply localization AFTER all components are in the DOM
      if (typeof L10n !== 'undefined') L10n.init();
    }, 0);
  }

  // Hospital Sidebar Injection
  const sidePlaceholder = document.getElementById('sidebar-placeholder');
  if (sidePlaceholder) {
    const active = sidePlaceholder.dataset.active || 'dashboard';
    sidePlaceholder.outerHTML = `<aside class="sidebar" id="sidebar">${renderHospitalSidebar(active)}</aside>`;
    
    // Early population from cache
    try {
      const stored = JSON.parse(localStorage.getItem('hospitalUser') || localStorage.getItem('currentUser') || 'null');
      if (stored && (stored.role === 'hospital' || stored.hosp_name)) {
        setTimeout(() => populateHospitalSidebar(stored), 0);
      }
    } catch (e) {}
  }
});

function initChatbot() {
  const toggle = document.getElementById('chatbotToggle');
  const window = document.getElementById('chatbotWindow');
  const close = document.getElementById('chatbotClose');
  const input = document.getElementById('chatbotInput');
  const send = document.getElementById('chatbotSend');
  const messages = document.getElementById('chatbotMessages');

  if (!toggle || !window || !messages) return;

  const toggleChat = () => window.classList.toggle('active');
  toggle.addEventListener('click', toggleChat);
  close.addEventListener('click', toggleChat);

  const addMessage = (text, sender) => {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerText = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  };

  const showTyping = () => {
    const loader = document.createElement('div');
    loader.className = 'typing-indicator';
    loader.id = 'chatbotTyping';
    loader.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messages.appendChild(loader);
    messages.scrollTop = messages.scrollHeight;
  };

  const hideTyping = () => {
    const loader = document.getElementById('chatbotTyping');
    if (loader) loader.remove();
  };

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage(text, 'user');
    showTyping();

    if (typeof API !== 'undefined') {
      try {
        const data = await API.call('chatbot_handler.php', { message: text });
        hideTyping();
        if (data.status === 'success') {
          addMessage(data.reply, 'bot');
        } else {
          addMessage("I'm having trouble connecting. Please try again later.", 'bot');
        }
      } catch (err) {
        hideTyping();
        addMessage("Connection error. Check your internet.", 'bot');
      }
    } else {
      hideTyping();
      addMessage("API service is not available.", 'bot');
    }
  };

  send.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Load history if logged in
  const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
  if (user && user.loggedIn && typeof API !== 'undefined') {
    API.call('get_chat_history.php')
      .then(data => {
        if (data.status === 'success' && data.history && data.history.length > 0) {
          messages.innerHTML = ''; // Clear initial message
          data.history.forEach(chat => {
            addMessage(chat.message, chat.sender);
          });
        }
      })
      .catch(err => console.error("History load error:", err));
  }
}

/**
 * Dynamically load api.js if not present
 */
function ensureAPI(callback) {
  if (typeof API !== 'undefined') {
    callback();
    return;
  }

  // Determine path to assets/js/api.js
  const path = window.location.pathname;
  let basePath = '../../'; // Default for src/pages/
  if (path.includes('/admin/')) basePath = '../';
  else if (path.includes('/index.html') && !path.includes('/src/pages/')) basePath = 'assets/'; // For root index.html

  const script = document.createElement('script');
  script.src = basePath + 'assets/js/api.js';
  script.onload = callback;
  script.onerror = () => {
    console.error("Failed to load api.js dynamically.");
    callback(); // Still try to init, it will show the error message in UI
  };
  document.head.appendChild(script);
}
