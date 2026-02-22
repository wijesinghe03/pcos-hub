// ===================================================
//  PCOS CARE HUB — Patient Dashboard JavaScript
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
      target.offsetHeight; // reflow
      target.style.animation = 'fadeInUp 0.35s ease both';
    }
    const activeNav = document.querySelector(`.sidebar-item[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      showPage(this.dataset.page);
    });
  });

  // ── Severity Slider ──────────────────────────────
  const slider = document.getElementById('severitySlider');
  const sevVal = document.getElementById('severityVal');
  if (slider) {
    slider.addEventListener('input', () => {
      sevVal.textContent = slider.value;
      const pct = ((slider.value - 1) / 4) * 100;
      slider.style.background = `linear-gradient(to right, var(--primary) ${pct}%, var(--border) ${pct}%)`;
    });
  }

  // ── Symptom Tag Toggles ──────────────────────────
  document.querySelectorAll('.symptom-tag-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('selected');
    });
  });

  // ── Mini Calendar Builder ─────────────────────────
  function buildMiniCal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const period = [1, 2, 3, 4, 5];
    const fertile = [11, 12, 13, 14, 15, 16];
    const ovulation = [14];
    const today = 22;
    const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let html = '<div class="cycle-legend">';
    html += '<div class="legend-item"><div class="legend-dot" style="background:#E91E8C"></div>Period</div>';
    html += '<div class="legend-item"><div class="legend-dot" style="background:#CE93D8"></div>Fertile</div>';
    html += '<div class="legend-item"><div class="legend-dot" style="background:#7B1FA2"></div>Ovulation</div>';
    html += '<div class="legend-item"><div class="legend-dot" style="background:#2D1B2E"></div>Today</div>';
    html += '</div>';
    html += '<div class="cal-grid">';
    days.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
    for (let d = 1; d <= 28; d++) {
      let cls = 'normal';
      let extra = '';
      if (ovulation.includes(d)) { cls = 'ovulation'; extra = '<span class="ov-dot">OV</span>'; }
      else if (period.includes(d))  cls = 'period';
      else if (fertile.includes(d)) cls = 'fertile';
      else if (d === today)         cls = 'today';
      html += `<div class="cal-day ${cls}" title="Feb ${d}">${d}${extra}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
  }
  buildMiniCal('miniCalendar');
  buildMiniCal('fullCalendar');

  // ── Activity Chart ────────────────────────────────
  const chartData = [
    {v:25,l:'Mon'},{v:45,l:'Tue'},{v:20,l:'Wed'},
    {v:35,l:'Thu'},{v:50,l:'Fri'},{v:0,l:'Sat'},{v:0,l:'Sun (today)'}
  ];
  const max = Math.max(...chartData.map(d => d.v)) || 1;
  const chartEl = document.getElementById('activityChart');
  if (chartEl) {
    chartEl.innerHTML = chartData.map(d => `
      <div class="mini-bar-item">
        <div class="mini-bar-fill" style="height:${(d.v/max)*48}px;background:${d.v>0?'var(--primary)':'var(--border)'};opacity:${0.6+(chartData.indexOf(d)/chartData.length)*0.4};"></div>
        <div class="mini-bar-label">${d.l.substring(0,3)}</div>
      </div>
    `).join('');
  }

  // ── Chat Bot ──────────────────────────────────────
  const botResponses = {
    'exercise': 'For PCOS, the best exercises are: 🏃 Moderate aerobic activity (walking, swimming, cycling) for 150 min/week, 💪 Strength training 2–3x/week to build lean muscle and improve insulin sensitivity, and 🧘 Yoga to reduce cortisol and androgen levels. Start slowly and build up gradually!',
    'natural': 'Natural PCOS management includes: ✅ Low-GI diet, ✅ Regular exercise (150 min/week), ✅ Stress reduction (yoga, meditation), ✅ Adequate sleep (7–9 hours), ✅ Supplements like inositol, vitamin D, and omega-3. Always combine with medical supervision.',
    'irregular': 'Irregular periods in PCOS occur because elevated insulin stimulates the ovaries to produce excess androgens (male hormones), disrupting the normal menstrual cycle. Ovulation becomes infrequent or absent. Low-GI diet and exercise can restore cycle regularity.',
    'cured': 'PCOS cannot be permanently "cured," but it can be effectively managed. Many women achieve complete symptom remission through lifestyle changes (diet + exercise). Symptoms often reduce significantly after maintaining a healthy weight. Think of it as a condition you manage rather than a disease you cure.',
    'supplements': 'Evidence-based supplements for PCOS: 💊 Inositol (myo & d-chiro) — improves insulin sensitivity, 💊 Vitamin D (many PCOS patients are deficient), 💊 Omega-3 — reduces inflammation, 💊 Magnesium — improves insulin resistance, 💊 Zinc — helps with acne and hair loss. Always check with your doctor first!',
    'default': 'Thank you for your question! Based on current PCOS research, I recommend discussing this with Dr. K. Silva at your appointment on Wednesday. In the meantime, I\'ve noted this in your health log. Is there anything specific about PCOS management I can help clarify? 💜'
  };

  window.sendChat = function() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    appendMsg(text, 'user');
    input.value = '';
    setTimeout(() => {
      const lower = text.toLowerCase();
      let response = botResponses.default;
      if (lower.includes('exercise') || lower.includes('workout')) response = botResponses.exercise;
      else if (lower.includes('natural') || lower.includes('lifestyle')) response = botResponses.natural;
      else if (lower.includes('irregular') || lower.includes('period')) response = botResponses.irregular;
      else if (lower.includes('cured') || lower.includes('cure')) response = botResponses.cured;
      else if (lower.includes('supplement') || lower.includes('vitamin')) response = botResponses.supplements;
      appendMsg(response, 'bot');
    }, 700);
  };

  window.askQuick = function(text) {
    document.getElementById('chatInput').value = text;
    sendChat();
  };

  function appendMsg(text, from) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + from;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Save Log ──────────────────────────────────────
  window.saveLog = function() {
    const selected = [...document.querySelectorAll('#quickSymptoms .selected')].map(b => b.dataset.sym || b.textContent.trim());
    if (selected.length === 0) { showToast('Please select at least one symptom','warning'); return; }
    showToast(`Logged: ${selected.join(', ')} ✓`, 'success');
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

  // ── Progress bar animate ──────────────────────────
  setTimeout(() => {
    document.querySelectorAll('.progress-bar-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = w; }, 100);
    });
  }, 300);
});
