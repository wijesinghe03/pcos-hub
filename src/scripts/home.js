// ===================================================
//  PCOS CARE HUB — Home Page JavaScript
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll Reveal Animation ──────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ── Counter Animation ────────────────────────────
  const counters = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target;
        let current = 0;
        const step = target / 50;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = Math.floor(current) + '%';
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ── Scroll to Top Button ─────────────────────────
  const scrollBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Smooth scroll for anchor links ───────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Navbar scroll effect ─────────────────────────
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 30px rgba(136,14,79,0.4)';
    } else {
      navbar.style.boxShadow = '0 2px 20px rgba(136,14,79,0.3)';
    }
  });

  // ── Symptom tag hover effects ────────────────────
  document.querySelectorAll('.symptom-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05) translateY(-2px)';
    });
    tag.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ── Feature card stagger animation ───────────────
  const featureCards = document.querySelectorAll('.feature-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.5s ease both';
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  featureCards.forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
    card.style.opacity = '0';
    cardObserver.observe(card);
  });

  // ── Parallax on hero decorative circles ──────────
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const deco1 = document.querySelector('.hero-deco-1');
    const deco2 = document.querySelector('.hero-deco-2');
    if (deco1) deco1.style.transform = `translateY(${scrollY * 0.15}px)`;
    if (deco2) deco2.style.transform = `translateY(${-scrollY * 0.1}px)`;
  });

  // ── Research cards stagger ────────────────────────
  document.querySelectorAll('.research-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.05}s`;
  });

  // ── Role cards hover ripple ───────────────────────
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const link = this.querySelector('a');
      if (link) link.click();
    });
    card.style.cursor = 'pointer';
  });

  console.log('%c🌸 PCOS Care Hub', 'color:#C2185B;font-size:18px;font-weight:bold;');
  console.log('%cPUSL3190 | University of Plymouth | Unagollage Wijesinghe', 'color:#7A5980;font-size:12px;');
});
