// ============================================================
// DASHBOARD JS — dashboard.js
// ============================================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Date display
  const dateEl = document.getElementById('dateDisplay');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // User name from auth
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  if (user) {
    const sn = document.getElementById('sidebarName');
    if (sn) sn.textContent = user.name || 'User';
    const wn = document.getElementById('welcomeName');
    if (wn) wn.textContent = (user.name || 'User').split(' ')[0];
  }

  // Build cycle calendar (February 2026)
  buildCycleCalendar();
});

function buildCycleCalendar() {
  const cal = document.getElementById('cycleCalendar');
  if (!cal) return;

  const year = 2026;
  const month = 1; // February (0-indexed)

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDay.getDay();

  cal.innerHTML = '';

  // Previous month's days
  const prevLastDate = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const div = document.createElement('div');
    div.className = 'cycle-day other-month';
    div.textContent = prevLastDate - i;
    cal.appendChild(div);
  }

  // Current month's days
  const today = new Date();
  const periodDays = [1, 2, 3, 4, 5];
  const fertileDays = [11, 12, 13, 14, 15, 16];
  const ovulationDay = 14;

  for (let d = 1; d <= lastDate; d++) {
    const div = document.createElement('div');
    div.className = 'cycle-day';
    div.textContent = d;

    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      div.classList.add('today');
    } else if (d === ovulationDay) {
      div.classList.add('ovulation');
    } else if (fertileDays.includes(d)) {
      div.classList.add('fertile');
    } else if (periodDays.includes(d)) {
      div.classList.add('period');
    }

    div.title = d === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'Today'
      : d === ovulationDay ? 'Ovulation'
        : fertileDays.includes(d) ? 'Fertile window'
          : periodDays.includes(d) ? 'Period' : '';
    cal.appendChild(div);
  }

  // Next month's days
  const totalCells = cal.children.length;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    const div = document.createElement('div');
    div.className = 'cycle-day other-month';
    div.textContent = i;
    cal.appendChild(div);
  }
}

function showSection(section) {
  const titles = {
    symptoms: 'Track Symptoms',
    cycle: 'Menstrual Cycle',
    reports: 'My Reports',
    lifestyle: 'Lifestyle Log',
    appointments: 'Appointments',
    labresults: 'Lab Results',
  };
  Toast.success(`Navigating to ${titles[section] || section}...`);
  // In a real app, this would show/hide sections or navigate
}
