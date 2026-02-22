// ===================================================
//  PCOS CARE HUB — Hospital Dashboard JavaScript
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Page Navigation ──────────────────────────────
  const navItems = document.querySelectorAll('.sidebar-item[data-page]');
  const pages = document.querySelectorAll('.dash-page');

  function showPage(pageId) {
    pages.forEach(p => { p.style.display = 'none'; });
    navItems.forEach(n => n.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) {
      target.style.display = 'block';
      target.style.animation = 'none';
      target.offsetHeight;
      target.style.animation = 'fadeInUp 0.35s ease both';
    }
    const activeNav = document.querySelector(`.sidebar-item[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    window.scrollTo({ top: 0 });
  }

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      if (this.dataset.page) showPage(this.dataset.page);
    });
  });

  // ── Table Search Filter ───────────────────────────
  window.filterTable = function(input, tableId) {
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  };

  // ── Toast ─────────────────────────────────────────
  window.showToast = function(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type;
    t.style.display = 'flex';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.display = 'none'; }, 3500);
  };

  // ── Hover effects on table rows ───────────────────
  document.querySelectorAll('tbody tr').forEach(row => {
    row.style.transition = 'background 0.15s';
  });

  // ── Stat card entrance animation ─────────────────
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 150 + i * 80);
  });
});
