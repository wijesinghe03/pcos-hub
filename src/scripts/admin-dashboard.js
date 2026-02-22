// ===================================================
//  PCOS CARE HUB — Admin Dashboard JavaScript
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Page Navigation ──────────────────────────────
  const navItems = document.querySelectorAll('.sidebar-item[data-page]');
  const pages = document.querySelectorAll('.dash-page');

  window.showPage = function(pageId) {
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
  };

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      if (this.dataset.page) showPage(this.dataset.page);
    });
  });

  // ── Growth Chart ─────────────────────────────────
  const growthData = [
    {v:6,l:'Sep'},{v:8,l:'Oct'},{v:10,l:'Nov'},
    {v:11,l:'Dec'},{v:13,l:'Jan'},{v:14,l:'Feb'}
  ];
  const max = Math.max(...growthData.map(d => d.v));
  const chartEl = document.getElementById('growthChart');
  if (chartEl) {
    chartEl.innerHTML = growthData.map(d => `
      <div class="mini-bar-item">
        <div class="mini-bar-fill" style="height:${(d.v/max)*48}px;background:var(--teal);opacity:${0.5+(growthData.indexOf(d)/growthData.length)*0.5};"></div>
        <div class="mini-bar-label">${d.l}</div>
      </div>
    `).join('');
  }

  // ── Table Search Filter ───────────────────────────
  window.filterTable = function(input, tableId) {
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  };

  // ── Progress bar animation ────────────────────────
  setTimeout(() => {
    document.querySelectorAll('.progress-bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = w; }, 100);
    });
  }, 400);

  // ── Toast ─────────────────────────────────────────
  window.showToast = function(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type;
    t.style.display = 'flex';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.display = 'none'; }, 3500);
  };

  // ── Stat card animation ───────────────────────────
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
